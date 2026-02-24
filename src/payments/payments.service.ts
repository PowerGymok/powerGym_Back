import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Stripe from 'stripe';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../transactions/transactions.entity';
import {
  UserMembership,
  MembershipStatus,
} from '../user-membership/user-membership.entity';
import { User } from '../users/users.entity';
import { MembershipService } from '../membership/membership.service';
import { TokenPackageService } from '../token-package/token-package.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class PaymentsService {
  // La instancia de Stripe que usamos para hacer llamadas a la API
  private stripe: Stripe;

  constructor(
    private readonly notificationsService: NotificationsService,
    private configService: ConfigService,
    private membershipService: MembershipService,
    private tokenPackageService: TokenPackageService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // DataSource permite hacer transacciones de base de datos (operaciones atómicas)
    // Si una operación falla, todas se revierten. Evita datos inconsistentes.
    private dataSource: DataSource,
  ) {
    // Inicializamos Stripe con la clave secreta del .env
    // apiVersion fija la versión de la API de Stripe para evitar cambios inesperados
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      { apiVersion: '2026-01-28.clover' },
    );
  }

  // ─── COMPRA DE MEMBRESÍA ──────────────────────────────────────────────────
  // Crea un PaymentIntent en Stripe para que el frontend lo complete con la tarjeta
  // Stripe devuelve un clientSecret que el frontend usa con Stripe.js para cobrar
  async createMembershipPaymentIntent(
    userId: string,
    membershipId: string,
  ): Promise<{ clientSecret: string; transactionId: string }> {
    // Verificamos que la membresía existe (lanza 404 si no)
    const membership = await this.membershipService.findOne(membershipId);

    // Creamos el PaymentIntent en Stripe
    // amount va en centavos: $29.99 → 2999
    // currency: 'usd' — cambia a 'cop', 'mxn', etc. según tu país
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(membership.price) * 100),
      currency: 'usd',
      // metadata guarda info adicional en Stripe para poder identificar el pago después
      metadata: { userId, membershipId, type: 'membership' },
    });

    // Guardamos la transacción en estado PENDING (aún no pagó)
    const transaction = this.transactionRepository.create({
      type: TransactionType.MEMBERSHIP_PURCHASE,
      status: TransactionStatus.PENDING,
      amount: membership.price,
      stripePaymentIntentId: paymentIntent.id,
      description: `Membresía ${membership.name}`,
      user: { id: userId } as User,
    });
    await this.transactionRepository.save(transaction);

    return {
      clientSecret: paymentIntent.client_secret || '',
      transactionId: transaction.id,
    };
  }

  // ─── CONFIRMAR PAGO DE MEMBRESÍA ──────────────────────────────────────────
  // Lo llama el webhook de Stripe cuando el pago fue exitoso
  // O lo puede llamar el controlador si verificas el estado del PaymentIntent manualmente
  async confirmMembershipPayment(stripePaymentIntentId: string): Promise<void> {
    // DataSource.transaction() garantiza que todas estas operaciones son atómicas:
    // Si cualquiera falla, se hace rollback de todo. Así no queda el pago confirmado
    // sin que se haya creado la membresía del usuario.
    await this.dataSource.transaction(async (manager) => {
      // Verificamos el pago directamente con Stripe (nunca confíes solo en el frontend)
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        stripePaymentIntentId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('El pago no fue completado en Stripe');
      }

      const { userId, membershipId } = paymentIntent.metadata;

      // Buscamos la membresía para saber cuántos días de acceso dar
      const membership = await this.membershipService.findOne(membershipId);

      //Busqueda del usuario para enviar la notificación
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new BadRequestException('Usuario no encontrado');

      // Calculamos las fechas de inicio y fin de la suscripción
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + membership.durationDays);

      // Creamos el registro de suscripción del usuario
      const userMembership = manager.create(UserMembership, {
        startDate,
        endDate,
        status: MembershipStatus.ACTIVE,
        stripePaymentIntentId,
        pricePaid: membership.price,
        user: { id: userId } as User,
        membership: { id: membershipId },
      });
      await manager.save(userMembership);

      // Actualizamos la transacción a COMPLETED
      await manager.update(
        Transaction,
        { stripePaymentIntentId },
        { status: TransactionStatus.COMPLETED },
      );

      await this.notificationsService.confirmMembershipEmail(
        user.name,
        user.email,
        membership.name,
        membership.price,
        endDate,
      );
    });
  }

  // ─── COMPRA DE TOKENS ────────────────────────────────────────────────────
  // Igual que membresía: crea un PaymentIntent y el frontend lo completa
  async createTokenPurchaseIntent(
    userId: string,
    packageId: string,
  ): Promise<{ clientSecret: string; transactionId: string }> {
    const pkg = await this.tokenPackageService.findOne(packageId);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(pkg.price) * 100),
      currency: 'usd',
      metadata: { userId, packageId, type: 'token_purchase' },
    });

    const transaction = this.transactionRepository.create({
      type: TransactionType.TOKEN_PURCHASE,
      status: TransactionStatus.PENDING,
      amount: pkg.price,
      tokenAmount: pkg.tokenAmount,
      stripePaymentIntentId: paymentIntent.id,
      description: `Compra paquete: ${pkg.name} (${pkg.tokenAmount} tokens)`,
      user: { id: userId } as User,
      tokenPackage: { id: packageId },
    });
    await this.transactionRepository.save(transaction);

    return {
      clientSecret: paymentIntent.client_secret || '',
      transactionId: transaction.id,
    };
  }

  // ─── CONFIRMAR COMPRA DE TOKENS ──────────────────────────────────────────
  async confirmTokenPurchase(stripePaymentIntentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        stripePaymentIntentId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('El pago no fue completado en Stripe');
      }

      const { userId, packageId } = paymentIntent.metadata;
      const pkg = await this.tokenPackageService.findOne(packageId);

      //Busqueda del usuario para enviar la notificación
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new BadRequestException('Usuario no encontrado');

      // increment suma los tokens al balance actual sin necesidad de leer el valor primero
      // Es más seguro porque evita condiciones de carrera si dos peticiones llegan a la vez
      await manager.increment(
        User,
        { id: userId },
        'tokenBalance',
        pkg.tokenAmount,
      );

      await manager.update(
        Transaction,
        { stripePaymentIntentId },
        { status: TransactionStatus.COMPLETED },
      );

      await this.notificationsService.confirmTokenEmail(
        user.name,
        user.email,
        pkg.name,
        pkg.tokenAmount,
      );
    });
  }

  // ─── GASTAR TOKENS INTERNAMENTE ──────────────────────────────────────────
  // El usuario usa sus tokens para pagar algo dentro de la app (sin pasar por Stripe)
  async spendTokens(
    userId: string,
    amount: number,
    description: string,
  ): Promise<{ newBalance: number }> {
    // Verificamos que el usuario tiene suficientes tokens ANTES de gastarlos
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.tokenBalance < amount) {
      throw new BadRequestException(
        `Tokens insuficientes. Tienes ${user.tokenBalance}, necesitas ${amount}`,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      // decrement resta tokens del balance
      await manager.decrement(User, { id: userId }, 'tokenBalance', amount);

      // Registramos el gasto en el historial de transacciones
      const transaction = manager.create(Transaction, {
        type: TransactionType.TOKEN_SPEND,
        status: TransactionStatus.COMPLETED, // Los gastos internos siempre son inmediatos
        tokenAmount: amount,
        description,
        user: { id: userId } as User,
      });
      await manager.save(transaction);
    });
    await this.notificationsService.spendTokenEmail(
      user.name,
      user.email,
      amount,
      user.tokenBalance - amount,
      description,
    );

    return { newBalance: user.tokenBalance - amount };
  }

  // ─── HISTORIAL DE TRANSACCIONES ──────────────────────────────────────────
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      // relations carga las relaciones indicadas en la misma query (JOIN)
      relations: ['tokenPackage'],
      order: { createdAt: 'DESC' }, // Las más recientes primero
    });
  }

  // ─── WEBHOOK DE STRIPE ───────────────────────────────────────────────────
  // Stripe llama este endpoint automáticamente cuando ocurre un evento
  // Es la forma más confiable de confirmar pagos (no depende del frontend)
  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      // constructEvent verifica que el webhook viene realmente de Stripe
      // STRIPE_WEBHOOK_SECRET lo obtienes en el dashboard de Stripe
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '',
      );
    } catch {
      throw new BadRequestException('Webhook signature inválida');
    }

    // Procesamos solo los eventos que nos interesan
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;

      // Según el tipo de pago guardado en metadata, llamamos al método correcto
      if (pi.metadata.type === 'membership') {
        await this.confirmMembershipPayment(pi.id);
      } else if (pi.metadata.type === 'token_purchase') {
        await this.confirmTokenPurchase(pi.id);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      await this.transactionRepository.update(
        { stripePaymentIntentId: pi.id },
        { status: TransactionStatus.FAILED },
      );
    }
  }
}

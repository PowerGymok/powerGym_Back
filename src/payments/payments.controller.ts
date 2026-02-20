import * as common from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { PurchaseMembershipDto } from './dto/purchase-membership.dto';
import { PurchaseTokensDto } from './dto/spend-tokens.dto';
import { SpendTokensDto } from './dto/spend-tokens.dto';

@ApiTags('Payments')
@common.Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /payments/membership — Inicia el pago de una membresía
  // Devuelve el clientSecret que el frontend usa con Stripe.js para cobrar la tarjeta
  @common.Post('membership')
  @ApiOperation({ summary: 'Iniciar pago de membresía con Stripe' })
  createMembershipPayment(@common.Body() dto: PurchaseMembershipDto) {
    return this.paymentsService.createMembershipPaymentIntent(
      dto.userId,
      dto.membershipId,
    );
  }

  // POST /payments/tokens — Inicia la compra de un paquete de tokens
  @common.Post('tokens')
  @ApiOperation({ summary: 'Iniciar compra de paquete de tokens con Stripe' })
  createTokenPurchase(@common.Body() dto: PurchaseTokensDto) {
    return this.paymentsService.createTokenPurchaseIntent(
      dto.userId,
      dto.packageId,
    );
  }

  // POST /payments/tokens/spend — Gasta tokens internamente (sin Stripe)
  // Ejemplo: reservar una clase especial que cuesta 50 tokens
  @common.Post('tokens/spend')
  @ApiOperation({ summary: 'Gastar tokens en la app (reservas, etc.)' })
  spendTokens(@common.Body() dto: SpendTokensDto) {
    return this.paymentsService.spendTokens(
      dto.userId,
      dto.amount,
      dto.description,
    );
  }

  // GET /payments/history/:userId — Historial de transacciones del usuario
  @common.Get('history/:userId')
  @ApiOperation({ summary: 'Ver historial de transacciones de un usuario' })
  getHistory(@common.Param('userId', common.ParseUUIDPipe) userId: string) {
    return this.paymentsService.getUserTransactions(userId);
  }

  // POST /payments/webhook — Stripe llama aquí automáticamente cuando ocurre un pago
  // IMPORTANTE: Esta ruta debe recibir el body como buffer RAW (sin parsear a JSON)
  // Stripe necesita el payload original para verificar la firma de seguridad
  @common.Post('webhook')
  @ApiOperation({ summary: 'Webhook de Stripe (no llamar manualmente)' })
  handleWebhook(
    @common.Req() req: common.RawBodyRequest<Request>,
    @common.Headers('stripe-signature') signature: string,
  ) {
    // req.rawBody es el buffer original antes de que NestJS lo parsee
    if (!req.rawBody) {
      throw new Error('Raw body is missing');
    }
    return this.paymentsService.handleStripeWebhook(req.rawBody, signature);
  }
}

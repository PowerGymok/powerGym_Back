/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Repository } from 'typeorm';
import { usersRepository } from 'src/users/users.repository';
import { ClassScheduleRepository } from 'src/class_schedule/class_schedule.repository';
import { User } from 'src/users/users.entity';
import { Class } from 'src/class/class.entity';
import { ChatService } from 'src/chat/chat.service';

@Injectable({})
export class ReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @Inject(forwardRef(() => usersRepository))
    private usersRepository: usersRepository,
    private readonly classScheduleRepository: ClassScheduleRepository,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
    private readonly chatService: ChatService,
  ) {}

  // Devuelve todas las reservas Confirmed de un class_schedule específico
  async find_reservation_by_class_schedule(class_schedule_id: string) {
    return await this.reservationRepository.find({
      relations: ['users'],
      where: {
        class_schedule: { id: class_schedule_id },
        status: 'Confirmed',
      },
    });
  }

  async find_reservation_by_id(id: string) {
    return await this.reservationRepository.findOne({
      where: { id },
      relations: ['class_schedule', 'class_schedule.class', 'users'],
    });
  }

  async create_reserve(id_user: string, id_class_schedule: string) {
    const find_user = await this.usersRepository.getUserById(id_user);
    const find_class_schedule =
      await this.classScheduleRepository.find_class_schedule_by_id(
        id_class_schedule,
      );

    if (!find_class_schedule) {
      throw new NotFoundException('La clase agendada no existe');
    }

    // Validar cupos — contamos reservas Confirmed activas para este schedule
    // NO tocamos capacity — es el total original y no debe cambiar nunca
    const confirmedCount = await this.reservationRepository.count({
      where: {
        class_schedule: { id: id_class_schedule },
        status: 'Confirmed',
      },
    });

    const capacity = parseInt(find_class_schedule.class.capacity as any, 10);
    if (confirmedCount >= capacity) {
      throw new UnauthorizedException(
        'No hay más cupos disponibles para la clase',
      );
    }

    // Validar tokens
    const class_cost_tokens = find_class_schedule.token;
    const user_tokens = find_user.tokenBalance;

    if (user_tokens < class_cost_tokens) {
      throw new UnauthorizedException(
        'No tienes tokens suficientes para reservar esta clase',
      );
    }

    // Descontar tokens
    await this.usersRepo.update(find_user.id, {
      tokenBalance: user_tokens - class_cost_tokens,
    });

    // Crear reserva
    const new_reservation = this.reservationRepository.create({
      date: new Date(),
      users: find_user,
      class_schedule: find_class_schedule,
      status: 'Confirmed',
    });

    await this.reservationRepository.save(new_reservation);

    await this.chatService.createConversationIfNotExists(
      find_user.id,
      find_class_schedule.coach.id,
      find_class_schedule.id,
    );

    return {
      success: true,
      message: 'Reservación realizada correctamente',
      reservation_id: new_reservation.id,
    };
  }

  async cancel_reserve(id: string, userId: string) {
    const find_reservation = await this.find_reservation_by_id(id);

    if (!find_reservation) {
      throw new NotFoundException('No se encontró la reservación');
    }

    if (find_reservation.users.id !== userId) {
      throw new ForbiddenException(
        'No puedes cancelar una reserva que no es tuya',
      );
    }

    if (find_reservation.status === 'Cancelled') {
      throw new ForbiddenException('La reserva ya fue cancelada anteriormente');
    }

    // Cancelar reserva
    await this.reservationRepository.update({ id }, { status: 'Cancelled' });

    // Devolver tokens con expresión SQL atómica
    const tokens_to_refund = find_reservation.class_schedule.token;

    await this.usersRepo.update(find_reservation.users.id, {
      tokenBalance: () => `"tokenBalance" + ${tokens_to_refund}`,
    });

    return {
      success: true,
      message: 'Reservación cancelada. Tokens devueltos correctamente.',
      tokens_refunded: tokens_to_refund,
    };
  }

  async get_by_id(id: string) {
    const reservations = await this.reservationRepository.find({
      where: { users: { id } },
      relations: ['class_schedule'],
      select: {
        id: true,
        date: true,
        status: true,
        class_schedule: {
          id: true,
          date: true,
          time: true,
          token: true,
          isActive: true,
          coach: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return reservations ?? [];
  }

  async get_reservation_by_coach(coachId: string) {
    const reservations = await this.reservationRepository.find({
      where: {
        class_schedule: {
          coach: { id: coachId },
        },
        status: 'Confirmed',
      },
      relations: [
        'users',
        'Class_schedule',
        'Class_schedule.class',
        'Class_schedule.coach',
      ],
      select: {
        id: true,
        date: true,
        status: true,
        users: {
          id: true,
          name: true,
          email: true,
        },
        class_schedule: {
          id: true,
          date: true,
          time: true,
          coach: { id: true, name: true },
          class: {
            id: true,
            name: true,
          },
        },
      },
    });

    return reservations ?? [];
  }

  get_reserves() {
    return this.reservationRepository.find({
      relations: ['class_schedule', 'users'],
      select: {
        id: true,
        date: true,
        status: true,
        class_schedule: {
          id: true,
          date: true,
          time: true,
          token: true,
          isActive: true,
        },
        users: { id: true },
      },
    });
  }
}

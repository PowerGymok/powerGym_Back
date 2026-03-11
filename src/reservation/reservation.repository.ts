import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Repository } from 'typeorm';

@Injectable({})
export class ReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async find_reservation_by_class_schedule(class_schedule_id: string) {
    return await this.reservationRepository.find({
      relations: ['users'],
      where: {
        class_schedule: { id: class_schedule_id }, // Tomamos su id
        status: 'Confirmed', // Solo devolvemos a los no cancelados
      },
    });
  }

  async find_reservation_by_id(id: string) {
    const find_reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['class_schedule', 'users'],
      select: {
        id: true,
        date: true,
        status: true,
        users: {
          id: true,
        },
      },
    });

    if (!find_reservation) {
      throw new NotFoundException(
        `No se encontro la reservación con el id ${id}`,
      );
    }

    if (find_reservation.status === 'Cancelled') {
      throw new BadRequestException(
        `La reservación que intenta buscar con el id ${id} fue cancelada`,
      );
    }

    return find_reservation;
  }

  async find_exist_reservation(id_user: string, id_class_schedule: string) {
    const existing_reservation = await this.reservationRepository.findOne({
      where: {
        users: { id: id_user },
        class_schedule: { id: id_class_schedule },
        status: 'Confirmed',
      },
    });

    if (existing_reservation) {
      throw new BadRequestException('Ya tenés una reserva para esta clase');
    }
  }

  async save_reservation(data: Partial<Reservation>): Promise<Reservation> {
    const created = this.reservationRepository.create(data);

    return await this.reservationRepository.save(created);
  }

  async cancel_reserve(id: string, userId: string) {
    const find_reservation = await this.find_reservation_by_id(id);

    if (!find_reservation) {
      throw new NotFoundException(
        `No se encontro una reservación con id ${id}`,
      );
    }

    if (find_reservation.users.id !== userId) {
      throw new ForbiddenException(
        'No puedes cancelar una reserva que no es tuya',
      );
    }

    const a = await this.reservationRepository.update(
      { id },
      { status: 'Cancelled' },
    );
    console.log(a);

    return {
      success: true,
      message: 'Reservación cancelada correctamente',
    };
  }

  async get_by_id(id: string) {
    const reservations = await this.reservationRepository.find({
      where: {
        users: { id },
      },
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
        },
      },
    });

    if (!reservations || reservations.length === 0) {
      throw new NotFoundException('El usuario no tiene reservas registradas');
    }

    return reservations;
  }

  get_reserves() {
    return this.reservationRepository.find({
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
        },
      },
    });
  }
}

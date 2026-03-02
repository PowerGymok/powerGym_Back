import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Repository } from 'typeorm';
import { usersRepository } from 'src/users/users.repository';
import { ClassScheduleRepository } from 'src/class_schedule/class_schedule.repository';
import { User } from 'src/users/users.entity';
import { Class } from 'src/class/class.entity';

@Injectable({})
export class ReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @Inject(forwardRef(() => usersRepository))
    private usersRepository: usersRepository,
    private readonly classScheduleRepository: ClassScheduleRepository,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  find_reservation_by_id(id: string) {
    return this.reservationRepository.findOne({
      where: { id },
      relations: ['class_schedule'],
      select: {
        id: true,
        date: true,
        status: true,
        users: true,
      },
    });
  }

  async create_reserve(id_user: string, id_class_schedule: string) {
    // Buscamos si el usuario existe y esta activo ESTO ULTIMO AL FINAL IMPLEMENTAR
    const find_user = await this.usersRepository.getUserById(id_user);

    // Buscamos si la cita de la clase existe
    const find_class_schedule =
      await this.classScheduleRepository.find_class_schedule_by_id(
        id_class_schedule,
      );

    if (!find_class_schedule) {
      // Ver si dejarlo ya que el metodo find_class_schedule_by_id ya tiene validacion
      throw new NotFoundException('La clase agendada no existe');
    }

    // Extraemos la capacidad de la clase con class_schedule
    let find_class_by_schedule = find_class_schedule.class.capacity; // Ver si poner let es correcto
    console.log('Para ver que me devuelve', find_class_by_schedule);

    if (find_class_by_schedule <= 0) {
      throw new UnauthorizedException(
        'No hay mas cupos disponibles para la clase',
      );
    }

    // Extraemos el dato de el costo de tokens de la clase
    const class_cost_tokens = find_class_schedule.token; // Ver si poner let es correcto
    let user_tokens = find_user.tokenBalance;
    console.log(user_tokens);
    // Chequeamos que el usuario tengo la cantidad de tokens suficientes para gastar en la clase
    if (user_tokens < class_cost_tokens) {
      throw new UnauthorizedException(
        'No tiene tokens suficientes para acceder a esta clase',
      );
    }

    // Si tiene los tokens suficientes le restamos tokens del usuario
    user_tokens -= class_cost_tokens;
    await this.usersRepo.update(find_user.id, {
      tokenBalance: user_tokens,
    });

    // Restamos el espacio en la clase en - 1 si hay cupo
    find_class_by_schedule -= 1;
    await this.classRepository.update(find_class_schedule.class.id, {
      capacity: find_class_by_schedule,
    });

    const new_reservation = this.reservationRepository.create({
      date: new Date(),
      users: find_user,
      class_schedule: find_class_schedule,
      status: 'Confirmed', // Ya puse en el default, pero no está de más
    });
    await this.reservationRepository.save(new_reservation);

    return {
      success: true,
      message: 'Se realizó la reservación de la clase correctamente',
      reservation_id: new_reservation.id,
    };
  }

  async cancel_reserve(id: string) {
    // Buscamos que exista la reservacion
    const find_reservation = await this.find_reservation_by_id(id);

    if (!find_reservation) {
      throw new NotFoundException('No se encontro una reservación');
    }

    // Cambiamos el estado de la reservacion a cancelado
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

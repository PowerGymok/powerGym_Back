import { BadRequestException, Injectable } from '@nestjs/common';
import { ClassScheduleRepository } from './class_schedule.repository';
import { CreateClassSchedule } from './dtos/CreateClassSchedule.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { DataSource } from 'typeorm';
import { Class_schedule } from './class_schedule.entity';
import { Reservation } from 'src/reservation/reservation.entity';
import { User } from 'src/users/users.entity';
import { coachRepository } from 'src/coach/coach.repository';
import { ClassRepository } from 'src/class/class.repository';
import { ResponseClassSchedule } from './dtos/ResponseClassSchedule.dto';
import { Role } from 'src/common/roles.enum';

@Injectable({})
export class ClassScheduleService {
  constructor(
    private readonly classScheduleRepository: ClassScheduleRepository,
    private readonly classRepository: ClassRepository,
    private readonly coachRepository: coachRepository,
    private dataSource: DataSource,
  ) {}

  classes_history() {
    return this.classScheduleRepository.classes_history();
  }

  async class_appointment(
    clase_app: CreateClassSchedule,
    id: string,
    user: JwtPayload,
  ) {
    // Buscamos la clase base
    const find_class = await this.classRepository.find_class_by_id(id);

    // Validamos que la fecha y la hora de clase que se va a agendar sea valida
    this.time_valid(clase_app.date, clase_app.time);

    const [hours, minutes] = clase_app.time.split(':').map(Number);
    const start_total_minutes = hours * 60 + (minutes || 0);

    // Convertimos la duración de la clase a minutos -- LOS CHICOS CAMBIARON LA DURACION DE LA CLASE YA A MINUTOS
    const duration_in_minutes = parseFloat(find_class.duration) * 60;
    console.log('Duracion de la clase en minutos', duration_in_minutes);

    // Calculamos el final de la clase
    const end_total_minutes = start_total_minutes + duration_in_minutes;

    // Límite de las 18:00 (1080 minutos)
    const limit_minutes = 18 * 60;

    if (end_total_minutes > limit_minutes) {
      const extraMinutes = end_total_minutes - limit_minutes;
      throw new BadRequestException(
        `La clase excede el horario de cierre por ${extraMinutes} minuto(s). Debe terminar máximo a las 18:00.`,
      );
    }

    // Asignamos coach (llamada local)
    const coach_id = user.role === Role.Coach ? user.sub : undefined;
    const assigned_coach = await this.coach_assign(
      clase_app.date,
      clase_app.time,
      coach_id,
    );

    // Guardamos usando el REPOSITORIO
    // Nota: El repo tiene los métodos de TypeORM (save, create, etc)
    const new_schedule = {
      ...clase_app,
      class: find_class,
      coach: assigned_coach,
    };

    const saved_schedule =
      await this.classScheduleRepository.save_new_schedule(new_schedule);

    // Retornamos el objeto Response limpio
    return this.mapToResponse(saved_schedule);
  }

  // Método privado para limpiar la respuesta y no repetir código
  private mapToResponse(schedule: any): ResponseClassSchedule {
    return {
      id: schedule.id,
      date: schedule.date,
      time: schedule.time,
      token: schedule.token,
      isActive: schedule.isActive,
      class: { id: schedule.class.id, name: schedule.class.name },
      coach: {
        id: schedule.coach.id,
        name: schedule.coach.name,
        email: schedule.coach.email,
      },
    };
  }

  async class_appmnt_cancel(id: string) {
    // Buscamos que la clase exista
    const class_schedule =
      await this.classScheduleRepository.find_class_schedule_by_id(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Desactivamos la clase
      await queryRunner.manager.update(Class_schedule, id, {
        isActive: false,
        coach: undefined, // Liberamos al coach para esa fecha/hora
      });

      // Buscamos la reservaciones confirmadas para esta clase
      const reservations = await queryRunner.manager.find(Reservation, {
        where: { class_schedule: { id }, status: 'Confirmed' },
        relations: ['users'],
      });

      // Devolvemos los tokens e inhabilitamos mas reservas
      if (reservations.length > 0) {
        for (const res of reservations) {
          // Devolvemos los tokens a los usuarios
          await queryRunner.manager.increment(
            User,
            { id: res.users.id },
            'tokenBalance',
            class_schedule.token, // Usamos el costo de los token de la clase para devolverle al usuario
          );

          // Cambiamos el estado de la reserva a 'Cancelled'
          await queryRunner.manager.update(Reservation, res.id, {
            status: 'Cancelled',
          });
        }
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: `Clase cancelada y ${reservations.length} reembolso/s procesado/s.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  time_valid(date_appt: Date, time_appt: string) {
    // Normalizamos a la fecha para comparar dias (quitamos hora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // date_appt ya es un objeto Date, pero por seguridad nos aseguramos
    const scheduleDate = new Date(date_appt);
    scheduleDate.setHours(0, 0, 0, 0);

    // Validamos la fecha futura
    if (scheduleDate <= today) {
      throw new BadRequestException(
        'La fecha debe ser posterior al día actual',
      );
    }

    // Validacion de horario
    const time_string = String(time_appt);

    const hour_match = time_string.match(/^(\d{1,2})/);

    if (!hour_match) {
      throw new BadRequestException('Formato de hora inválido. Use HH:mm');
    }

    const hour = parseInt(hour_match[1], 10);
    // Si el string no tiene el formato correcto, hour sera NaN

    if (hour < 10 || hour >= 18) {
      throw new BadRequestException(
        'La clase solo puede agendarse entre las 10:00 y las 18:00 hs',
      );
    }
  }

  async coach_assign(
    date: Date,
    time: string,
    id?: string,
    exclude_id?: string,
  ): Promise<Partial<User>> {
    // Si el que creo la clase es Coach, se asigna a el mismo la clase
    if (id) {
      const coach = await this.coachRepository.getCoachById(id);

      return coach;
    } else {
      // Si no es Coach, o sea Admin se busca el 1er Coach que se encuentre
      const coaches = await this.coachRepository.getAllCoaches(1, 10);

      for (const candidate of coaches) {
        // NUEVO: Si el candidato es el que estamos inhabilitando, lo saltamos
        if (exclude_id && candidate.id === exclude_id) continue;

        // Verificamos disponibilidad del coach
        const is_occupied = await this.dataSource
          .getRepository(Class_schedule)
          .findOne({
            where: { coach: { id: candidate.id }, date, time, isActive: true },
          });

        if (!is_occupied) return candidate;
      }

      throw new BadRequestException(
        'No hay coaches disponibles para este horario',
      );
    }
  }
}

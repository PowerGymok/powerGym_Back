/* eslint-disable @typescript-eslint/no-unsafe-return */
import { InjectRepository } from '@nestjs/typeorm';
import { Class_schedule } from './class_schedule.entity';
import { Repository } from 'typeorm';
import { ClassRepository } from 'src/class/class.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateClassSchedule } from './dtos/CreateClassSchedule.dto';
import { User } from 'src/users/users.entity';
import { Role } from 'src/common/roles.enum';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ResponseClassSchedule } from './dtos/ResponseClassSchedule.dto';

export class ClassScheduleRepository {
  constructor(
    @InjectRepository(Class_schedule)
    private readonly classScheduleRepository: Repository<Class_schedule>,
    private readonly classRepository: ClassRepository,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async find_class_schedule_by_id(id: string) {
    const class_schedule = await this.classScheduleRepository.findOne({
      where: { id },
      relations: ['class'],
    });

    if (!class_schedule)
      throw new NotFoundException(
        `No se encontró la clase agendada con id ${id}`,
      );

    if (class_schedule.isActive === false) {
      throw new NotFoundException(
        `La clase agendada con id ${id} que intenta buscar esta inactiva`,
      );
    }

    return class_schedule;
  }

  async classes_history() {
    const schedules = await this.classScheduleRepository.find({
      relations: ['class', 'reservations', 'coach'],
      select: {
        id: true,
        date: true,
        time: true,
        token: true,
        isActive: true,
        class: {
          id: true,
          name: true,
          duration: true,
          capacity: true,
        },
        coach: {
          id: true,
          name: true,
          email: true,
        },
      },
    });

    const result: any[] = [];

    for (const schedule of schedules) {
      const activeReservations = schedule.reservations.filter(
        (r) => r.status === 'Confirmed',
      ).length;

      result.push({
        ...schedule,
        spaces_available: schedule.class.capacity - activeReservations,
      });
    }
    return result;
  }

  async class_appmnt(
    clase_app: CreateClassSchedule,
    id: string,
    user: JwtPayload,
  ) {
    // Buscamos la clase
    const find_class = await this.classRepository.find_class_by_id(id);

    // Validamos que la fecha y la hora de clase que se va a agendar sea valida
    this.time_valid(clase_app.date, clase_app.time);

    // Convertimos la hora de inicio a minutos totales
    // Ejemplo: "17:01" -> (17 * 60) + 01 = 1021 minutos
    const [hours, minutes] = clase_app.time.split(':').map(Number);
    const start_total_minutes = hours * 60 + (minutes || 0);

    //Convertimos La duración a minutos (asumiendo que duración está en horas)
    // Ejemplo: "1" hora -> 60 minutos
    const duration_in_minutes = parseFloat(find_class.duration) * 60;

    // Calculamos el final en minutos
    const end_total_minutes = start_total_minutes + duration_in_minutes;

    // Definimos el límite de las 18:00 en minutos
    // 18 * 60 = 1080 minutos
    const limit_minutes = 18 * 60;

    // Validamos
    if (end_total_minutes > limit_minutes) {
      const extraMinutes = end_total_minutes - limit_minutes;
      throw new BadRequestException(
        `La clase excede el horario de cierre por ${extraMinutes} minuto(s). Debe terminar máximo a las 18:00.`,
      );
    }

    // Asignamos un coach a cita de la clase
    const coach_id = user.role === Role.Coach ? user.sub : undefined;

    // Si es Admin quien hace la cita entonces se va a encargar de buscar un coach
    const assigned_coach = await this.coach_assign(
      clase_app.date,
      clase_app.time,
      coach_id,
    );

    // Creamos la cita con datos requeridos y la clase encontrada, posteriormente la guardamos
    const new_schedule = this.classScheduleRepository.create({
      ...clase_app,
      class: find_class,
      coach: assigned_coach,
    });

    const saved_schedule =
      await this.classScheduleRepository.save(new_schedule);

    // Construimos el objeto de respuesta "limpio"
    const response: ResponseClassSchedule = {
      id: saved_schedule.id,
      date: saved_schedule.date,
      time: saved_schedule.time,
      token: saved_schedule.token,
      isActive: saved_schedule.isActive,
      class: {
        id: saved_schedule.class.id,
        name: saved_schedule.class.name,
      },
      coach: {
        id: saved_schedule.coach.id,
        name: saved_schedule.coach.name,
        email: saved_schedule.coach.email,
      },
    };

    return response;
  }

  async class_appmnt_cancel(id: string) {
    // Buscamos la clase agendada
    await this.find_class_schedule_by_id(id); // Probar que funcione

    await this.classScheduleRepository.update({ id }, { isActive: false });

    return {
      success: true,
      message: 'Clase agendada cancelada correctamente',
    };
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

  async coach_assign(date: Date, time: string, id?: string): Promise<User> {
    let coach: User | null;

    // Si el que creo la clase es Coach se asigna a el mismo
    if (id) {
      coach = await this.usersRepository.findOne({
        where: { id, role: Role.Coach },
      });

      if (!coach) {
        throw new NotFoundException(
          `El coach con ID ${id} no existe o no tiene permisos de coach`,
        );
      }
      return coach;
    } else {
      // Si no es Coach, o sea Admin se busca el 1er Coach que se encuentre
      const coaches = await this.usersRepository.find({
        where: { role: Role.Coach },
      });

      for (const candidate of coaches) {
        const is_occupied = await this.classScheduleRepository.findOne({
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

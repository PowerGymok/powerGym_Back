import { InjectRepository } from '@nestjs/typeorm';
import { Class_schedule } from './class_schedule.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class ClassScheduleRepository {
  constructor(
    @InjectRepository(Class_schedule)
    private readonly classScheduleRepository: Repository<Class_schedule>,
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

  classes_history() {
    return this.classScheduleRepository.find({
      relations: ['class'],
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
      },
    });
  }

  /*
  async class_appmnt(
    clase_app: CreateClassSchedule,
    id: string,
    user: JwtPayload,
  ) {
    // Buscamos la clase
    const find_class = await this.classRepository.find_class_by_id(id);

    // Validamos que la fecha y la hora de clase que se va a agendar sea valida
    this.classScheduleService.time_valid(clase_app.date, clase_app.time);

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
    const assigned_coach = await this.classScheduleService.coach_assign(
      clase_app.date,
      clase_app.time,
      coach_id, // Ver si esta bien este id
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
  */

  async save_new_schedule(data: any) {
    const created = this.classScheduleRepository.create(data);

    return await this.classScheduleRepository.save(created);
  }
}

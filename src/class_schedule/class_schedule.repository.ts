import { InjectRepository } from '@nestjs/typeorm';
import { Class_schedule } from './class_schedule.entity';
import { Repository } from 'typeorm';
import { ClassRepository } from 'src/class/class.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateClassSchedule } from './dtos/CreateClassSchedule.dto';
import { User } from 'src/users/users.entity';
import { Role } from 'src/common/roles.enum';

export class ClassScheduleRepository {
  constructor(
    @InjectRepository(Class_schedule)
    private readonly classScheduleRepository: Repository<Class_schedule>,
    private readonly classRepository: ClassRepository,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

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

  async class_appmnt(clase_app: CreateClassSchedule, id: string) {
    // // Buscamos la clase
    const find_class = await this.classRepository.find_class_by_id(id);

    if (!find_class) {
      throw new NotFoundException('Clase no encontrada');
    }

    // Validamos que la fecha y la hora de clase que se va a agendar sea valida
    this.time_valid(clase_app.date, clase_app.time);

    // Asignamos un coach a la clase
    const coach = await this.coach_assign();

    // Creamos la cita con datos requeridos y la clase encontrada, posteriormente la guardamos
    const new_schedule = this.classScheduleRepository.create({
      ...clase_app,
      class: find_class,
      coach: coach,
    });

    return await this.classScheduleRepository.save(new_schedule);
  }

  async class_appmnt_cancel(id: string) {
    // Buscamos la clase agendada
    const find_appoint = await this.classScheduleRepository.findOne({
      where: { id },
    });

    if (!find_appoint) {
      throw new NotFoundException('Clase agendada no encontrada');
    }

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

    console.log(`Validando hora: Recibido="${time_appt}", Procesado=${hour}`);
    // Si el string no tiene el formato correcto, hour sera NaN

    if (hour < 10 || hour >= 18) {
      throw new BadRequestException(
        'La clase solo puede agendarse entre las 10:00 y las 18:00 hs',
      );
    }
  }

  async coach_assign(): Promise<User> {
    const coach = await this.usersRepository.findOne({
      where: { role: Role.Coach },
    });

    if (!coach) {
      throw new NotFoundException('No hay un coach disponible');
    }

    return coach;
  }

  // Poner validaciones: si el horario de la duracion de la clase supera las 18 hs no se pude asignar cita, si la clase esta cancelada no se puede sacar una cita
}

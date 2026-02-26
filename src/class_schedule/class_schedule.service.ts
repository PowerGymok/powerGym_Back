import { Injectable } from '@nestjs/common';
import { ClassScheduleRepository } from './class_schedule.repository';
import { CreateClassSchedule } from './dtos/CreateClassSchedule.dto';

@Injectable({})
export class ClassScheduleService {
  constructor(
    private readonly classScheduleRepository: ClassScheduleRepository,
  ) {}

  classes_history() {
    return this.classScheduleRepository.classes_history();
  }

  class_appointment(clase_app: CreateClassSchedule, id: string) {
    return this.classScheduleRepository.class_appmnt(clase_app, id);
  }

  class_cancel(id: string) {
    return this.classScheduleRepository.class_appmnt_cancel(id);
  }
}

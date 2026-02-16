import { Injectable } from '@nestjs/common';
import { ClassScheduleRepository } from './class_schedule.repository';

@Injectable({})
export class ClassScheduleService {
  constructor(
    private readonly classScheduleRepository: ClassScheduleRepository,
  ) {}

  class_appointment(id: string) {
    return this.classScheduleRepository.class_appmnt(id);
  }
}

import { Injectable } from '@nestjs/common';
import { ClassScheduleRepository } from './class_schedule.repository';

@Injectable({})
export class ClassScheduleService {
  constructor(
    private readonly classScheduleRepository: ClassScheduleRepository,
  ) {}
}

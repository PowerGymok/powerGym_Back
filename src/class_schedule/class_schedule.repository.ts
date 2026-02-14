import { InjectRepository } from '@nestjs/typeorm';
import { Class_schedule } from './class_schedule.entity';
import { Repository } from 'typeorm';

export class ClassScheduleRepository {
  constructor(
    @InjectRepository(Class_schedule)
    private readonly classScheduleRepository: Repository<Class_schedule>,
  ) {}
}

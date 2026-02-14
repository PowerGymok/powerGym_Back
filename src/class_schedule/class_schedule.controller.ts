import { Controller } from '@nestjs/common';
import { ClassScheduleService } from './class_schedule.service';

@Controller('class_schedule')
export class ClassesScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}
}

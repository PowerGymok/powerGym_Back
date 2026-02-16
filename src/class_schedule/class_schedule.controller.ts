import { Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ClassScheduleService } from './class_schedule.service';

@Controller('class_schedule')
export class ClassesScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  @Post('appointment')
  class_appointment_reserve(@Param('id_class', ParseUUIDPipe) id: string) {
    return this.classScheduleService.class_appointment(id);
  }
}

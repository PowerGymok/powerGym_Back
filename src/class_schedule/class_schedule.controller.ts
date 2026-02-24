import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassScheduleService } from './class_schedule.service';
import { CreateClassSchedule } from './dtos/CreateClassSchedule.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('class_schedule')
export class ClassesScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  @Roles(Role.Coach, Role.Admin, Role.User)
  @UseGuards(RolesGuard)
  @Get('history')
  @HttpCode(200)
  classes_user_history() {
    return this.classScheduleService.classes_history();
  }

  @Roles(Role.Coach, Role.Admin)
  @UseGuards(RolesGuard)
  @Post('appointment')
  @HttpCode(201)
  class_appointment_reserve(
    @Body() clase_app: CreateClassSchedule,
    @Query('id_class', ParseUUIDPipe) id: string,
  ) {
    return this.classScheduleService.class_appointment(clase_app, id);
  }

  @Roles(Role.Coach, Role.Admin)
  @UseGuards(RolesGuard)
  @Put('cancel')
  class_appointment_cancel(@Param('id_class', ParseUUIDPipe) id: string) {
    return this.classScheduleService.class_cancel(id);
  }
}

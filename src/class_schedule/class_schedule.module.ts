import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class_schedule } from './class_schedule.entity';
import { ClassesScheduleController } from './class_schedule.controller';
import { ClassScheduleService } from './class_schedule.service';
import { ClassScheduleRepository } from './class_schedule.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Class_schedule])],
  controllers: [ClassesScheduleController],
  providers: [ClassScheduleService, ClassScheduleRepository],
  exports: [ClassScheduleService, ClassScheduleRepository],
})
export class ClassSchedule {}

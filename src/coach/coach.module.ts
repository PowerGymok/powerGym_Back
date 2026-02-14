import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { coachRepository } from './coach.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [CoachController],
  providers: [CoachService, coachRepository],
  exports: [coachRepository],
})
export class CoachModule {}

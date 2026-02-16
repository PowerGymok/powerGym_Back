import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { ClassRepository } from './class.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Class])],
  controllers: [ClassController],
  providers: [ClassService, ClassRepository],
  exports: [ClassService, ClassRepository],
})
export class ClassModule {}

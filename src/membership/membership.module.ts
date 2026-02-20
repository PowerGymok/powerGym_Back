import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './membership.entity';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';

@Module({
  // forFeature registra la entidad SOLO para este módulo
  // Gracias a autoLoadEntities en app.module, TypeORM ya sabe de esta entidad
  imports: [TypeOrmModule.forFeature([Membership])],
  controllers: [MembershipController],
  providers: [MembershipService],
  // Exporte el service para que PaymentsModule lo pueda usar
  exports: [MembershipService],
})
export class MembershipModule {}

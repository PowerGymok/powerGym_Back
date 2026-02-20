import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenPackage } from './token-package.entity';
import { TokenPackageService } from './token-package.service';
import { TokenPackageController } from './token-package.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TokenPackage])],
  controllers: [TokenPackageController],
  providers: [TokenPackageService],
  // Exportamos el service para que PaymentsModule pueda saber el precio de un paquete
  exports: [TokenPackageService],
})
export class TokenPackageModule {}

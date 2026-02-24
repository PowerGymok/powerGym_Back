import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenPackage } from './token-package.entity';
import { TokenPackageService } from './token-package.service';
import { TokenPackageController } from './token-package.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenPackage]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [TokenPackageController],
  providers: [TokenPackageService],
  // Exportamos el service para que PaymentsModule pueda saber el precio de un paquete
  exports: [TokenPackageService],
})
export class TokenPackageModule {}

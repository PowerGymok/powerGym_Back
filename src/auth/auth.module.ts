import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { CoachModule } from '../coach/coach.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => CoachModule),

    // Passport necesario para AuthGuard('google')
    PassportModule,

    ConfigModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],

  providers: [AuthService, GoogleStrategy],

  exports: [JwtModule],
})
export class AuthModule {}

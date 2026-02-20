import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { CoachModule } from './coach/coach.module';
import { ClassScheduleModule } from './class_schedule/class_schedule.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { MembershipModule } from './membership/membership.module';
import { TokenPackageModule } from './token-package/token-package.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        // autoLoadEntities: true hace que TypeORM registre automáticamente
        // todas las entidades que aparezcan en TypeOrmModule.forFeature([...])
        // de cualquier módulo importado aca. No necesitamos listarlas manualmente.
        autoLoadEntities: true,
        synchronize: true, // solo en desarrollo, en producción usamos migraciones
        ssl: { rejectUnauthorized: false },
      }),
    }),

    ClassScheduleModule,
    UsersModule,
    AuthModule,
    ClassModule,
    CoachModule,
    MembershipModule,
    TokenPackageModule,
    PaymentsModule,
  ],
})
export class AppModule {}

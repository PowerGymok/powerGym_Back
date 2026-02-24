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
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    //  GOOGLE (IMPORTANTE):
    // Acá es donde se carga el .env para TODA la app.
    // GoogleStrategy usa ConfigService.get('GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL').
    // Si esto NO estuviera (o no fuera global), ConfigService podría devolver undefined
    // y Google responde con: invalid_client.
    // isGlobal:true = todos los módulos (AuthModule incluido) pueden leer variables del .env.
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
        synchronize: false, // False solo en desarrollo, en producción usamos migraciones
        ssl: { rejectUnauthorized: false },
      }),
    }),

    //  GOOGLE (IMPORTANTE):
    // Cuando Nest carga AuthModule, ahí se crea GoogleStrategy.
    // En ese momento GoogleStrategy lee del .env:
    // - GOOGLE_CLIENT_ID
    // - GOOGLE_CLIENT_SECRET
    // - GOOGLE_CALLBACK_URL
    // Si el server no se reinició después de setear el .env,
    // puede quedar leyendo valores viejos/undefined.
    ClassScheduleModule,
    UsersModule,
    AuthModule,
    ClassModule,
    CoachModule,
    MembershipModule,
    TokenPackageModule,
    PaymentsModule,
    ChatModule,
  ],
})
export class AppModule {}

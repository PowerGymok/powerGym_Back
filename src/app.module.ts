import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { CoachModule } from './coach/coach.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { ClassScheduleModule } from './class_schedule/class_schedule.module';

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
        url: config.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    ClassScheduleModule,
    UsersModule,
    AuthModule,
    ClassModule,
    CoachModule,
  ],
})
export class AppModule {}

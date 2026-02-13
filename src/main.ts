import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefaultResultOrder } from 'dns';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  setDefaultResultOrder('ipv4first');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
  console.log('App listening in port 3000');
}
bootstrap();

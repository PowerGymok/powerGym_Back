import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerGlobal } from './middleware/logger.middleware';
import { setDefaultResultOrder } from 'dns';

async function bootstrap() {
  setDefaultResultOrder('ipv4first');

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(LoggerGlobal);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`App listening on port ${port}`);
}
void bootstrap();

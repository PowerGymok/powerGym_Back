import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Necesario para el webhook de Stripe
  });

  // Configurar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de Swagger (documentación de API)
  const config = new DocumentBuilder()
    .setTitle('PowerGym API')
    .setDescription('API del sistema de gimnasio con pagos y chat')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en puerto ${port}`);
  console.log(`📚 Documentación en http://localhost:${port}/api`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips fields not in the DTO
      forbidNonWhitelisted: true, // throws error if unknown fields are sent
      transform: true, // auto-transforms types (e.g., string "1" → number 1)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo Shop API')
    .setDescription(
      'REST API for the Teslo Shop store: product catalog, JWT authentication, product image upload and database seeding.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description:
          'JWT issued by POST /api/auth/register or POST /api/auth/login. Valid for 2 hours. Paste the raw token — Swagger UI adds the "Bearer " prefix.',
      },
      'access-token',
    )
    .addTag('Products', 'Product catalog: create, search, update and delete products.')
    .addTag('Auth', 'Registration, login and token status/refresh.')
    .addTag('Files', 'Product image upload and static delivery.')
    .addTag('Seed', 'Destructive development helper that wipes and repopulates the database.')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, documentFactory, {
    jsonDocumentUrl: 'api/docs-json',
    yamlDocumentUrl: 'api/docs-yaml',
    customSiteTitle: 'Teslo Shop API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      displayRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

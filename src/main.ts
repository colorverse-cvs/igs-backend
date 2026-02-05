import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const cfg = app.get(ConfigService);
  const prefix = `${cfg.get<string>('app.prefix')}/${cfg.get<string>('app.version')}`;
  const port = cfg.get<number>('app.PORT') || 3000;

  // CORS configuration
  const corsEnv = cfg.get<string>('app.CORS_ORIGINS') || 'https://ishitagallery.com,https://www.ishitagallery.com';

  app.enableCors({
    origin: corsEnv.split(',').map((s) => s.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  app.use(compression());
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  app.use(cookieParser());

  // ✅ Set global prefix for all APIs
  app.setGlobalPrefix(prefix);

  // ✅ Validation setup
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 🌍 Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // ✅ Global Validation
  app.useGlobalPipes(new ValidationPipe());

  // ✨ Global Response Wrapper
  app.useGlobalInterceptors(new TransformInterceptor());


  // Serve static files (e.g., uploaded images)
  app.use('/public', express.static(join(process.cwd(), 'uploads')));

  // ✅ Swagger setup
  const config = new DocumentBuilder()
    .setTitle('GiftShop API')
    .setDescription('API documentation for the GiftShop backend')
    .setVersion('1.0')
    .addBearerAuth() // Adds JWT auth header option
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // keeps Bearer token in Swagger UI
      withCredentials: true // allow swagger to send cookies
    },
  });


  await app.listen(port);
  console.log(`🚀 GiftShop API running on http://localhost:${port}`);
  console.log(`📘 Swagger Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();

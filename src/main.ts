import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { urlToHttpOptions } from 'url';
import { urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  

  // sentry 초기 설정
  Sentry.init({
    dsn: configService.get<string>('SENTRY_DSN'),
  });

  // CORS 설정
  const corsEnabled = configService.get<string>('CORS_ENABLED') === 'true';
  if (corsEnabled) {
    app.enableCors({
      origin: configService.get<string>('FRONTEND_URL'),
      credentials: true,
    });
  }
  // app.enableCors(corsOptions);
  // app.useWebSocketAdapter(new IoAdapter(app));


  app.use(cookieParser());
  app.use(urlencoded({ extended: true }))

  const port = configService.get<number>('PORT') || 3001;

  // 글로벌 URL 프리픽스 설정
  app.setGlobalPrefix('api', { exclude: ['/health-check'] });

  // 글로벌 파이프라인 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('SPARTA FINAL PROJECT: FAN COMMUNITY')
    .setDescription('API description of Sparta Final Project - Fan Community')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  app.useGlobalFilters(new AllExceptionsFilter()); // 에러 문 처리
  await app.listen(port);
}

bootstrap();

import * as env from 'dotenv';
import 'reflect-metadata';
import * as logger from 'morgan'
env.config();

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import * as helmet from 'helmet';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initDocumentation } from './documentation';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { TimeoutInterceptor } from './interceptor/timeout.interceptor';
import { HttpExceptionFilter } from './filter/https-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const server = express();
  server.use(logger(process.env.NODE_ENV));
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: false }));

  const app = await NestFactory.create(AppModule);
  app.use(passport.initialize())
  app.use(passport.session())

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new TimeoutInterceptor()
  );

  app.use(helmet());

  app.enableCors();

  initDocumentation(app, {
    version: '1.0',
    description: 'api',
    title: 'api',
    endpoint: '/docs',
    
  });

  await app.listen(process.env.PORT || 3000);

}
bootstrap();

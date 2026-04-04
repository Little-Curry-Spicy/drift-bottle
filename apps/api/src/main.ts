import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import chalk from 'chalk';
import type { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionsFilter, TransformResponseInterceptor } from './common';
import { createWinstonTransports } from './logger/winston.logger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: createWinstonTransports(),
    }),
  });
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(
    rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
      max: Number(process.env.RATE_LIMIT_MAX ?? 60),
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          code: 429,
          message: 'Too many requests, please try again later.',
          data: null,
        });
      },
    }),
  );

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  app.useGlobalInterceptors(
    new TransformResponseInterceptor(app.get(Reflector)),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Drift Bottle API')
    .setDescription('漂流瓶后端 HTTP API（字段与移动端 `Bottle` 对齐）')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  const port = Number(process.env.PORT ?? 3000);
  logger.log(
    chalk.green(`Swagger UI: ${chalk.blue(`http://localhost:${port}/docs`)}`),
  );
  await app.listen(port);
}
bootstrap();

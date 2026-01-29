import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Stock price checker')
    .setDescription(
      `A utility that provides a way to check stock prices
      and calculates the moving average of recent price records`,
    )
    .setVersion('1.0')
    .build();
  const options = {
    customSiteTitle: 'Stock price checker API',
  } satisfies SwaggerCustomOptions;
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory, options);

  app.enableShutdownHooks();

  await app.listen(config.port);

  return app;
}

void bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exitCode = 1;
});

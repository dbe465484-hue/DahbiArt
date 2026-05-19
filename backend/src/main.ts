import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const origins = (
    process.env.FRONTEND_URL ??
    'http://localhost:3000,https://dahbi-art.vercel.app'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const apiPrefix = process.env.API_ROUTE_PREFIX;
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API Mayn: http://localhost:${port}`);
}
bootstrap();

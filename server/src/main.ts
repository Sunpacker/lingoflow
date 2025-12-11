import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Глобальный префикс для API
  app.setGlobalPrefix("api");

  // Валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет поля, отсутствующие в DTO
      transform: true, // Преобразует типы
    })
  );

  // CORS
  app.enableCors({
    origin: configService.get<string>("client_URL") || "http://localhost:3000",
    credentials: true,
  });

  const port = configService.get<number>("PORT") || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

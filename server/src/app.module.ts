import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { MessagesModule } from "./messages/messages.module";
import { ProvidersModule } from "./providers/providers.module";
import { QueueModule } from "./queue/queue.module";
import { LlmGatewayModule } from "./llm-gateway/llm-gateway.module";
import { User, Conversation, Message, Provider } from "./database/entities"; // Импорт сущностей

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST || "localhost",
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER || "user",
      password: process.env.POSTGRES_PASSWORD || "password",
      database: process.env.POSTGRES_DB || "llm_chat_db",
      entities: [User, Conversation, Message, Provider],
      synchronize: false, // В продакшене лучше использовать миграции
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    ConversationsModule,
    MessagesModule,
    ProvidersModule,
    QueueModule,
    LlmGatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

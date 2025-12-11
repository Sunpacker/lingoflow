import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { QueueService } from "./queue.service";
import { QueueConsumer } from "./queue.consumer";
import { LlmGatewayModule } from "../llm-gateway/llm-gateway.module";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "LLM_QUEUE_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
          queue: "llm_generation_queue",
          queueOptions: { durable: false },
        },
      },
    ]),
    LlmGatewayModule,
  ],
  providers: [QueueService, QueueConsumer],
  exports: [QueueService],
})
export class QueueModule {}

// server/src/queue/queue.service.ts (Producer)
import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class QueueService {
  constructor(@Inject("LLM_QUEUE_SERVICE") private client: ClientProxy) {}

  async addTask(conversationId: string, messageId: string) {
    // Отправка задачи в очередь
    this.client.emit("generate_llm_response", { conversationId, messageId });
  }
}

// server/src/queue/queue.consumer.ts (Consumer)
import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";
import { LlmGatewayService } from "../llm-gateway/llm-gateway.service";

@Controller()
export class QueueConsumer {
  private readonly logger = new Logger(QueueConsumer.name);

  constructor(private readonly llmGatewayService: LlmGatewayService) {}

  @EventPattern("generate_llm_response")
  async handleGenerationTask(data: {
    conversationId: string;
    messageId: string;
  }) {
    this.logger.log(`Processing task for conversation: ${data.conversationId}`);
    // LLM Gateway Service обрабатывает запрос, вызывает внешний API и стримит ответ
    await this.llmGatewayService.generateResponse(
      data.conversationId,
      data.messageId
    );
  }
}

// --- 2. Пример SSE-стриминга (MessagesController) ---

// server/src/messages/messages.controller.ts
import { Controller, Get, Sse, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { MessagesService } from "./messages.service";

// В реальном приложении нужно использовать более сложный механизм для управления SSE-подписками
// Например, Map<string, Subject<any>> для каждого conversationId
const sseSubjects: Map<string, Subject<any>> = new Map();

@Controller("conversations/:conversationId/messages")
@UseGuards(AuthGuard("jwt"))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // ... (POST /messages для отправки нового сообщения и запуска очереди) ...

  @Sse("stream")
  streamEvents(
    @Param("conversationId") conversationId: string
  ): Observable<MessageEvent> {
    if (!sseSubjects.has(conversationId)) {
      sseSubjects.set(conversationId, new Subject());
    }

    const subject = sseSubjects.get(conversationId);

    // Очистка Subject после закрытия соединения (например, через таймаут или явный запрос)
    // В NestJS SSE-соединение закрывается, когда Observable завершается.
    // Здесь мы возвращаем Observable, который будет отправлять данные, пока Subject не завершится.

    return subject.asObservable().pipe(
      map((data: string) => {
        // Формат SSE: data: <payload>\n\n
        return { data: data } as MessageEvent;
      })
    );
  }
}

// server/src/llm-gateway/llm-gateway.service.ts (Часть, отвечающая за стриминг)
// ...
// Пример:
// async generateResponse(conversationId: string, messageId: string) {
//   const stream = await this.llmApi.createChatCompletionStream(...);
//   for await (const chunk of stream) {
//     const content = chunk.choices[0]?.delta?.content || '';
//     if (content) {
//       // Отправка чанка через SSE
//       const subject = sseSubjects.get(conversationId);
//       if (subject) {
//         subject.next(JSON.stringify({ type: 'chunk', content }));
//       }
//       // Обновление сообщения в БД (добавление чанка)
//       await this.messagesService.appendContent(messageId, content);
//     }
//   }
//   // После завершения стриминга
//   const subject = sseSubjects.get(conversationId);
//   if (subject) {
//     subject.next(JSON.stringify({ type: 'end' }));
//     // subject.complete(); // Можно завершить, если это был последний запрос в диалоге
//   }
// }

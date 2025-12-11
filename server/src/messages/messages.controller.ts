import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Sse,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { MessagesService } from "./messages.service";
import { QueueService } from "../queue/queue.service";
import { MessageRole } from "../database/entities";

// Глобальное хранилище SSE Subject'ов для каждого conversationId
export const sseSubjects: Map<string, Subject<any>> = new Map();

@Controller("conversations/:conversationId/messages")
@UseGuards(AuthGuard("jwt"))
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private queueService: QueueService
  ) {}

  @Get()
  async getMessages(@Param("conversationId") conversationId: string) {
    return this.messagesService.findByConversationId(conversationId);
  }

  @Post()
  async createMessage(
    @Param("conversationId") conversationId: string,
    @Body() body: { content: string }
  ) {
    // Сохранение сообщения пользователя
    const userMessage = await this.messagesService.create({
      conversationId,
      role: MessageRole.USER,
      content: body.content,
    });

    // Создание пустого сообщения ассистента
    const assistantMessage = await this.messagesService.create({
      conversationId,
      role: MessageRole.ASSISTANT,
      content: "",
      isStreaming: true,
    });

    // Отправка задачи в очередь
    await this.queueService.addTask(conversationId, assistantMessage.id);

    return { userMessage, assistantMessage };
  }

  @Sse("stream")
  streamEvents(
    @Param("conversationId") conversationId: string
  ): Observable<MessageEvent> {
    if (!sseSubjects.has(conversationId)) {
      sseSubjects.set(conversationId, new Subject());
    }

    const subject = sseSubjects.get(conversationId);

    return subject.asObservable().pipe(
      map((data: string) => {
        return { data } as MessageEvent;
      })
    );
  }
}

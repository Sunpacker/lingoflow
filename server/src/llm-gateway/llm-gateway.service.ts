import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MessagesService } from "../messages/messages.service";
import { ConversationsService } from "../conversations/conversations.service";
import { ProvidersService } from "../providers/providers.service";
import { sseSubjects } from "../messages/messages.controller";
import OpenAI from "openai";

@Injectable()
export class LlmGatewayService {
  private readonly logger = new Logger(LlmGatewayService.name);

  constructor(
    private configService: ConfigService,
    private messagesService: MessagesService,
    private conversationsService: ConversationsService,
    private providersService: ProvidersService
  ) {}

  async generateResponse(conversationId: string, messageId: string) {
    try {
      // Получение диалога и истории сообщений
      const conversation = await this.conversationsService.findById(
        conversationId
      );
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const messages = await this.messagesService.findByConversationId(
        conversationId
      );
      const provider = await this.providersService.findById(
        conversation.providerId
      );

      // Формирование истории для LLM
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Инициализация OpenAI клиента
      const openai = new OpenAI({
        apiKey: this.configService.get<string>("OPENAI_API_KEY"),
        baseURL: provider?.baseUrl || "https://api.openai.com/v1",
      });

      // Потоковый запрос к LLM
      const stream = await openai.chat.completions.create({
        model: conversation.modelName || "gpt-4",
        messages: history as any,
        stream: true,
      });

      // Обработка потока
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          // Отправка чанка через SSE
          const subject = sseSubjects.get(conversationId);
          if (subject) {
            subject.next(JSON.stringify({ type: "chunk", content }));
          }

          // Обновление сообщения в БД
          await this.messagesService.appendContent(messageId, content);
        }
      }

      // Завершение стриминга
      const subject = sseSubjects.get(conversationId);
      if (subject) {
        subject.next(JSON.stringify({ type: "end" }));
      }

      await this.messagesService.updateStreamingStatus(messageId, false);
      this.logger.log(
        `Completed generation for conversation: ${conversationId}`
      );
    } catch (error) {
      this.logger.error(`Error generating response: ${error.message}`);

      // Отправка ошибки через SSE
      const subject = sseSubjects.get(conversationId);
      if (subject) {
        subject.next(JSON.stringify({ type: "error", message: error.message }));
      }
    }
  }
}

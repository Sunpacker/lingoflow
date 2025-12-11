import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class QueueService {
  constructor(@Inject("LLM_QUEUE_SERVICE") private client: ClientProxy) {}

  async addTask(conversationId: string, messageId: string) {
    this.client.emit("generate_llm_response", { conversationId, messageId });
  }
}

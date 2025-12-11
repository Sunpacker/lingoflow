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
    await this.llmGatewayService.generateResponse(
      data.conversationId,
      data.messageId
    );
  }
}

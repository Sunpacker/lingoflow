import { Module } from "@nestjs/common";
import { LlmGatewayService } from "./llm-gateway.service";
import { MessagesModule } from "../messages/messages.module";
import { ConversationsModule } from "../conversations/conversations.module";
import { ProvidersModule } from "../providers/providers.module";

@Module({
  imports: [MessagesModule, ConversationsModule, ProvidersModule],
  providers: [LlmGatewayService],
  exports: [LlmGatewayService],
})
export class LlmGatewayModule {}

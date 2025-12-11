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

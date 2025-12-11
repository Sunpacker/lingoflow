import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "../database/entities";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { QueueModule } from "../queue/queue.module";

@Module({
  imports: [TypeOrmModule.forFeature([Message]), QueueModule],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}

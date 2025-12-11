import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message, MessageRole } from "../database/entities";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>
  ) {}

  async create(messageData: Partial<Message>): Promise<Message> {
    const message = this.messagesRepository.create(messageData);
    return this.messagesRepository.save(message);
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { conversationId },
      order: { createdAt: "ASC" },
    });
  }

  async findById(id: string): Promise<Message | undefined> {
    return this.messagesRepository.findOne({ where: { id } });
  }

  async appendContent(id: string, content: string): Promise<void> {
    const message = await this.findById(id);
    if (message) {
      message.content += content;
      await this.messagesRepository.save(message);
    }
  }

  async updateStreamingStatus(id: string, isStreaming: boolean): Promise<void> {
    await this.messagesRepository.update(id, { isStreaming });
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "../database/entities";

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>
  ) {}

  async create(conversationData: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversationsRepository.create(conversationData);
    return this.conversationsRepository.save(conversation);
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationsRepository.find({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Conversation | undefined> {
    return this.conversationsRepository.findOne({
      where: { id },
      relations: ["messages", "provider"],
    });
  }

  async delete(id: string): Promise<void> {
    await this.conversationsRepository.update(id, { status: "deleted" });
  }
}

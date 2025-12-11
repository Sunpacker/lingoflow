import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConversationsService } from "./conversations.service";

@Controller("conversations")
@UseGuards(AuthGuard("jwt"))
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  async getConversations(@Req() req) {
    return this.conversationsService.findByUserId(req.user.userId);
  }

  @Get(":id")
  async getConversation(@Param("id") id: string) {
    return this.conversationsService.findById(id);
  }

  @Post()
  async createConversation(@Req() req, @Body() body: any) {
    return this.conversationsService.create({
      ...body,
      userId: req.user.userId,
    });
  }

  @Delete(":id")
  async deleteConversation(@Param("id") id: string) {
    return this.conversationsService.delete(id);
  }
}

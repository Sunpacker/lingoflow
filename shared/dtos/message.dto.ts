export interface CreateMessageDto {
  content: string;
  conversationId: string;
}

export interface MessageResponseDto {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  conversationId: string;
  createdAt: Date;
}

export interface StreamChunkDto {
  type: "chunk" | "end" | "error";
  content?: string;
  message?: string;
}

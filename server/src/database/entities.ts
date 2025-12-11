import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Index,
} from "typeorm";

// --- User Entity ---
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: "user" })
  role: string; // 'user', 'admin'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations: Conversation[];
}

// --- Provider Entity ---
@Entity("providers")
export class Provider {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'OpenAI', 'Anthropic', 'Groq'

  @Column()
  baseUrl: string;

  @Column({ type: "jsonb", nullable: true })
  models: { name: string; contextWindow: number }[];

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// --- Conversation Entity ---
@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ default: "active" })
  status: string; // 'active', 'archived', 'deleted'

  @ManyToOne(() => User, (user) => user.conversations)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Provider)
  provider: Provider;

  @Column()
  providerId: string;

  @Column()
  modelName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}

// --- Message Entity ---
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: MessageRole })
  role: MessageRole;

  @Column({ type: "text" })
  content: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @Column()
  conversationId: string;

  @Column({ default: false })
  isStreaming: boolean; // Флаг для отслеживания, находится ли сообщение в процессе генерации

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

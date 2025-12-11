export interface UserEntity {
  id: string;
  email: string;
  isVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

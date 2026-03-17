export class UserResponseDto {
  id!: string;
  email!: string;
  name?: string;
  avatarUrl?: string;
  timezone!: string;
  isVerified!: boolean;
  createdAt!: Date;
}
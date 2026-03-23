import { Injectable,ConflictException , NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt'
import type { ReturnProps } from '../types/type.js';
import { CreateUserDto } from './dto/create-user.dto.js';
@Injectable()
export class UsersService {

    constructor( private prisma: PrismaService){}
  async create(dto: CreateUserDto): Promise<ReturnProps> {
  const existing = await this.prisma.user.findUnique({
    where: { email: dto.email }
  });

  if (existing) throw new ConflictException("email already exist!");

  const passwordHash = await bcrypt.hash(dto.password, 12);

  const user = await this.prisma.user.create({
    data: {
      email: dto.email,
      passwordHash,
      name: dto.name
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      timezone: true,
      isVerified: true,
      createdAt: true
    }
  });
// TODO: Fire BullMQ job for "welcome email + verification"
  return user;
}
  async findByEmail(email: string){
    return this.prisma.user.findUnique(
        {where: {email},
    select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
    }
    });

  }
async findById(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      // Never return password
    },
  });

  if (!user) throw new NotFoundException('User not found');
  return user;
}

async storeRefreshToken(userId: string, hashedToken: string, expiresAt: Date) {
  await this.prisma.refreshToken.upsert({
  where: { userId: userId },         
  update:  { hashedToken, expiresAt },
  create:  { userId, hashedToken, expiresAt },
});
}


// More methods later: updatePreferences, updateAvatar, softDelete, etc.
}

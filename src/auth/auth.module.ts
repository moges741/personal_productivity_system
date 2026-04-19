import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { RefreshStrategy } from './strategies/refresh.strategy.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js'; // assume you have it
import { GoogleStrategy } from './strategies/google.strategy.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';  
import { UsersModule } from '../users/users.module.js';
@Module({
  imports:[
    ConfigModule,
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    UsersService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    GoogleAuthGuard,
    GoogleStrategy
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy]
})
export class AuthModule {}

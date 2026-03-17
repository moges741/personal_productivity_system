import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}


  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const passwordHash = user.passwordHash ?? 'invalid-placeholder-hash';
    const isValid = await bcrypt.compare(pass, passwordHash);

    if (!isValid) {
      return null;
    }


    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }


   
 async login(user: any) {
 if (!user?.id || !user?.email) {
      throw new UnauthorizedException('Invalid user data');
    }

  const payload: JwtPayload = { sub: user.id, email: user.email };
  const accessToken = await this.jwtService.signAsync(payload); // uses default from JwtModule

  const refreshPayload = { sub: user.id };

const refreshExpiry = this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d';

const refreshToken = await this.jwtService.signAsync(refreshPayload, {
  secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
//   expiresIn: refreshExpiry as any,  // ← quick bypass (works fine)
  expiresIn: refreshExpiry as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}` | number,
});

  const hashedRefresh = await bcrypt.hash(refreshToken, 12);

  await this.usersService.storeRefreshToken(
    user.id,
    hashedRefresh,
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  };
}
  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const newAccessToken = this.jwtService.sign(payload);

    return {
      access_token: newAccessToken,
    };
  }

  // Next steps you can add:
  // async logout(userId: string, refreshTokenFromCookie: string) { ... }
}
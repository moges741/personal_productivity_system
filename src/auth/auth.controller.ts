import {
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ── Login ──────────────────────────────────────────────────────
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  async login(@Req() req: Request) {
    // req.user is now fully typed: { id, email, name, avatarUrl? }
    // because LocalStrategy.validate() returns the safeUser object
    // and express.d.ts tells TypeScript what shape req.user is
    const tokens = await this.authService.login(req.user);

    return {
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id:    req.user!.id,
        name:  req.user!.name,
        email: req.user!.email,
      },
    };
  }

  // ── Refresh ────────────────────────────────────────────────────
  // Frontend sends: POST /auth/refresh { "refreshToken": "..." }
  @Public()
  @Post('refresh')
  @UseGuards(AuthGuard('refresh'))
  @HttpCode(200)
  async refresh(@Req() req: Request) {
    // req.user set by RefreshStrategy.validate() → { userId: payload.sub }
    const result = await this.authService.refreshToken(
      (req.user as any).userId,
    );

    return {
      access_token: result.access_token,
      user:         result.user,
    };
  }

  // ── Logout ─────────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(200)
  async logout() {
    // No cookie to clear — frontend removes token from localStorage
    // Optionally revoke refresh token from DB here later
    return { message: 'Logged out' };
  }
}
import {
  Controller,
  Post,
  Get,
  HttpCode,
  UseGuards,
  Req,
  Res
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { Response } from 'express';
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
@Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Passport handles the redirect to Google
  }

// @Get('google/callback')
// @UseGuards(GoogleAuthGuard)
// async googleAuthCallback(@Req() req: any, @Res() res: Response) {
//   const tokens = await this.authService.login(req.user);

//   // Redirect to a PUBLIC callback page (outside the protected (app) group)
//   const frontendCallbackUrl = 'http://localhost:3000/auth/callback';

//   return res.redirect(
//     `${frontendCallbackUrl}?access_token=${encodeURIComponent(tokens.access_token)}&refresh_token=${encodeURIComponent(tokens.refresh_token)}`
//   );
// }
@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthCallback(@Req() req: any, @Res() res: Response) {
  const result = await this.authService.login(req.user);   // returns { access_token, refresh_token, user }

  return res.redirect(
    `http://localhost:3000/auth/callback?` +
    `access_token=${encodeURIComponent(result.access_token)}&` +
    `refresh_token=${encodeURIComponent(result.refresh_token)}&` +
    `user=${encodeURIComponent(JSON.stringify(result.user))}`
  );
}
  @Post('logout')
  @HttpCode(200)
  async logout() {
    // No cookie to clear — frontend removes token from localStorage
    // Optionally revoke refresh token from DB here later
    return { message: 'Logged out' };
  }
}
import { Controller, Post, Body, Res, HttpCode, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService){}

    @Public()
    @UseGuards(AuthGuard('local'))
    @Post('login')
    @HttpCode(200)
    async login(@Req() req, @Res({passthrough : true}) res: Response ){
        const tokens = await this.authService.login(req.user);


        res.cookie("refreshToken", tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return {
            access_token: tokens.access_token,
            name: req.user.name,
            email: req.user.email

        }
    }

  @Public()
  @Post('refresh')
  @UseGuards(AuthGuard('refresh'))
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const newAccess = await this.authService.refreshToken(req.user.userId);

    return { access_token: newAccess.access_token };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }
}

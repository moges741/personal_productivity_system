import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(configService: ConfigService) {
    super({
     jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.refreshToken || null,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'), 
      passReqToCallback: true, 
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: any) {
    // You can check req.cookies.refreshToken against stored hash here
    return { userId: payload.sub };
  }
}
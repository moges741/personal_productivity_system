import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(configService: ConfigService) {
    super({
      // Read refresh token from request body instead of cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.body?.refreshToken;
          if (!token) return null;
          return token;
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing from body');
    }

    // payload.sub is the userId from the JWT
    return { userId: payload.sub };
  }
}
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
// validation logic is handled by the JwtStrategy, so we just need to return the user info here
validate(payload: any) {
  return {
    userId: payload.sub,
    email: payload.email,
  };
}
}
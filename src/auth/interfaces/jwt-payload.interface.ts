export interface JwtPayload {
  sub: string;     // user id
  email: string;
  // roles?: string[];   // add later for RBAC
  iat?: number;
  exp?: number;
}
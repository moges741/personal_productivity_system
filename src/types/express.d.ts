// src/types/express.d.ts

declare namespace Express {
  interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  }
}
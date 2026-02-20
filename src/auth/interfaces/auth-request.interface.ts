import type { Request } from 'express';

// Para guards / middleware: puede venir sin user
export interface AuthRequest extends Request {
  user?: {
    sub: string;
    email?: string;
    role?: string;
  };
}

// Para endpoints con JwtAuthGuard: user SIEMPRE existe
export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email?: string;
    role?: string;
  };
}

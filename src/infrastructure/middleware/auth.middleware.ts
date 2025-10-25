import { Elysia } from 'elysia';
import { JWTService } from '../services/jwt.service';
import { JWTError } from '../errors/jwt.error';
import { UnauthorizedError } from '../../domain/errors/domain.errors';

export interface AuthContext {
  user: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (app: Elysia) =>
  app.derive(async ({ headers, set }) => {
    const authHeader = headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      set.status = 401;
      throw new Error('No token provided');
    }

    try {
      const payload = JWTService.verifyToken(token);

      return {
        user: {
          userId: payload.userId,
          email: payload.email,
        },
      };
    } catch (err) {
      if (err instanceof JWTError) {
        set.status = 401;
        throw new Error('Invalid token');
      }
      set.status = 500;
      throw new Error('Internal server error');
    }
  });

// Plugin para proteção de rotas (versão alternativa se preferir usar guard)
export const authPlugin = (app: Elysia) =>
  app.guard({
    beforeHandle: ({ headers, set }) => {
      const authHeader = headers.authorization;
      const token = JWTService.extractTokenFromHeader(authHeader);

      if (!token) {
        set.status = 401;
        return { error: 'No token provided' };
      }

      try {
        JWTService.verifyToken(token);
      } catch (err) {
        if (err instanceof JWTError) {
          set.status = 401;
          return { error: 'Invalid token' };
        }
        set.status = 500;
        return { error: 'Internal server error' };
      }
    },
  });
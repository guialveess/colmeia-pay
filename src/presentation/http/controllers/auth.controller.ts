import { Elysia, t } from 'elysia';
import { DIContainer } from '../../../infrastructure/di/container';
import { NotFoundError, ValidationError, DuplicateError } from '../../../domain/errors/domain.errors';
import {
  registerSchema,
  loginSchema,
  authResponseSchema,
  type RegisterInput,
  type LoginInput,
} from './auth.schemas';

const container = DIContainer.getInstance();

const registerUseCase = container.getRegisterUseCase();
const loginUseCase = container.getLoginUseCase();

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Erro desconhecido';
}

export const authController = new Elysia({ prefix: '/auth' })
  .post(
    '/register',
    async ({ body, set }) => {
      try {
        const validatedBody = registerSchema.parse(body);
        const result = await registerUseCase.execute(validatedBody);
        set.status = 201;
        return result;
      } catch (error) {
        console.error('Auth - Register error:', error);

        if (error instanceof DuplicateError) {
          set.status = 400;
          return { error: error.message };
        }

        if (error instanceof ValidationError) {
          set.status = 400;
          return { error: error.message };
        }

        set.status = 500;
        return {
          error: 'Erro interno do servidor',
          details: getErrorMessage(error),
        };
      }
    },
    {
      body: registerSchema,
      response: {
        201: authResponseSchema,
        400: t.Object({
          error: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          error: t.String(),
          message: t.String(),
        }),
      },
    },
    {
      detail: {
        tags: ['Autenticacao'],
        summary: 'Registrar novo usuario',
        description: 'Cria uma nova conta de usuario para acesso administrativo ao sistema'
      }
    }
  )
  .post(
    '/login',
    async ({ body, set }) => {
      try {
        const validatedBody = loginSchema.parse(body);
        const result = await loginUseCase.execute(validatedBody);
        return result;
      } catch (error) {
        console.error('Auth - Login error:', error);

        if (error instanceof NotFoundError || error instanceof ValidationError) {
          set.status = 401;
          return { error: 'Credenciais invalidas' };
        }

        set.status = 500;
        return {
          error: 'Erro interno do servidor',
          details: getErrorMessage(error),
        };
      }
    },
    {
      body: loginSchema,
      response: {
        200: authResponseSchema,
        401: t.Object({
          error: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          error: t.String(),
          message: t.String(),
        }),
      },
    },
    {
      detail: {
        tags: ['Autenticacao'],
        summary: 'Autenticar usuario',
        description: 'Realiza login do usuario e retorna token JWT para acesso as rotas protegidas'
      }
    }
  );
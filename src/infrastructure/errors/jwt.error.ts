import { DomainError } from '../../domain/errors/domain.errors';

export class JWTError extends DomainError {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'JWTError';
  }
}
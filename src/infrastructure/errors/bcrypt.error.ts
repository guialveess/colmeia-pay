import { DomainError } from '../../domain/errors/domain.errors';

export class BcryptError extends DomainError {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'BcryptError';
  }
}
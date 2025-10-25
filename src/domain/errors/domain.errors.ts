export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} nao encontrado`);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends DomainError {
  constructor(resource: string, field: string) {
    super(`${resource} com este ${field} ja existe`);
    this.name = 'DuplicateError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(`Erro de validacao: ${message}`);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Nao autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class CustomerNotFoundError extends NotFoundError {
  constructor(customerId: string) {
    super(`Cliente com ID ${customerId} nao encontrado`);
    this.name = 'CustomerNotFoundError';
  }
}

export class MerchantNotFoundError extends NotFoundError {
  constructor(merchantId: string) {
    super(`Comerciante com ID ${merchantId} nao encontrado`);
    this.name = 'MerchantNotFoundError';
  }
}

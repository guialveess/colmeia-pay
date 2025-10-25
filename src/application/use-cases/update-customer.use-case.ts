import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { NotFoundError, DuplicateError } from '../../domain/errors/domain.errors';
import { UpdateCustomerRequest, UpdateCustomerResponse, CustomerResponse } from '../dtos/customer.dto';
import { Customer } from '../../domain/entities/customer.entity';

export class UpdateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string, request: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    const existingCustomer = await this.customerRepository.findById(id);

    if (!existingCustomer) {
      throw new NotFoundError('Customer');
    }

    if (request.email && request.email !== existingCustomer.email) {
      const customerWithEmail = await this.customerRepository.findByEmail(request.email);
      if (customerWithEmail) {
        throw new DuplicateError('Customer', 'email');
      }
    }

    if (request.document && request.document !== existingCustomer.document) {
      const customerWithDocument = await this.customerRepository.findByDocument(request.document);
      if (customerWithDocument) {
        throw new DuplicateError('Customer', 'document');
      }
    }

    const updatedCustomer = await this.customerRepository.update(id, request);

    if (!updatedCustomer) {
      throw new NotFoundError('Customer');
    }

    return {
      customer: this.toDTO(updatedCustomer),
    };
  }

  private toDTO(customer: Customer): CustomerResponse {
    return customer.toJSON();
  }
}
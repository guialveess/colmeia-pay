import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { NotFoundError } from '../../domain/errors/domain.errors';
import { DeleteCustomerResponse, CustomerResponse } from '../dtos/customer.dto';
import { Customer } from '../../domain/entities/customer.entity';

export class DeleteCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string): Promise<DeleteCustomerResponse> {
    const existingCustomer = await this.customerRepository.findById(id);

    if (!existingCustomer) {
      throw new NotFoundError('Customer');
    }

    const deletedCustomer = await this.customerRepository.delete(id);

    if (!deletedCustomer) {
      throw new NotFoundError('Customer');
    }

    return {
      customer: this.toDTO(deletedCustomer),
    };
  }

  private toDTO(customer: Customer): CustomerResponse {
    return customer.toJSON();
  }
}
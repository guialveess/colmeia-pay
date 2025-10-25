import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { CustomerListResponse, CustomerResponse } from '../dtos/customer.dto';
import { Customer } from '../../domain/entities/customer.entity';

export class ListCustomersUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(): Promise<CustomerListResponse> {
    const customers = await this.customerRepository.findAll();

    return {
      customers: customers.map(customer => this.toDTO(customer)),
    };
  }

  private toDTO(customer: Customer): CustomerResponse {
    return customer.toJSON();
  }
}
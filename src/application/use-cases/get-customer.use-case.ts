import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { NotFoundError } from '../../domain/errors/domain.errors';
import { GetCustomerResponse, CustomerResponse } from '../dtos/customer.dto';
import { Customer } from '../../domain/entities/customer.entity';

export class GetCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string): Promise<GetCustomerResponse> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    return {
      customer: this.toDTO(customer),
    };
  }

  private toDTO(customer: Customer): CustomerResponse {
    return customer.toJSON();
  }
}
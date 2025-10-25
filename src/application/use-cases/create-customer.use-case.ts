import { createId } from '@paralleldrive/cuid2';
import { Customer } from '../../domain/entities/customer.entity';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { DuplicateError } from '../../domain/errors/domain.errors';
import { CreateCustomerRequest, CreateCustomerResponse, CustomerResponse } from '../dtos/customer.dto';

export class CreateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(request: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    console.log('CreateCustomerUseCase - Starting execution with request:', request);

    const id = createId();
    console.log('CreateCustomerUseCase - Generated ID:', id);

    try {
      console.log('CreateCustomerUseCase - Checking existing email:', request.email);
      const existingCustomerByEmail = await this.customerRepository.findByEmail(request.email);
      if (existingCustomerByEmail) {
        console.log('CreateCustomerUseCase - Email already exists:', request.email);
        throw new DuplicateError('Customer', 'email');
      }

      console.log('CreateCustomerUseCase - Checking existing document:', request.document);
      const existingCustomerByDocument = await this.customerRepository.findByDocument(request.document);
      if (existingCustomerByDocument) {
        console.log('CreateCustomerUseCase - Document already exists:', request.document);
        throw new DuplicateError('Customer', 'document');
      }

      console.log('CreateCustomerUseCase - Creating customer entity');
      const customer = Customer.create({
        id,
        name: request.name,
        email: request.email,
        document: request.document,
        phone: request.phone,
        metadata: request.metadata,
      });
      console.log('CreateCustomerUseCase - Customer entity created:', customer);

      console.log('CreateCustomerUseCase - Saving customer to database');
      const createdCustomer = await this.customerRepository.create({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        document: customer.document,
        phone: customer.phone,
        metadata: customer.metadata,
      });
      console.log('CreateCustomerUseCase - Customer saved to database:', createdCustomer);

      const result = {
        customer: this.toDTO(createdCustomer),
      };
      console.log('CreateCustomerUseCase - Execution completed successfully:', result);

      return result;
    } catch (error) {
      console.error('CreateCustomerUseCase - Error during execution:', error);
      console.error('CreateCustomerUseCase - Error type:', error?.constructor?.name);
      console.error('CreateCustomerUseCase - Error message:', error instanceof Error ? error.message : String(error));
      throw error; 
    }
  }

  private toDTO(customer: Customer): CustomerResponse {
    console.log('CreateCustomerUseCase - Converting to DTO');
    return customer.toJSON();
  }
}
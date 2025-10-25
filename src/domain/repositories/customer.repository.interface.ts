import { Customer, CreateCustomerProps, UpdateCustomerProps } from '../entities/customer.entity';

export interface ICustomerRepository {
  create(data: CreateCustomerProps): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  update(id: string, data: Partial<UpdateCustomerProps>): Promise<Customer | null>;
  delete(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
}

import { User, CreateUserProps, UpdateUserProps } from '../entities/auth.entity';

export interface IAuthRepository {
  create(data: CreateUserProps): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<UpdateUserProps>): Promise<User | null>;
  delete(id: string): Promise<User | null>;
}
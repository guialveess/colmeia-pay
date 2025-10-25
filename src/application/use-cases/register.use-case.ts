import { createId } from '@paralleldrive/cuid2';
import { User } from '../../domain/entities/auth.entity';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { DuplicateError, ValidationError } from '../../domain/errors/domain.errors';
import { PasswordService } from '../../infrastructure/services/password.service';
import { JWTService } from '../../infrastructure/services/jwt.service';
import { RegisterRequest, RegisterResponse } from '../dtos/auth.dto';

export class RegisterUseCase {
  constructor(
    private authRepository: IAuthRepository,
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    if (!PasswordService.validatePassword(request.password)) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    const existingUser = await this.authRepository.findByEmail(request.email);
    if (existingUser) {
      throw new DuplicateError('User', 'email');
    }

    const hashedPassword = await PasswordService.hash(request.password);

    const user = User.create({
      id: createId(),
      email: request.email,
      password: hashedPassword,
    });

    const createdUser = await this.authRepository.create({
      id: user.id,
      email: user.email,
      password: user.password,
    });

    const token = JWTService.generateToken({
      userId: createdUser.id,
      email: createdUser.email,
    });

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      },
      token,
    };
  }
}
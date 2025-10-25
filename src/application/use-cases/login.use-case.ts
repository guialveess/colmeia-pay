import { User } from '../../domain/entities/auth.entity';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { NotFoundError, ValidationError } from '../../domain/errors/domain.errors';
import { PasswordService } from '../../infrastructure/services/password.service';
import { JWTService } from '../../infrastructure/services/jwt.service';
import { LoginRequest, LoginResponse } from '../dtos/auth.dto';

export class LoginUseCase {
  constructor(
    private authRepository: IAuthRepository,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // Validar senha
    if (!PasswordService.validatePassword(request.password)) {
      throw new ValidationError('Invalid credentials');
    }

    // Buscar usuário pelo email
    const user = await this.authRepository.findByEmail(request.email);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      throw new ValidationError('User account is inactive');
    }

    // Verificar senha
    const isPasswordValid = await PasswordService.compare(request.password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError('Invalid credentials');
    }

    // Atualizar último login
    const updatedUser = await this.authRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    if (!updatedUser) {
      throw new Error('Failed to update user last login');
    }

    // Gerar token JWT
    const token = JWTService.generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
        lastLoginAt: updatedUser.lastLoginAt?.toISOString() || null,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
      token,
    };
  }
}
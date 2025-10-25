import { JWTService, JWTPayload } from '../../infrastructure/services/jwt.service';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { NotFoundError } from '../../domain/errors/domain.errors';
import { AuthResponse } from '../dtos/auth.dto';

export class VerifyTokenUseCase {
  constructor(
    private authRepository: IAuthRepository,
  ) {}

  async execute(token: string): Promise<AuthResponse> {
    const payload = JWTService.verifyToken(token);

    const user = await this.authRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new NotFoundError('User');
    }

    return {
      userId: user.id,
      email: user.email,
      token,
    };
  }
}
import bcrypt from 'bcryptjs';
import { BcryptError } from '../errors/bcrypt.error';

export class PasswordService {
  private static readonly SALT_ROUNDS = 12;

  static async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      throw new BcryptError('Error hashing password', error);
    }
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new BcryptError('Error comparing passwords', error);
    }
  }

  static validatePassword(password: string): boolean {
    return password.length >= 6;
  }
}
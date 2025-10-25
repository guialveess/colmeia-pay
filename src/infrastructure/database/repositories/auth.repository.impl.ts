import { eq } from 'drizzle-orm';
import { dbConnection } from '../connection';
import { users } from '../schema';
import { User, CreateUserProps, UpdateUserProps } from '../../../domain/entities/auth.entity';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';

export class AuthRepository implements IAuthRepository {
  async create(data: CreateUserProps): Promise<User> {
    try {
      const [createdUser] = await dbConnection
        .insert(users)
        .values({
          id: data.id,
          email: data.email,
          password: data.password,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return User.create({
        id: createdUser.id,
        email: createdUser.email,
        password: createdUser.password,
      });
    } catch (error) {
      console.error('AuthRepository - Error creating user:', (error as any)?.message);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await dbConnection
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await dbConnection
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async update(id: string, data: Partial<UpdateUserProps>): Promise<User | null> {
    const [updatedUser] = await dbConnection
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return null;
    }

    return new User({
      id: updatedUser.id,
      email: updatedUser.email,
      password: updatedUser.password,
      isActive: updatedUser.isActive,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  }

  async delete(id: string): Promise<User | null> {
    const [deletedUser] = await dbConnection
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) {
      return null;
    }

    return new User({
      id: deletedUser.id,
      email: deletedUser.email,
      password: deletedUser.password,
      isActive: deletedUser.isActive,
      lastLoginAt: deletedUser.lastLoginAt,
      createdAt: deletedUser.createdAt,
      updatedAt: deletedUser.updatedAt,
    });
  }
}
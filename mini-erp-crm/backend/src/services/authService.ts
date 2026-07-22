import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static async login(email: string, passwordIn: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValidPassword = await bcrypt.compare(passwordIn, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: '8h'
    });

    const refreshToken = jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: '7d'
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

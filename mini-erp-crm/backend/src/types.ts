import { Request } from 'express';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

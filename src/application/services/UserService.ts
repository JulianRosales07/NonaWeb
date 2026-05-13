import { apiClient } from '../../infrastructure/http/apiClient';
import type { User } from '../../domain/models/User';

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  cedula?: string;
  residence?: string;
  birthDate?: string;
}

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/auth/all');
    return response.data;
  }

  static async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/auth/user/${id}`);
    return response.data;
  }

  static async createUser(data: CreateUserDTO): Promise<User> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  static async updateUser(id: string, data: Partial<User> & { password?: string }): Promise<User> {
    const response = await apiClient.put(`/auth/admin/user/${id}`, data);
    return response.data;
  }

  static async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }

  static async updateMyProfile(data: Partial<User> & { password?: string }): Promise<User> {
    const response = await apiClient.put('/auth/profile', data);
    return response.data.user || response.data;
  }

  static async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/auth/admin/user/${id}`);
  }
}

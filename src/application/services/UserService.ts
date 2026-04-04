import { apiClient } from '../../infrastructure/http/apiClient';
import type { User } from '../../domain/models/User';

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/auth/all');
    return response.data;
  }

  static async updateUser(id: string, data: Partial<User> & { password?: string }): Promise<User> {
    const response = await apiClient.put(`/auth/admin/user/${id}`, data);
    return response.data;
  }
}

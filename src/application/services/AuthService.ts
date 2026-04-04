import { apiClient } from '../../infrastructure/http/apiClient';

export class AuthService {
  static async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // 'admin' | 'adulto_mayor' | 'cuidador' | 'familiar' | 'medico' etc.
  phone?: string;
  cedula?: string;
  residence?: string;
  birth_date?: string;
  profile_image_url?: string;
  created_at?: string;
  isActive?: boolean;
  permissions?: string[];
}

export type Role = User['role'];

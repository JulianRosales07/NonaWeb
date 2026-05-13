import { apiClient } from '../../infrastructure/http/apiClient';

export interface AppointmentDTO {
  id: string;
  patient_id: string;
  title: string;
  specialty?: string;
  doctor_name?: string;
  location?: string;
  date: string;
  time?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: string;
  users?: {
    name: string;
    email: string;
  };
}

export interface CreateAppointmentDTO {
  patient_id: string;
  title: string;
  specialty?: string;
  doctor_name?: string;
  location?: string;
  date: string;
  time?: string;
  status?: string;
  notes?: string;
}

export class AppointmentService {
  static async getByPatient(patientId: string): Promise<AppointmentDTO[]> {
    const response = await apiClient.get(`/appointments/patient/${patientId}`);
    return response.data;
  }

  static async getById(id: string): Promise<AppointmentDTO> {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  }

  static async create(data: CreateAppointmentDTO): Promise<AppointmentDTO> {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  }

  static async update(id: string, data: Partial<CreateAppointmentDTO>): Promise<AppointmentDTO> {
    const response = await apiClient.put(`/appointments/${id}`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  }

  static async updateStatus(id: string, status: string): Promise<AppointmentDTO> {
    const response = await apiClient.patch(`/appointments/${id}/status`, { status });
    return response.data;
  }
}

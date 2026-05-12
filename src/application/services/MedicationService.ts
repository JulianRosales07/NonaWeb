import { apiClient } from '../../infrastructure/http/apiClient';
import type {
  Medication,
  CreateMedicationDTO,
  UpdateMedicationDTO,
} from '../../domain/models/Medication';
import { AxiosError } from 'axios';

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    if (!error.response) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    }

    const status = error.response.status;
    const backendMessage = error.response.data?.error || error.response.data?.message;

    if (status === 401) {
      throw new Error(backendMessage || 'No autorizado. Inicia sesión nuevamente.');
    }

    if (status === 403) {
      throw new Error(backendMessage || 'No tienes permisos para realizar esta acción.');
    }

    if (status === 404) {
      throw new Error(backendMessage || 'El medicamento no fue encontrado.');
    }

    if (status === 400) {
      throw new Error(backendMessage || 'Los datos enviados no son válidos.');
    }

    if (status >= 500) {
      throw new Error(backendMessage || 'Error interno del servidor. Intenta de nuevo más tarde.');
    }

    throw new Error(backendMessage || 'Ocurrió un error inesperado.');
  }

  throw new Error('Ocurrió un error inesperado.');
}

export class MedicationService {
  static async getAll(): Promise<Medication[]> {
    try {
      const response = await apiClient.get<Medication[]>('/medicines/all');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  static async getByPatient(patientId: number): Promise<Medication[]> {
    try {
      const response = await apiClient.get<Medication[]>(`/medicines/patient/${patientId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  static async search(query: string): Promise<Medication[]> {
    try {
      const response = await apiClient.get<Medication[]>('/medicines/search', {
        params: { query },
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  static async create(data: CreateMedicationDTO): Promise<Medication> {
    try {
      const response = await apiClient.post<Medication>('/medicines', data);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  static async update(id: number, data: UpdateMedicationDTO): Promise<Medication> {
    try {
      const response = await apiClient.put<Medication>(`/medicines/${id}`, data);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/medicines/${id}`);
    } catch (error) {
      handleError(error);
    }
  }

  static async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post<{ url: string }>('/upload/medicine-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (error) {
      handleError(error);
    }
  }
}

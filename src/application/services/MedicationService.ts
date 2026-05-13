import { apiClient } from '../../infrastructure/http/apiClient.ts';

export interface MedicineDTO {
  id: number;
  name: string;
  patient_id?: number;
  user_id?: number;
  dosage?: string;
  frequency?: string;
  time?: string;
  notes?: string;
  image_url?: string;
  created_at?: string;
  // Backend puede devolver el usuario como "users", "user", o "patient"
  users?: { id?: number; name: string; email?: string };
  user?: { id?: number; name: string; email?: string };
  patient?: { id?: number; name: string; email?: string };
}

// Helper para obtener el nombre del paciente de un medicamento
export function getMedPatientName(med: MedicineDTO): string | null {
  if (med.users?.name) return med.users.name;
  if (med.user?.name) return med.user.name;
  if (med.patient?.name) return med.patient.name;
  return null;
}

export function getMedPatientId(med: MedicineDTO): number | null {
  return med.user_id || med.patient_id || med.users?.id || med.user?.id || med.patient?.id || null;
}

export interface CreateMedicineDTO {
  patient_id?: number;
  user_id?: number;
  name: string;
  dosage?: string;
  frequency?: string;
  time?: string;
  notes?: string;
  imageUrl?: string;
}

export class MedicationService {
  static async getAllMedicines(): Promise<MedicineDTO[]> {
    const response = await apiClient.get('/medicines/all');
    const data = response.data;
    // DEBUG: ver estructura real de la API
    console.log('[NONA DEBUG] /medicines/all response:', JSON.stringify(data?.[0] || data, null, 2));
    // La API puede devolver un array directo o un objeto con una propiedad
    if (Array.isArray(data)) return data;
    if (data?.medicines) return data.medicines;
    if (data?.data) return data.data;
    return [];
  }

  static async getByPatient(patientId: string): Promise<MedicineDTO[]> {
    const response = await apiClient.get(`/medicines/patient/${patientId}`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data?.medicines) return data.medicines;
    if (data?.data) return data.data;
    return [];
  }

  static async search(query: string): Promise<MedicineDTO[]> {
    const response = await apiClient.get('/medicines/search', { params: { q: query } });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data?.medicines) return data.medicines;
    if (data?.data) return data.data;
    return [];
  }

  static async create(data: CreateMedicineDTO): Promise<MedicineDTO> {
    const response = await apiClient.post('/medicines', data);
    return response.data;
  }

  static async update(id: number, data: Partial<CreateMedicineDTO>): Promise<MedicineDTO> {
    const response = await apiClient.put(`/medicines/${id}`, data);
    return response.data;
  }

  static async createGlobalMedicine(name: string, imageUrl: string): Promise<MedicineDTO> {
    const response = await apiClient.post('/medicines', { name, imageUrl });
    return response.data;
  }

  static async importMedicines(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/medicines/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async downloadTemplate(): Promise<void> {
    const response = await apiClient.get('/medicines/template', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_medicamentos.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  static async updateGlobalMedicine(id: number, name: string, imageUrl: string): Promise<MedicineDTO> {
    const response = await apiClient.put(`/medicines/${id}`, { name, imageUrl });
    return response.data;
  }

  static async deleteMedicine(id: number): Promise<void> {
    await apiClient.delete(`/medicines/${id}`);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/medicines/${id}`);
  }
}

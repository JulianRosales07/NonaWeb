import { apiClient } from '../../infrastructure/http/apiClient.ts';


export interface MedicineDTO {
  id: number;
  name: string;
  patient_id?: number;
  dosage?: string;
  frequency?: string;
  time?: string;
  notes?: string;
  image_url?: string;
  created_at?: string;
  users?: {
    name: string;
    email: string;
  };
}


export class MedicationService {
  static async getAllMedicines(): Promise<MedicineDTO[]> {
    const response = await apiClient.get('/medicines/all');
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
}




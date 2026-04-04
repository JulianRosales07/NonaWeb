import { apiClient } from '../../infrastructure/http/apiClient';

export interface MedicineDTO {
  id: number;
  patient_id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes?: string;
  image_url?: string;
  created_at: string;
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
}

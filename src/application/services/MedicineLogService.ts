import { apiClient } from '../../infrastructure/http/apiClient';

export interface MedicineLog {
  id: number;
  medicine_id: number;
  patient_id: number;
  taken: boolean;
  taken_at?: string;
  scheduled_time?: string;
  notes?: string;
  created_at: string;
  medicines?: {
    name: string;
    dosage: string;
  };
}

export interface MedicineStats {
  total: number;
  taken: number;
  missed: number;
  pending: number;
  adherence_percentage: number;
}

export class MedicineLogService {
  static async getLogsByPatient(patientId: string): Promise<MedicineLog[]> {
    const response = await apiClient.get(`/medicine-logs/patient/${patientId}`);
    return response.data;
  }

  static async getStatsByPatient(patientId: string): Promise<MedicineStats> {
    const response = await apiClient.get(`/medicine-logs/stats/${patientId}`);
    return response.data;
  }

  static async checkMedicineTaken(medicineId: string, patientId: string): Promise<{ taken: boolean }> {
    const response = await apiClient.get(`/medicine-logs/check/${medicineId}/${patientId}`);
    return response.data;
  }

  static async registerLog(data: {
    medicine_id: number;
    patient_id: number;
    taken: boolean;
    notes?: string;
  }): Promise<MedicineLog> {
    const response = await apiClient.post('/medicine-logs/log', data);
    return response.data;
  }
}

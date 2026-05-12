export interface Medication {
  id: number;
  patient_id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes?: string;
  image_url?: string;
  added_by?: number;
  created_at: string;
  updated_at: string;
  // Relación opcional que viene del backend
  users?: {
    name: string;
    email: string;
  };
}

export interface CreateMedicationDTO {
  patient_id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes?: string;
  image_url?: string;
}

export interface UpdateMedicationDTO {
  name?: string;
  dosage?: string;
  frequency?: string;
  time?: string;
  notes?: string;
  image_url?: string;
}

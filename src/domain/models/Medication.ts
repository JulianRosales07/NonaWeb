export interface Medication {
  id: string;
  name: string;
  description: string;
  stock: number;
  consumed: number;
  unit: string;
  category?: string;
  lastUpdated: string;
}

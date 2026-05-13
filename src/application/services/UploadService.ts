import { apiClient } from '../../infrastructure/http/apiClient.ts';


export class UploadService {
  static async uploadMedicineImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/upload/medicine-image', formData);
    return response.data.url;

  }
}

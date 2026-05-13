import { apiClient } from '../../infrastructure/http/apiClient';

export interface Permissions {
  view_health: boolean;
  view_medications: boolean;
  view_appointments: boolean;
  edit_medications: boolean;
  edit_appointments: boolean;
}

export interface Relationship {
  id?: number;
  relationship_id?: number;
  caregiver_id: number;
  elderly_id: number;
  caregiver_name?: string;
  caregiver_email?: string;
  elderly_name?: string;
  elderly_cedula?: string;
  relationship_type?: 'familiar' | 'cuidador';
  permissions: Permissions;
  status: 'active' | 'pending' | 'inactive';
  created_at?: string;
}

export interface LinkByCedulaDTO {
  cedula: string;
  caregiver_id: number;
  relationship_type: 'familiar' | 'cuidador';
}

export interface CreateRelationshipDTO {
  caregiver_id: number;
  elderly_id: number;
  relationship_type?: string;
  permissions?: Partial<Permissions>;
}

export class RelationshipService {
  static async getAll(): Promise<Relationship[]> {
    // Fetch all relationships by getting all patients and their caregivers
    const response = await apiClient.get('/relationships/my-patients');
    return response.data || [];
  }

  static async getElderlyRelationships(elderlyId: number): Promise<Relationship[]> {
    const response = await apiClient.get(`/relationships/elderly/${elderlyId}`);
    return response.data.relationships || [];
  }

  static async getCaregiverRelationships(caregiverId: number): Promise<Relationship[]> {
    const response = await apiClient.get(`/relationships/caregiver/${caregiverId}`);
    return response.data.patients || [];
  }

  static async linkByCedula(data: LinkByCedulaDTO): Promise<Relationship> {
    const response = await apiClient.post('/relationships/link-by-cedula', data);
    return response.data;
  }

  static async createRelationship(data: CreateRelationshipDTO): Promise<Relationship> {
    const response = await apiClient.post('/relationships', data);
    return response.data;
  }

  static async updatePermissions(relationshipId: number, permissions: Permissions): Promise<Relationship> {
    const response = await apiClient.patch(`/relationships/${relationshipId}/permissions`, {
      permissions,
    });
    return response.data;
  }

  static async updateStatus(
    relationshipId: number,
    status: 'active' | 'pending' | 'inactive'
  ): Promise<Relationship> {
    const response = await apiClient.patch(`/relationships/${relationshipId}/status`, { status });
    return response.data;
  }

  static async deleteRelationship(relationshipId: number): Promise<void> {
    await apiClient.delete(`/relationships/${relationshipId}`);
  }

  static async checkPermission(params: {
    caregiver_id: number;
    elderly_id: number;
    permission: string;
  }): Promise<{ allowed: boolean }> {
    const response = await apiClient.get('/relationships/check-permission', { params });
    return response.data;
  }
}

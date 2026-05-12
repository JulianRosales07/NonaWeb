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
  elderly_name?: string;
  permissions: Permissions;
  status: string;
}

export interface CreateRelationshipDTO {
  caregiver_id: number;
  elderly_id: number;
  relationship_type?: string;
  permissions?: Partial<Permissions>;
}

export class RelationshipService {
  static async getElderlyRelationships(elderlyId: number) {
    const response = await apiClient.get(`/relationships/elderly/${elderlyId}`);
    return response.data.relationships || [];
  }

  static async getCaregiverRelationships(caregiverId: number) {
    const response = await apiClient.get(`/relationships/caregiver/${caregiverId}`);
    return response.data.patients || [];
  }

  static async createRelationship(data: CreateRelationshipDTO): Promise<Relationship> {
    const response = await apiClient.post('/relationships', data);
    return response.data;
  }

  static async updatePermissions(relationshipId: number, permissions: Permissions) {
    const response = await apiClient.patch(`/relationships/${relationshipId}/permissions`, {
      permissions
    });
    return response.data;
  }

  static async deleteRelationship(relationshipId: number): Promise<void> {
    await apiClient.delete(`/relationships/${relationshipId}`);
  }
}

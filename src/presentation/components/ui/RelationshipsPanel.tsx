import { useState } from 'react';
import { Activity, CalendarDays, RefreshCw, Users as UsersIcon, UserPlus, Trash2, LinkIcon } from 'lucide-react';
import { RelationshipService, type Permissions, type Relationship } from '../../../application/services/RelationshipService';
import type { User } from '../../../domain/models/User';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  user: User;
  relationships: Relationship[];
  loading: boolean;
  allUsers: User[];
  onRelationshipsChange: () => void;
}

function PermissionToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center justify-between group cursor-pointer">
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
      <div onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${checked ? 'bg-primary' : 'bg-slate-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </label>
  );
}

export function RelationshipsPanel({ user, relationships, loading, allUsers, onRelationshipsChange }: Props) {
  const [showCreateRel, setShowCreateRel] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creatingRel, setCreatingRel] = useState(false);
  const [deleteRelId, setDeleteRelId] = useState<number | null>(null);
  const [deletingRel, setDeletingRel] = useState(false);

  const isElderly = ['adultoMayor', 'adulto_mayor', 'Adulto Mayor'].includes(user.role);

  // Filter available users for new relationship (opposite role)
  const availableUsers = allUsers.filter(u => {
    if (u.id === user.id) return false;
    if (isElderly) return ['cuidador', 'familiar'].includes(u.role);
    return ['adultoMayor', 'adulto_mayor', 'Adulto Mayor'].includes(u.role);
  });

  const togglePermission = async (relId: number, key: keyof Permissions, perms: Permissions) => {
    const updated = { ...perms, [key]: !perms[key] };
    try {
      await RelationshipService.updatePermissions(relId, updated);
      onRelationshipsChange();
    } catch { alert('Error al guardar el permiso'); }
  };

  const handleCreateRelationship = async () => {
    if (!selectedUserId) return;
    setCreatingRel(true);
    try {
      const selectedUser = allUsers.find(u => String(u.id) === String(selectedUserId));
      // Backend requires relationship_type matching the caregiver's role
      const caregiverId = isElderly ? Number(selectedUserId) : Number(user.id);
      const elderlyId = isElderly ? Number(user.id) : Number(selectedUserId);
      const caregiverRole = isElderly ? (selectedUser?.role || 'cuidador') : user.role;

      await RelationshipService.createRelationship({
        caregiver_id: caregiverId,
        elderly_id: elderlyId,
        relationship_type: caregiverRole,
      });
      setShowCreateRel(false);
      setSelectedUserId('');
      onRelationshipsChange();
    } catch (err: any) {
      alert(`Error: ${err?.response?.data?.message || err?.response?.data?.error || err.message}`);
    } finally { setCreatingRel(false); }
  };

  const handleDeleteRelationship = async () => {
    if (!deleteRelId) return;
    setDeletingRel(true);
    try {
      await RelationshipService.deleteRelationship(deleteRelId);
      setDeleteRelId(null);
      onRelationshipsChange();
    } catch (err: any) {
      alert(`Error: ${err?.response?.data?.message || err.message}`);
    } finally { setDeletingRel(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Create Relationship Button */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">Vinculaciones Activas</h4>
        <button onClick={() => setShowCreateRel(!showCreateRel)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20">
          <UserPlus className="w-3.5 h-3.5" /> Nueva Relación
        </button>
      </div>

      {/* Create Relationship Form */}
      {showCreateRel && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-emerald-700">
            <LinkIcon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Vincular con {isElderly ? 'Cuidador/Familiar' : 'Adulto Mayor'}</span>
          </div>
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
            className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white">
            <option value="">Seleccionar usuario...</option>
            {availableUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} — {u.role} ({u.email})</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreateRel(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-all">
              Cancelar
            </button>
            <button onClick={handleCreateRelationship} disabled={!selectedUserId || creatingRel}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all">
              {creatingRel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              {creatingRel ? 'Creando...' : 'Vincular'}
            </button>
          </div>
        </div>
      )}

      {/* Relationships List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Buscando vinculaciones...</p>
        </div>
      ) : relationships.length === 0 ? (
        <div className="text-center bg-slate-50 rounded-2xl p-10 border-2 border-dashed border-slate-200">
          <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-50" />
          <p className="text-sm font-bold text-slate-600">No hay vinculaciones activas</p>
          <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed font-medium">
            Este usuario no tiene adultos mayores ni cuidadores vinculados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {relationships.map(rel => {
            const relId = rel.id ?? rel.relationship_id ?? 0;
            const targetName = rel.caregiver_name || rel.elderly_name || 'Participante';
            return (
              <div key={relId} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-800">
                      Conexión con: <span className="text-primary">{targetName}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-widest ring-1 ring-emerald-200">
                      {rel.status}
                    </span>
                    <button onClick={() => setDeleteRelId(relId)} title="Eliminar relación"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-rose-500" /> Salud & Meds
                    </h4>
                    <div className="space-y-3">
                      <PermissionToggle label="Ver Información Médica" checked={rel.permissions.view_health}
                        onChange={() => togglePermission(relId, 'view_health', rel.permissions)} />
                      <PermissionToggle label="Ver Medicamentos" checked={rel.permissions.view_medications}
                        onChange={() => togglePermission(relId, 'view_medications', rel.permissions)} />
                      <PermissionToggle label="Gestionar Inventario" checked={rel.permissions.edit_medications}
                        onChange={() => togglePermission(relId, 'edit_medications', rel.permissions)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Agenda & Citas
                    </h4>
                    <div className="space-y-3">
                      <PermissionToggle label="Visualizar Calendario" checked={rel.permissions.view_appointments}
                        onChange={() => togglePermission(relId, 'view_appointments', rel.permissions)} />
                      <PermissionToggle label="Agendar Nuevas Citas" checked={rel.permissions.edit_appointments}
                        onChange={() => togglePermission(relId, 'edit_appointments', rel.permissions)} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Relationship Confirm */}
      <ConfirmDialog open={deleteRelId !== null} title="Eliminar Vinculación"
        message="¿Seguro que deseas eliminar esta relación? El cuidador perderá acceso a la información del adulto mayor."
        loading={deletingRel} onConfirm={handleDeleteRelationship} onCancel={() => setDeleteRelId(null)} />
    </div>
  );
}

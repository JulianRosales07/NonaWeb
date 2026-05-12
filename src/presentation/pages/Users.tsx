import { useEffect, useState, useMemo } from 'react';
import { UserService } from '../../application/services/UserService';
import { RelationshipService, type Relationship } from '../../application/services/RelationshipService';
import type { User } from '../../domain/models/User';
import { Shield, Search, X, Users as UsersIcon, Settings2, RefreshCw, UserPlus, Trash2 } from 'lucide-react';
import { UserFormModal } from '../components/ui/UserFormModal';
import { RelationshipsPanel } from '../components/ui/RelationshipsPanel';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Delete user state
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Relationships state
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loadingRels, setLoadingRels] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Filtered users by search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.cedula && u.cedula.includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  }, [users, searchQuery]);

  // Load relationships for a user
  const loadRelationships = async (user: User) => {
    setLoadingRels(true);
    try {
      const isElderly = ['adultoMayor', 'adulto_mayor', 'Adulto Mayor'].includes(user.role);
      const isCaregiver = ['cuidador', 'familiar'].includes(user.role);
      if (isElderly) {
        setRelationships(await RelationshipService.getElderlyRelationships(Number(user.id)));
      } else if (isCaregiver) {
        setRelationships(await RelationshipService.getCaregiverRelationships(Number(user.id)));
      } else {
        setRelationships([]);
      }
    } catch { setRelationships([]); }
    finally { setLoadingRels(false); }
  };

  // === CRUD Handlers ===
  const handleCreateUser = async (data: Record<string, string>) => {
    setIsSaving(true);
    try {
      await UserService.createUser({
        name: data.name, email: data.email, password: data.password,
        role: data.role, phone: data.phone || undefined, cedula: data.cedula || undefined,
      });
      setShowCreateModal(false);
      await fetchUsers();
      showToast('success', `Usuario "${data.name}" creado exitosamente.`);
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err.message || 'Error al crear usuario');
    } finally { setIsSaving(false); }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setActiveTab('profile');
    loadRelationships(user);
  };

  const handleUpdateUser = async (data: Record<string, string>) => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const payload: Record<string, string> = { name: data.name, role: data.role, phone: data.phone, cedula: data.cedula };
      if (data.password) payload.password = data.password;
      await UserService.updateUser(editingUser.id, payload);
      setEditingUser(null);
      await fetchUsers();
      showToast('success', 'Perfil actualizado con éxito.');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err.message || 'Error al actualizar');
    } finally { setIsSaving(false); }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    setIsDeleting(true);
    try {
      await UserService.deleteUser(deletingUserId);
      setDeletingUserId(null);
      if (editingUser?.id === deletingUserId) setEditingUser(null);
      await fetchUsers();
      showToast('success', 'Usuario eliminado del sistema.');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err.message || 'Error al eliminar');
    } finally { setIsDeleting(false); }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200';
    if (['cuidador', 'familiar'].includes(role)) return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
    return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[80] px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in slide-in-from-right-4 duration-300 flex items-center gap-3
          ${toast.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-500/30' : 'bg-red-600 text-white shadow-red-500/30'}`}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="p-0.5 hover:bg-white/20 rounded"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500 mt-1">Administra cuidadores, familiares y adultos mayores del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Buscar usuario..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="h-11 inline-flex items-center gap-2 px-5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap">
            <UserPlus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Total Usuarios', count: users.length, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
          { label: 'Adultos Mayores', count: users.filter(u => ['adulto_mayor', 'adultoMayor', 'Adulto Mayor'].includes(u.role)).length, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
          { label: 'Cuidadores', count: users.filter(u => u.role === 'cuidador').length, color: 'from-sky-500 to-sky-600', shadow: 'shadow-sky-500/20' },
          { label: 'Familiares', count: users.filter(u => u.role === 'familiar').length, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} text-white ${s.shadow} shadow-xl p-5`}>
            <p className="text-xs font-medium text-white/80">{s.label}</p>
            <h3 className="text-3xl font-extrabold mt-1">{s.count}</h3>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-slate-50/50 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-semibold leading-none tracking-tight">Listado de Integrantes</h3>
            <p className="text-sm text-slate-500 mt-1">
              {filteredUsers.length} de {users.length} usuarios
            </p>
          </div>
          <button onClick={fetchUsers} className="p-2 text-slate-400 hover:text-primary transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Buscando en la base de datos...</p>
            </div>
          ) : error ? (
            <div className="m-6 p-4 text-red-500 bg-red-50 rounded-lg flex items-center gap-3 border border-red-100">
              <X className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Usuario Principal</th>
                    <th className="px-6 py-4">Rol del Sistema</th>
                    <th className="px-6 py-4">Contacto / ID</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 flex-none rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm ring-1 ring-primary/20">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3" />}
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-700 font-medium">{user.phone || 'Sin teléfono'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{user.cedula || 'Sin cédula'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(user)} title="Gestionar"
                            className="p-2 text-slate-400 hover:text-white hover:bg-primary transition-all rounded-lg shadow-sm bg-white border border-slate-100">
                            <Settings2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingUserId(user.id)} title="Eliminar"
                            className="p-2 text-slate-400 hover:text-white hover:bg-red-600 transition-all rounded-lg shadow-sm bg-white border border-slate-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="text-lg font-medium">
                          {searchQuery ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <UserFormModal open={showCreateModal} user={null} saving={isSaving}
        onSave={handleCreateUser} onClose={() => setShowCreateModal(false)} />

      {/* EDIT USER MODAL (Multi-tab) */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setEditingUser(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col max-h-[90vh] relative z-10 border border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-primary/5">
                  {editingUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">Configurar Perfil</h2>
                  <p className="text-sm text-slate-500 font-medium">{editingUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setDeletingUserId(editingUser.id); }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Eliminar usuario">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingUser(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-6 pt-2 bg-slate-50/50 border-b border-slate-200 gap-1">
              <button onClick={() => setActiveTab('profile')}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                Información Personal
              </button>
              <button onClick={() => setActiveTab('permissions')}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'permissions' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                Relaciones y Permisos <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {activeTab === 'profile' && (
                <EditProfileTab user={editingUser} saving={isSaving} onSave={handleUpdateUser} />
              )}
              {activeTab === 'permissions' && (
                <RelationshipsPanel user={editingUser} relationships={relationships}
                  loading={loadingRels} allUsers={users} onRelationshipsChange={() => loadRelationships(editingUser)} />
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 flex justify-end rounded-b-2xl border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setEditingUser(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:text-slate-700 hover:bg-slate-50 transition-all">
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRM */}
      <ConfirmDialog open={deletingUserId !== null} title="Eliminar Usuario"
        message="Esta acción eliminará permanentemente al usuario y todas sus relaciones del sistema. ¿Estás seguro?"
        loading={isDeleting} onConfirm={handleDeleteUser} onCancel={() => setDeletingUserId(null)} />
    </div>
  );
}

// === Inline Edit Profile Tab ===
function EditProfileTab({ user, saving, onSave }: { user: User; saving: boolean; onSave: (d: Record<string, string>) => void }) {
  const [form, setForm] = useState({ name: user.name, role: user.role, phone: user.phone || '', cedula: user.cedula || '', password: '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Sync form when user changes
  useEffect(() => {
    setForm({ name: user.name, role: user.role, phone: user.phone || '', cedula: user.cedula || '', password: '' });
  }, [user.id]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Celular / Teléfono</label>
        <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Número de Cédula</label>
        <input type="text" value={form.cedula} onChange={e => set('cedula', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rol Administrativo / App</label>
        <select value={form.role} onChange={e => set('role', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
          <option value="cuidador">Cuidador</option>
          <option value="familiar">Familiar</option>
          <option value="adulto_mayor">Adulto Mayor</option>
          <option value="admin">Administrador del Panel</option>
        </select>
      </div>
      <div className="sm:col-span-2 mt-4 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Nueva Contraseña</label>
          <input type="password" placeholder="Dejar en blanco para no cambiar..." value={form.password}
            onChange={e => set('password', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Solo si el usuario requiere reinicio de clave.</p>
        </div>
      </div>
      <div className="sm:col-span-2 flex justify-end mt-4">
        <button onClick={() => onSave(form)} disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Guardando...' : 'Actualizar Perfil'}
        </button>
      </div>
    </div>
  );
}

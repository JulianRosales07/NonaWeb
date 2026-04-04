import { useEffect, useState } from 'react';
import { UserService } from '../../application/services/UserService';
import { RelationshipService, type Permissions, type Relationship } from '../../application/services/RelationshipService';
import type { User } from '../../domain/models/User';
import { Shield, Search, X, Save, Key, Users as UsersIcon, Settings2, Activity, CalendarDays, RefreshCw } from 'lucide-react';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions'>('profile');
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    cedula: '',
    password: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Relationships state
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loadingRels, setLoadingRels] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = async (user: User) => {
    setEditingUser(user);
    setActiveTab('profile');
    setFormData({
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      cedula: user.cedula || '',
      password: ''
    });

    // Cargar relaciones basado en su rol
    setLoadingRels(true);
    try {
      const isElderly = ['adultoMayor', 'adulto_mayor', 'Adulto Mayor'].includes(user.role);
      const isCaregiver = ['cuidador', 'familiar'].includes(user.role);

      if (isElderly) {
        const rels = await RelationshipService.getElderlyRelationships(Number(user.id));
        setRelationships(rels);
      } else if (isCaregiver) {
        const rels = await RelationshipService.getCaregiverRelationships(Number(user.id));
        setRelationships(rels);
      } else {
        setRelationships([]);
      }
    } catch (err) {
      console.error("No se pudieron cargar las relaciones", err);
    } finally {
      setLoadingRels(false);
    }
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleSaveProfile = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await UserService.updateUser(editingUser.id, formData);
      await fetchUsers();
      alert('Perfil guardado con éxito.');
    } catch (err: any) {
      alert(`Error guardando usuario: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = async (relId: number, permissionKey: keyof Permissions, currentPerms: Permissions) => {
    const updatedPerms = { ...currentPerms, [permissionKey]: !currentPerms[permissionKey] };
    
    // Optimistic UI update
    setRelationships(prev => prev.map(r => {
      const id = r.id ?? r.relationship_id;
      return (id === relId) ? { ...r, permissions: updatedPerms } : r;
    }));

    try {
      await RelationshipService.updatePermissions(relId, updatedPerms);
    } catch (err) {
      alert('Error al guardar el permiso');
      // Refetch to reset state
      if (editingUser) openEditModal(editingUser);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500 mt-1">Administra cuidadores, familiares y médicos del sistema.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar usuario..." 
            className="pl-9 h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-slate-50/50 border-b border-slate-100">
           <div>
              <h3 className="text-xl font-semibold leading-none tracking-tight">Listado de Integrantes</h3>
              <p className="text-sm text-slate-500 mt-1">Visualiza y gestiona la base de datos completa de Nona</p>
           </div>
           <button onClick={() => fetchUsers()} className="p-2 text-slate-400 hover:text-primary transition-colors">
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
                  {users.map((user) => (
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' :
                            ['cuidador', 'familiar'].includes(user.role) ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' :
                            'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                          }`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3" />}
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-700 font-medium">{user.phone || 'Sin teléfono'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{user.cedula || 'Sin cédula'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-primary transition-all rounded-lg shadow-sm bg-white border border-slate-100"
                          title="Gestionar"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="text-lg font-medium">No hay usuarios registrados</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL MULTITABS */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeEditModal} />
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col max-h-[90vh] relative z-10 border border-slate-200">
            {/* Header Modal */}
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
              <button onClick={closeEditModal} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tabs Navigation */}
            <div className="flex px-6 pt-2 bg-slate-50/50 border-b border-slate-200 gap-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
              >
                Información Personal
              </button>
              <button 
                onClick={() => setActiveTab('permissions')}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'permissions' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
              >
                Relaciones y Permisos <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Celular / Teléfono</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Número de Cédula</label>
                    <input 
                      type="text" 
                      value={formData.cedula}
                      onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rol Administrativo / App</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    >
                      <option value="cuidador">Cuidador</option>
                      <option value="familiar">Familiar</option>
                      <option value="adulto_mayor">Adulto Mayor</option>
                      <option value="admin">Administrador del Panel</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 mt-4 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                         <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nueva Contraseña</label>
                          <input 
                            type="password" 
                            placeholder="Dejar en blanco para no cambiar..." 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Utiliza esta opción solo si el usuario ha olvidado su clave o requiere un reinicio de seguridad.</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex justify-end mt-4">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:grayscale"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? 'Guardando...' : 'Actualizar Perfil'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {loadingRels ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400">
                       <RefreshCw className="w-8 h-8 animate-spin" />
                       <p className="text-sm font-medium">Buscando vinculaciones activas...</p>
                    </div>
                  ) : relationships.length === 0 ? (
                    <div className="text-center bg-slate-50 rounded-2xl p-10 border-2 border-dashed border-slate-200">
                      <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-bold text-slate-600">No hay vinculaciones activas</p>
                      <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed font-medium transition-opacity">Este usuario no tiene adultos mayores ni cuidadores vinculados bajo la App actualmente.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {relationships.map((rel) => {
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
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-widest ring-1 ring-emerald-200">
                              {rel.status}
                            </span>
                          </div>
                          
                          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Salud y Meds */}
                            <div className="space-y-4">
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] mb-2 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-rose-500" /> Salúd & Meds
                              </h4>
                              <div className="space-y-3">
                                <PermissionToggle 
                                  label="Ver Información Médica" 
                                  checked={rel.permissions.view_health} 
                                  onChange={() => togglePermission(relId, 'view_health', rel.permissions)} 
                                />
                                <PermissionToggle 
                                  label="Ver Medicamentos" 
                                  checked={rel.permissions.view_medications} 
                                  onChange={() => togglePermission(relId, 'view_medications', rel.permissions)} 
                                />
                                <PermissionToggle 
                                  label="Gestionar Inventario" 
                                  checked={rel.permissions.edit_medications} 
                                  onChange={() => togglePermission(relId, 'edit_medications', rel.permissions)} 
                                />
                              </div>
                            </div>

                            {/* Citas y Agenda */}
                            <div className="space-y-4">
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] mb-2 flex items-center gap-2">
                                <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Agenda & Citas
                              </h4>
                              <div className="space-y-3">
                                <PermissionToggle 
                                  label="Visualizar Calendario" 
                                  checked={rel.permissions.view_appointments} 
                                  onChange={() => togglePermission(relId, 'view_appointments', rel.permissions)} 
                                />
                                <PermissionToggle 
                                  label="Agendar Nuevas Citas" 
                                  checked={rel.permissions.edit_appointments} 
                                  onChange={() => togglePermission(relId, 'edit_appointments', rel.permissions)} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-100 flex-shrink-0">
              <button 
                onClick={closeEditModal}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:text-slate-700 hover:bg-slate-50 transition-all font-medium"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponente de Switch estilizado
function PermissionToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
  return (
    <label className="flex items-center justify-between group cursor-pointer">
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
      <div 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${checked ? 'bg-primary' : 'bg-slate-200'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </div>
    </label>
  );
}

import { useState, useEffect } from 'react';
import { UserService } from '../../application/services/UserService';
import type { User } from '../../domain/models/User';
import { User as UserIcon, Mail, Phone, Shield, Save, RefreshCw } from 'lucide-react';

export function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    cedula: '',
    password: ''
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await UserService.getProfile();
        setUser(profile);
        setForm({
          name: profile.name || '',
          phone: profile.phone || '',
          cedula: profile.cedula || '',
          password: ''
        });
      } catch (err: any) {
        setError(err.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData: Partial<User> & { password?: string } = {
        name: form.name,
        phone: form.phone,
        cedula: form.cedula,
      };
      if (form.password.trim() !== '') {
        updateData.password = form.password;
      }

      const updatedUser = await UserService.updateMyProfile(updateData);
      setUser(updatedUser);
      showToast('success', 'Perfil actualizado exitosamente');
      setForm(prev => ({ ...prev, password: '' })); // Clear password field
    } catch (err: any) {
      showToast('error', err?.response?.data?.error || err.message || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">Cargando configuración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 text-center">
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-1">Gestiona tu perfil y credenciales de administrador.</p>
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg font-medium text-white flex items-center gap-2 animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg text-primary text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mt-2 uppercase tracking-wider">{user?.role}</p>
          
          <div className="w-full mt-8 space-y-4 text-left">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">{user?.phone || 'Sin registrar'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">Acceso Total (Admin)</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
            <UserIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-800">Actualizar Información</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico (Solo Lectura)</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teléfono</label>
                <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cédula</label>
                <input type="text" value={form.cedula} onChange={e => set('cedula', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Seguridad</h4>
              <div className="space-y-1.5 max-w-sm">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nueva Contraseña</label>
                <input type="password" placeholder="Dejar en blanco para no cambiar..." value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

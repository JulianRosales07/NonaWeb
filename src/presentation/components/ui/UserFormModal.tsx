import { useState } from 'react';
import { X, Save, RefreshCw, Key, UserPlus } from 'lucide-react';
import type { User } from '../../../domain/models/User';

interface Props {
  open: boolean;
  user: User | null; // null = create mode
  saving: boolean;
  onSave: (data: Record<string, string>) => void;
  onClose: () => void;
}

const ROLES = [
  { value: 'cuidador', label: 'Cuidador' },
  { value: 'familiar', label: 'Familiar' },
  { value: 'adulto_mayor', label: 'Adulto Mayor' },
  { value: 'admin', label: 'Administrador' },
];

export function UserFormModal({ open, user, saving, onSave, onClose }: Props) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'cuidador',
    phone: user?.phone || '',
    cedula: user?.cedula || '',
    password: '',
  });

  // Reset form when user changes
  const key = user?.id || 'new';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 relative z-10 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${isEdit ? 'bg-primary shadow-primary/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {isEdit ? user.name.charAt(0).toUpperCase() : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
              <p className="text-xs text-slate-500 font-medium">{isEdit ? user.email : 'Registrar un nuevo integrante al sistema'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form key={key} onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre Completo *</label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico *</label>
              <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rol *</label>
            <select required value={form.role} onChange={e => set('role', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Password */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Key className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">{isEdit ? 'Cambiar Contraseña' : 'Contraseña *'}</span>
            </div>
            <input type="password" placeholder={isEdit ? 'Dejar en blanco para no cambiar...' : 'Contraseña del usuario'}
              required={!isEdit} value={form.password} onChange={e => set('password', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg disabled:opacity-50 ${isEdit ? 'bg-primary hover:bg-blue-700 shadow-blue-500/25' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'}`}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

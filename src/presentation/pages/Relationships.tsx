import { useState, useEffect, useMemo } from 'react';
import {
  Link2,
  Plus,
  Search,
  RefreshCw,
  X,
  Save,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RelationshipService,
  type Relationship,
  type Permissions,
} from '../../application/services/RelationshipService';
import { UserService } from '../../application/services/UserService';
import type { User } from '../../domain/models/User';

const STATUS_CONFIG = {
  active: { label: 'Activa', icon: CheckCircle, cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  pending: { label: 'Pendiente', icon: Clock, cls: 'bg-amber-100 text-amber-700 ring-amber-200' },
  inactive: { label: 'Inactiva', icon: XCircle, cls: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

const TYPE_CONFIG = {
  familiar: { label: 'Familiar', cls: 'bg-sky-100 text-sky-700' },
  cuidador: { label: 'Cuidador', cls: 'bg-purple-100 text-purple-700' },
};

export function Relationships() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Link by cedula modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ cedula: '', caregiver_id: 0, relationship_type: 'familiar' as 'familiar' | 'cuidador' });
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Expanded row for permissions
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [savingPerms, setSavingPerms] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [users] = await Promise.all([UserService.getAllUsers()]);
      const elderlyPatients = users.filter((u) =>
        ['adulto_mayor', 'adultoMayor', 'Adulto Mayor'].includes(u.role)
      );
      setPatients(elderlyPatients);

      // Fetch relationships for each elderly patient
      const allRels: Relationship[] = [];
      await Promise.all(
        elderlyPatients.map(async (p) => {
          try {
            const rels = await RelationshipService.getElderlyRelationships(Number(p.id));
            rels.forEach((r: Relationship) => {
              if (!allRels.find((x) => (x.id ?? x.relationship_id) === (r.id ?? r.relationship_id))) {
                allRels.push({ ...r, elderly_name: r.elderly_name || p.name });
              }
            });
          } catch {
            // skip if patient has no relationships
          }
        })
      );
      setRelationships(allRels);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las relaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return relationships.filter((r) => {
      const name = `${r.elderly_name || ''} ${r.caregiver_name || ''}`.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase());
      const matchStatus = !filterStatus || r.status === filterStatus;
      const matchType = !filterType || r.relationship_type === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [relationships, search, filterStatus, filterType]);

  const handleLinkByCedula = async () => {
    if (!linkForm.cedula.trim() || !linkForm.caregiver_id) {
      setLinkError('Cédula del adulto mayor y cuidador/familiar son obligatorios.');
      return;
    }
    setLinking(true);
    setLinkError(null);
    try {
      await RelationshipService.linkByCedula(linkForm);
      await fetchData();
      setShowLinkModal(false);
      setLinkForm({ cedula: '', caregiver_id: 0, relationship_type: 'familiar' });
    } catch (err: any) {
      setLinkError(err.response?.data?.message || err.message || 'Error al vincular');
    } finally {
      setLinking(false);
    }
  };

  const togglePermission = async (rel: Relationship, key: keyof Permissions) => {
    const relId = rel.id ?? rel.relationship_id ?? 0;
    const updated: Permissions = { ...rel.permissions, [key]: !rel.permissions[key] };
    setSavingPerms(true);
    setRelationships((prev) =>
      prev.map((r) => ((r.id ?? r.relationship_id) === relId ? { ...r, permissions: updated } : r))
    );
    try {
      await RelationshipService.updatePermissions(relId, updated);
    } catch {
      alert('Error al guardar el permiso');
      await fetchData();
    } finally {
      setSavingPerms(false);
    }
  };

  const handleStatusChange = async (rel: Relationship, status: 'active' | 'pending' | 'inactive') => {
    const relId = rel.id ?? rel.relationship_id ?? 0;
    setRelationships((prev) =>
      prev.map((r) => ((r.id ?? r.relationship_id) === relId ? { ...r, status } : r))
    );
    try {
      await RelationshipService.updateStatus(relId, status);
    } catch {
      alert('Error al cambiar el estado');
      await fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await RelationshipService.deleteRelationship(id);
      setRelationships((prev) => prev.filter((r) => (r.id ?? r.relationship_id) !== id));
      setDeletingId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name?: string) =>
    (name || '?')
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Relaciones <Link2 className="text-primary w-6 h-6" />
          </h1>
          <p className="text-slate-500 mt-1">
            Vínculos entre adultos mayores y sus cuidadores o familiares.
          </p>
        </div>
        <button
          onClick={() => { setShowLinkModal(true); setLinkError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          Vincular por cédula
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm min-w-[150px]"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="pending">Pendiente</option>
          <option value="inactive">Inactiva</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm min-w-[140px]"
        >
          <option value="">Todos los tipos</option>
          <option value="familiar">Familiar</option>
          <option value="cuidador">Cuidador</option>
        </select>
        <button
          onClick={fetchData}
          className="h-11 px-3 text-slate-400 hover:text-primary transition-colors border border-slate-200 rounded-xl bg-white shadow-sm"
          title="Actualizar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-slate-50/50 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-semibold leading-none tracking-tight">
              Vínculos registrados
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {filtered.length} relación{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Cargando relaciones...</p>
          </div>
        ) : error ? (
          <div className="m-6 p-4 text-red-500 bg-red-50 rounded-lg flex items-center gap-3 border border-red-100">
            <X className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                <Link2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-lg font-medium">No hay relaciones</p>
                <p className="text-sm mt-1">Vincula un cuidador o familiar con el botón de arriba.</p>
              </div>
            ) : (
              filtered.map((rel) => {
                const relId = rel.id ?? rel.relationship_id ?? 0;
                const isExpanded = expandedId === relId;
                const statusCfg = STATUS_CONFIG[rel.status] || STATUS_CONFIG.pending;
                const typeCfg = rel.relationship_type
                  ? TYPE_CONFIG[rel.relationship_type]
                  : { label: 'Desconocido', cls: 'bg-slate-100 text-slate-500' };
                const StatusIcon = statusCfg.icon;

                return (
                  <div key={relId}>
                    {/* Row */}
                    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                      {/* Elderly */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                          {getInitials(rel.elderly_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {rel.elderly_name || `Paciente #${rel.elderly_id}`}
                          </p>
                          {rel.elderly_cedula && (
                            <p className="text-[10px] text-slate-400 font-mono">Ced. {rel.elderly_cedula}</p>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="text-slate-300 hidden sm:block">→</div>

                      {/* Caregiver */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                          {getInitials(rel.caregiver_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {rel.caregiver_name || `Cuidador #${rel.caregiver_id}`}
                          </p>
                          {rel.caregiver_email && (
                            <p className="text-[10px] text-slate-400 truncate">{rel.caregiver_email}</p>
                          )}
                        </div>
                      </div>

                      {/* Type */}
                      <span className={`hidden md:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${typeCfg.cls}`}>
                        {typeCfg.label}
                      </span>

                      {/* Status */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ring-1 ${statusCfg.cls}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : relId)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Ver permisos"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeletingId(relId)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded permissions */}
                    {isExpanded && (
                      <div className="px-6 pb-6 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Status change */}
                          <div className="sm:col-span-2 flex items-center gap-3 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Cambiar estado:
                            </span>
                            {(['active', 'pending', 'inactive'] as const).map((s) => {
                              const cfg = STATUS_CONFIG[s];
                              return (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(rel, s)}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ring-1 transition-all ${
                                    rel.status === s
                                      ? cfg.cls + ' ring-2'
                                      : 'bg-white text-slate-400 ring-slate-200 hover:ring-slate-300'
                                  }`}
                                >
                                  {cfg.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Health & Meds */}
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] mb-3 flex items-center gap-2">
                              <Activity className="w-3.5 h-3.5 text-rose-500" /> Salud y Medicamentos
                            </h4>
                            <div className="space-y-3">
                              <PermToggle
                                label="Ver información médica"
                                checked={rel.permissions.view_health}
                                onChange={() => togglePermission(rel, 'view_health')}
                                disabled={savingPerms}
                              />
                              <PermToggle
                                label="Ver medicamentos"
                                checked={rel.permissions.view_medications}
                                onChange={() => togglePermission(rel, 'view_medications')}
                                disabled={savingPerms}
                              />
                              <PermToggle
                                label="Editar medicamentos"
                                checked={rel.permissions.edit_medications}
                                onChange={() => togglePermission(rel, 'edit_medications')}
                                disabled={savingPerms}
                              />
                            </div>
                          </div>

                          {/* Appointments */}
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] mb-3 flex items-center gap-2">
                              <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Agenda y Citas
                            </h4>
                            <div className="space-y-3">
                              <PermToggle
                                label="Ver citas"
                                checked={rel.permissions.view_appointments}
                                onChange={() => togglePermission(rel, 'view_appointments')}
                                disabled={savingPerms}
                              />
                              <PermToggle
                                label="Editar citas"
                                checked={rel.permissions.edit_appointments}
                                onChange={() => togglePermission(rel, 'edit_appointments')}
                                disabled={savingPerms}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Link by cedula modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowLinkModal(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative z-10 border border-slate-200">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Vincular por cédula</h2>
                  <p className="text-xs text-slate-500">Ingresa la cédula del adulto mayor</p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {linkError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {linkError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Cédula del adulto mayor *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1020345678"
                  value={linkForm.cedula}
                  onChange={(e) => setLinkForm({ ...linkForm, cedula: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Cuidador / Familiar *
                </label>
                <select
                  value={linkForm.caregiver_id || ''}
                  onChange={(e) => setLinkForm({ ...linkForm, caregiver_id: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                >
                  <option value="">Seleccionar usuario...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tipo de relación *
                </label>
                <div className="flex gap-3">
                  {(['familiar', 'cuidador'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setLinkForm({ ...linkForm, relationship_type: t })}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl border transition-all ${
                        linkForm.relationship_type === t
                          ? 'bg-primary text-white border-primary shadow-lg shadow-blue-500/20'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleLinkByCedula}
                disabled={linking}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {linking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {linking ? 'Vinculando...' : 'Vincular'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setDeletingId(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Eliminar relación</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar este vínculo del sistema?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PermToggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center justify-between group ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
        {label}
      </span>
      <div
        onClick={disabled ? undefined : onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'bg-primary' : 'bg-slate-200'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </label>
  );
}

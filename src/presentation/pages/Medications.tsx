import { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  Plus,
  Search,
  RefreshCw,
  X,
  Save,
  Trash2,
  Edit2,
  Clock,
  User,
} from 'lucide-react';
import { MedicationService, type MedicineDTO, type CreateMedicineDTO, getMedPatientName, getMedPatientId } from '../../application/services/MedicationService';
import { UserService } from '../../application/services/UserService';
import type { User as UserModel } from '../../domain/models/User';

const FREQUENCY_OPTIONS = [
  'Una vez al día',
  'Dos veces al día',
  'Tres veces al día',
  'Cada 8 horas',
  'Cada 12 horas',
  'Cada 6 horas',
  'Según necesidad',
];

const emptyForm: CreateMedicineDTO = {
  user_id: 0,
  name: '',
  dosage: '',
  frequency: '',
  time: '',
  notes: '',
};

export function Medications() {
  const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
  const [patients, setPatients] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterPatient, setFilterPatient] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicineDTO | null>(null);
  const [form, setForm] = useState<CreateMedicineDTO>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [allUsers, setAllUsers] = useState<UserModel[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meds, users] = await Promise.all([
        MedicationService.getAllMedicines(),
        UserService.getAllUsers(),
      ]);
      setMedicines(meds);
      setAllUsers(users);
      const elderlyPatients = users.filter((u) =>
        ['adulto_mayor', 'adultoMayor', 'Adulto Mayor'].includes(u.role)
      );
      setPatients(elderlyPatients);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los medicamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return medicines.filter((m) => {
      const pName = getMedPatientName(m) || '';
      const matchSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        pName.toLowerCase().includes(search.toLowerCase());
      const pid = getMedPatientId(m);
      const matchPatient =
        !filterPatient || String(pid) === filterPatient;
      return matchSearch && matchPatient;
    });
  }, [medicines, search, filterPatient]);

  const openCreate = () => {
    setEditingMed(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (med: MedicineDTO) => {
    setEditingMed(med);
    setForm({
      user_id: med.user_id || med.patient_id || 0,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      time: med.time,
      notes: med.notes || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMed(null);
    setFormError(null);
  };

  const handleSave = async () => {
    const userId = form.user_id || form.patient_id || 0;
    if (!form.name.trim() || !form.dosage.trim() || !form.frequency.trim() || !userId) {
      setFormError('Nombre, dosis, frecuencia y paciente son obligatorios.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = { ...form, user_id: userId };
      if (editingMed) {
        await MedicationService.update(editingMed.id, payload);
      } else {
        await MedicationService.create(payload);
      }
      await fetchData();
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.response?.data?.error || err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await MedicationService.delete(id);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      setDeletingId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Medicamentos <Pill className="text-primary w-6 h-6" />
          </h1>
          <p className="text-slate-500 mt-1">
            Catálogo completo de medicamentos por paciente.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          Agregar medicamento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <select
          value={filterPatient}
          onChange={(e) => setFilterPatient(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm min-w-[180px]"
        >
          <option value="">Todos los pacientes</option>
          {patients.length > 0 && (
            <optgroup label="Adultos Mayores">
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </optgroup>
          )}
          {allUsers.filter(u => !['adulto_mayor', 'adultoMayor', 'Adulto Mayor'].includes(u.role)).length > 0 && (
            <optgroup label="Otros usuarios">
              {allUsers.filter(u => !['adulto_mayor', 'adultoMayor', 'Adulto Mayor'].includes(u.role)).map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </optgroup>
          )}
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
            <h3 className="text-xl font-semibold leading-none tracking-tight">Inventario Actual</h3>
            <p className="text-sm text-slate-500 mt-1">
              {filtered.length} medicamento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Cargando medicamentos...</p>
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
                  <th className="px-6 py-4">Medicamento</th>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Dosis</th>
                  <th className="px-6 py-4">Frecuencia / Hora</th>
                  <th className="px-6 py-4">Registrado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {med.image_url ? (
                          <img
                            src={med.image_url}
                            alt={med.name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{med.name}</p>
                          {med.notes && (
                            <p className="text-xs text-slate-400 truncate max-w-[160px]">{med.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const pid = getMedPatientId(med);
                          const patientName = getMedPatientName(med) || (pid ? allUsers.find(u => String(u.id) === String(pid))?.name : null) || 'No asignado';
                          return (
                            <>
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                {patientName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-slate-700 font-medium text-sm">
                                {patientName}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{med.dosage}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{med.frequency}</p>
                      {med.time && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {med.time}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(med.created_at).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(med)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(med.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <Pill className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p className="text-lg font-medium">No hay medicamentos</p>
                      <p className="text-sm mt-1">Agrega el primero con el botón de arriba.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 relative z-10 border border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingMed ? 'Editar Medicamento' : 'Nuevo Medicamento'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingMed ? `Modificando: ${editingMed.name}` : 'Completa los datos del medicamento'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Paciente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={form.user_id || form.patient_id || ''}
                    onChange={(e) => setForm({ ...form, user_id: Number(e.target.value) })}
                    className="pl-9 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                  >
                    <option value="">Seleccionar paciente (adulto mayor)...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Nombre del medicamento *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Enalapril"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Dosis *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 10mg"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Hora(s)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 8:00 AM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Frecuencia *
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                >
                  <option value="">Seleccionar frecuencia...</option>
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Notas / Indicaciones
                </label>
                <textarea
                  placeholder="Instrucciones adicionales..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando...' : editingMed ? 'Actualizar' : 'Crear Medicamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setDeletingId(null)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Eliminar medicamento</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar este medicamento del sistema?
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

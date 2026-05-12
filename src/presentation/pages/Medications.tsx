import { useState, useEffect, useCallback } from 'react';
import { Pill, Plus, AlertCircle, RefreshCcw } from 'lucide-react';
import { MedicationService } from '../../application/services/MedicationService';
import { UserService } from '../../application/services/UserService';
import type {
  Medication,
  CreateMedicationDTO,
  UpdateMedicationDTO,
} from '../../domain/models/Medication';
import { SearchInput } from '../components/ui/SearchInput';
import { PatientFilter } from '../components/medications/PatientFilter';
import type { PatientOption } from '../components/medications/PatientFilter';
import { MedicationTable } from '../components/medications/MedicationTable';
import { MedicationFormModal } from '../components/medications/MedicationFormModal';
import { DeleteConfirmDialog } from '../components/medications/DeleteConfirmDialog';

export function Medications() {
  // Data state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Form modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>(undefined);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMedication, setDeletingMedication] = useState<Medication | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Success notification
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch patients on mount
  useEffect(() => {
    async function fetchPatients() {
      try {
        const users = await UserService.getAllUsers();
        const patientOptions: PatientOption[] = users
          .filter((u) => u.role === 'adulto_mayor')
          .map((u) => ({ id: String(u.id), name: u.name }));
        setPatients(patientOptions);
      } catch {
        // Patients fetch failure is non-critical; filter will be empty
      }
    }
    fetchPatients();
  }, []);

  // Fetch medications based on filters
  const fetchMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Medication[];
      if (selectedPatientId) {
        data = await MedicationService.getByPatient(Number(selectedPatientId));
      } else if (searchQuery) {
        data = await MedicationService.search(searchQuery);
      } else {
        data = await MedicationService.getAll();
      }
      setMedications(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los medicamentos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId, searchQuery]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSelectedPatientId(null);
  };

  const handlePatientFilter = (patientId: string | null) => {
    setSelectedPatientId(patientId);
    setSearchQuery('');
  };

  const handleCreate = () => {
    setEditingMedication(undefined);
    setFormModalOpen(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (
    data: CreateMedicationDTO | UpdateMedicationDTO,
    imageFile?: File
  ) => {
    let imageUrl: string | undefined;

    if (imageFile) {
      imageUrl = await MedicationService.uploadImage(imageFile);
    }

    if (editingMedication) {
      const updateData: UpdateMedicationDTO = { ...data };
      if (imageUrl) updateData.image_url = imageUrl;
      await MedicationService.update(editingMedication.id, updateData);
      setSuccessMessage('Medicamento actualizado exitosamente');
    } else {
      const createData: CreateMedicationDTO = data as CreateMedicationDTO;
      if (imageUrl) createData.image_url = imageUrl;
      await MedicationService.create(createData);
      setSuccessMessage('Medicamento creado exitosamente');
    }

    setFormModalOpen(false);
    setEditingMedication(undefined);
    fetchMedications();
  };

  const handleDeleteClick = (medication: Medication) => {
    setDeletingMedication(medication);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMedication) return;
    setDeleteLoading(true);
    try {
      await MedicationService.delete(deletingMedication.id);
      setDeleteDialogOpen(false);
      setDeletingMedication(undefined);
      setSuccessMessage('Medicamento eliminado exitosamente');
      fetchMedications();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el medicamento';
      setError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingMedication(undefined);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          Control de Medicamentos <Pill className="text-primary w-6 h-6" />
        </h1>
        <p className="text-slate-500 mt-1">
          Gestiona los medicamentos asignados a los pacientes.
        </p>
      </div>

      {/* Success toast */}
      {successMessage && (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 flex items-center justify-between dark:border-red-800 dark:bg-red-950">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchMedications}
            className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <SearchInput
          placeholder="Buscar medicamento..."
          value={searchQuery}
          onChange={handleSearch}
          debounceMs={300}
          className="w-full sm:w-64"
        />
        <PatientFilter
          patients={patients}
          selectedPatientId={selectedPatientId}
          onChange={handlePatientFilter}
          className="w-full sm:w-56"
        />
        <button
          onClick={handleCreate}
          className="ml-auto h-10 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 shadow-lg shadow-primary/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo
        </button>
      </div>

      {/* Medication table */}
      <div className="rounded-xl border border-border bg-background shadow-sm">
        <MedicationTable
          medications={medications}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />
      </div>

      {/* Form modal */}
      <MedicationFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingMedication(undefined);
        }}
        onSubmit={handleFormSubmit}
        medication={editingMedication}
        patients={patients}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        medicationName={deletingMedication?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  );
}

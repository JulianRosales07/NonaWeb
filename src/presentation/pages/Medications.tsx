import { useState, useEffect, useRef } from 'react';
import { Pill, Plus, Search, Download, FileUp, Loader2, Eye, Edit2 } from 'lucide-react';

import { MedicationService, type MedicineDTO } from '../../application/services/MedicationService.ts';
import { MedicineFormModal } from '../components/ui/MedicineFormModal.tsx';


export function Medications() {
  const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<MedicineDTO | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMeds = async () => {
    try {
      setLoading(true);
      const data = await MedicationService.getAllMedicines();
      setMedicines(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los medicamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleSave = async (data: { name: string; imageUrl: string }) => {
    try {
      setSaving(true);
      if (currentMedicine?.id) {
        await MedicationService.updateGlobalMedicine(currentMedicine.id, data.name, data.imageUrl);
      } else {
        await MedicationService.createGlobalMedicine(data.name, data.imageUrl);
      }
      setShowModal(false);
      fetchMeds();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el medicamento');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (med: MedicineDTO) => {
    setCurrentMedicine(med);
    setIsReadOnly(false);
    setShowModal(true);
  };

  const handleDetails = (med: MedicineDTO) => {
    setCurrentMedicine(med);
    setIsReadOnly(true);
    setShowModal(true);
  };

  const handleNew = () => {
    setCurrentMedicine(null);
    setIsReadOnly(false);
    setShowModal(true);
  };


  const handleDownloadTemplate = async () => {
    try {
      await MedicationService.downloadTemplate();
    } catch (err: any) {
      alert('Error al descargar la plantilla');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const result = await MedicationService.importMedicines(file);
      alert(result.message);
      fetchMeds();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al importar medicamentos');
    } finally {
      setImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este medicamento del catálogo?')) return;
    try {
      await MedicationService.deleteMedicine(id);
      fetchMeds();
    } catch (err: any) {
      alert('Error al eliminar el medicamento');
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Base de Medicamentos <Pill className="text-primary w-6 h-6" />
          </h1>
          <p className="text-slate-500 mt-1">Gestiona el catálogo global de medicamentos del sistema.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleDownloadTemplate}
            className="h-10 inline-flex items-center justify-center rounded-lg text-xs font-bold transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 py-2 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Plantilla
          </button>
          
          <button 
            onClick={handleImportClick}
            disabled={importing}
            className="h-10 inline-flex items-center justify-center rounded-lg text-xs font-bold transition-all bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 shadow-lg disabled:opacity-50"
          >
            {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
            Importar Excel
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />

          <button 
            onClick={handleNew}
            className="h-10 inline-flex items-center justify-center rounded-lg text-xs font-bold transition-all bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 shadow-lg shadow-blue-500/25"
          >

            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative w-full max-w-md flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar medicamento..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-9 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
        />
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm overflow-hidden">
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <h3 className="text-xl font-bold leading-none tracking-tight text-slate-900">Catálogo de Medicamentos</h3>
          <p className="text-sm text-slate-500 font-medium">Lista oficial de medicinas disponibles en Nona.</p>
        </div>
        <div className="px-6 pb-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
               <span className="font-medium">Cargando catálogo...</span>
             </div>
          ) : error ? (
             <div className="p-4 text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-4 font-bold tracking-wider w-24">Imagen</th>
                    <th className="px-4 py-4 font-bold tracking-wider">Nombre del Medicamento</th>
                    <th className="px-4 py-4 font-bold tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4">
                        {med.image_url ? (
                          <img src={med.image_url} alt={med.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-100">
                            <Pill className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900 text-base">
                        {med.name}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleDetails(med)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(med)}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors hover:bg-indigo-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(med.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg"
                            title="Eliminar"
                          >
                            <span className="text-xs font-bold uppercase tracking-tighter">Eliminar</span>
                          </button>
                        </div>
                      </td>


                    </tr>
                  ))}
                  {filteredMedicines.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-slate-200" />
                          <p className="font-medium">No se encontraron medicamentos</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <MedicineFormModal 
        open={showModal}
        saving={saving}
        isReadOnly={isReadOnly}
        initialData={currentMedicine ? { id: currentMedicine.id, name: currentMedicine.name, imageUrl: currentMedicine.image_url || '' } : undefined}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
      />


    </div>
  );
}


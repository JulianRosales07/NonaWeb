import { useState, useEffect } from 'react';
import { Pill, Plus, Search, AlertCircle, RefreshCcw } from 'lucide-react';
import { MedicationService, type MedicineDTO } from '../../application/services/MedicationService';

export function Medications() {
  const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const data = await MedicationService.getAllMedicines();
        setMedicines(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los medicamentos');
      } finally {
        setLoading(false);
      }
    };
    fetchMeds();
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Control de Medicamentos <Pill className="text-primary w-6 h-6" />
          </h1>
          <p className="text-slate-500 mt-1">Supervisa el inventario global de medicinas de todos los pacientes.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar medicamento..." 
              className="pl-9 h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
            />
          </div>
          <button className="h-11 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 shadow-md">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="rounded-xl border-0 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/20 shadow-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-red-100">Stock Crítico o Vacío</p>
              <h3 className="text-4xl font-extrabold mt-2">1</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20 shadow-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-amber-100">En Peligro de Agotarse</p>
              <h3 className="text-4xl font-extrabold mt-2">1</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <RefreshCcw className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <h3 className="text-xl font-semibold leading-none tracking-tight">Inventario Actual</h3>
          <p className="text-sm text-slate-500">Visualiza los medicamentos gestionados en todo Nona.</p>
        </div>
        <div className="p-6 pt-0">
          {loading ? (
             <div className="flex justify-center p-8 text-slate-500">Cargando medicamentos...</div>
          ) : error ? (
             <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-4 font-medium rounded-tl-lg">Medicamento</th>
                    <th className="px-4 py-4 font-medium">Paciente Destino</th>
                    <th className="px-4 py-4 font-medium">Dosis</th>
                    <th className="px-4 py-4 font-medium">Frecuencia / Hora</th>
                    <th className="px-4 py-4 font-medium text-right rounded-tr-lg">Creado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-4 font-medium text-slate-900 border-l border-transparent group-hover:border-primary transition-all flex items-center gap-2">
                        {med.image_url ? (
                          <img src={med.image_url} alt={med.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Pill className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        {med.name}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                         {med.users?.name || 'Desconocido'}
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-semibold">{med.dosage}</td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-slate-900">{med.frequency}</span> 
                        <span className="text-xs text-slate-500 block">{med.time}</span>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-500">
                        {new Date(med.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {medicines.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No hay medicamentos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

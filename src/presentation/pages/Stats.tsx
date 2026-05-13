import { useEffect, useState } from 'react';
import { Activity, TrendingDown, TrendingUp, RefreshCw, Users, Pill, AlertTriangle, X } from 'lucide-react';
import { UserService } from '../../application/services/UserService';
import { MedicineLogService, type MedicineStats } from '../../application/services/MedicineLogService';
import { MedicationService } from '../../application/services/MedicationService';
import type { User } from '../../domain/models/User';

interface PatientAdherence {
  user: User;
  stats: MedicineStats | null;
  loading: boolean;
  error: boolean;
}

export function Stats() {
  const [patients, setPatients] = useState<User[]>([]);
  const [adherenceData, setAdherenceData] = useState<PatientAdherence[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [totalMeds, setTotalMeds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoadingPatients(true);
    setError(null);
    try {
      const [users, meds] = await Promise.all([
        UserService.getAllUsers(),
        MedicationService.getAllMedicines(),
      ]);

      const elderly = users.filter((u) =>
        ['adulto_mayor', 'adultoMayor', 'Adulto Mayor'].includes(u.role)
      );
      setPatients(elderly);
      setTotalMeds(meds.length);

      // Initialize with loading state
      const initial: PatientAdherence[] = elderly.map((u) => ({
        user: u,
        stats: null,
        loading: true,
        error: false,
      }));
      setAdherenceData(initial);

      // Fetch stats for each patient in parallel
      const results = await Promise.allSettled(
        elderly.map((u) => MedicineLogService.getStatsByPatient(u.id))
      );

      setAdherenceData(
        elderly.map((u, i) => {
          const result = results[i];
          if (result.status === 'fulfilled') {
            return { user: u, stats: result.value, loading: false, error: false };
          }
          return { user: u, stats: null, loading: false, error: true };
        })
      );
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aggregate stats
  const totalTaken = adherenceData.reduce((acc, p) => acc + (p.stats?.taken ?? 0), 0);
  const totalMissed = adherenceData.reduce((acc, p) => acc + (p.stats?.missed ?? 0), 0);
  const totalScheduled = adherenceData.reduce(
    (acc, p) => acc + (p.stats?.total ?? 0),
    0
  );
  const globalAdherence =
    totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

  const criticalPatients = adherenceData.filter(
    (p) => p.stats && p.stats.adherence_percentage < 60
  );

  const sortedByAdherence = [...adherenceData]
    .filter((p) => p.stats !== null)
    .sort((a, b) => (b.stats?.adherence_percentage ?? 0) - (a.stats?.adherence_percentage ?? 0));

  const getAdherenceColor = (pct: number) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getAdherenceTextColor = (pct: number) => {
    if (pct >= 75) return 'text-emerald-600';
    if (pct >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Seguimiento de Adherencia <Activity className="text-primary w-6 h-6" />
          </h1>
          <p className="text-slate-500 mt-1">
            Supervisión global del cumplimiento terapéutico.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-slate-400 hover:text-primary transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`w-5 h-5 ${loadingPatients ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg flex items-center gap-3 border border-red-100">
          <X className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adherencia promedio</p>
              <h3 className={`text-4xl font-extrabold mt-1 ${getAdherenceTextColor(globalAdherence)}`}>
                {loadingPatients ? '...' : `${globalAdherence}%`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">del sistema hoy</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dosis tomadas</p>
              <h3 className="text-4xl font-extrabold mt-1 text-slate-900">
                {loadingPatients ? '...' : totalTaken.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 mt-1">de {totalScheduled.toLocaleString()} programadas</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Pill className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dosis omitidas</p>
              <h3 className="text-4xl font-extrabold mt-1 text-red-600">
                {loadingPatients ? '...' : totalMissed.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 mt-1">registradas hoy</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-red-500">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pacientes críticos</p>
              <h3 className="text-4xl font-extrabold mt-1 text-amber-600">
                {loadingPatients ? '...' : criticalPatients.length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">adherencia menor al 60%</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Adherence by patient */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-lg font-bold text-slate-800">Adherencia por paciente</h3>
            <p className="text-sm text-slate-500 mt-0.5">Ordenado por cumplimiento</p>
          </div>
          <div className="p-6 space-y-5">
            {loadingPatients ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm">Cargando estadísticas...</span>
              </div>
            ) : sortedByAdherence.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No hay datos de adherencia disponibles.</p>
              </div>
            ) : (
              sortedByAdherence.map(({ user, stats }) => {
                const pct = stats?.adherence_percentage ?? 0;
                return (
                  <div key={user.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${getAdherenceTextColor(pct)}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getAdherenceColor(pct)} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {stats && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        {stats.taken} tomadas · {stats.missed} omitidas · {stats.pending} pendientes
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Critical patients */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Pacientes críticos</h3>
              <p className="text-sm text-slate-500 mt-0.5">Adherencia menor al 60%</p>
            </div>
            {criticalPatients.length > 0 && (
              <span className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                {criticalPatients.length}
              </span>
            )}
          </div>
          <div className="p-6 space-y-4">
            {loadingPatients ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : criticalPatients.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-600">¡Sin pacientes críticos!</p>
                <p className="text-xs text-slate-400 mt-1">Todos los pacientes tienen buena adherencia.</p>
              </div>
            ) : (
              criticalPatients.map(({ user, stats }) => {
                const pct = stats?.adherence_percentage ?? 0;
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm flex-shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                      {stats && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {stats.taken} de {stats.total} dosis tomadas hoy
                        </p>
                      )}
                    </div>
                    <span className="text-lg font-extrabold text-red-600">{pct}%</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <h3 className="text-lg font-bold text-slate-800">Resumen completo</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} · {totalMeds} medicamento{totalMeds !== 1 ? 's' : ''} registrado{totalMeds !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4 text-center">Total</th>
                <th className="px-6 py-4 text-center">Tomadas</th>
                <th className="px-6 py-4 text-center">Omitidas</th>
                <th className="px-6 py-4 text-center">Pendientes</th>
                <th className="px-6 py-4 text-center">Adherencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingPatients ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Cargando...</p>
                  </td>
                </tr>
              ) : adherenceData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-10" />
                    <p className="text-sm">No hay pacientes registrados.</p>
                  </td>
                </tr>
              ) : (
                adherenceData.map(({ user, stats, loading: rowLoading, error: rowError }) => {
                  const pct = stats?.adherence_percentage ?? 0;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            {user.cedula && (
                              <p className="text-[10px] text-slate-400 font-mono">Ced. {user.cedula}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">
                        {rowLoading ? '...' : rowError ? '—' : stats?.total ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-emerald-600 font-bold">
                          {rowLoading ? '...' : rowError ? '—' : stats?.taken ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-500 font-bold">
                          {rowLoading ? '...' : rowError ? '—' : stats?.missed ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-amber-500 font-bold">
                          {rowLoading ? '...' : rowError ? '—' : stats?.pending ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {rowLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto text-slate-300" />
                        ) : rowError ? (
                          <span className="text-xs text-slate-400">Sin datos</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getAdherenceColor(pct)} rounded-full`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${getAdherenceTextColor(pct)}`}>
                              {pct}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

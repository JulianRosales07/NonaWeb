import { useEffect, useState, useCallback } from 'react';
import {
  Users, Pill, TrendingUp, Activity, RefreshCw, Link2,
  ArrowUpRight, CheckCircle2, Clock3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { UserService } from '../../application/services/UserService';
import { MedicationService } from '../../application/services/MedicationService';
import { MedicineLogService } from '../../application/services/MedicineLogService';
import { RelationshipService } from '../../application/services/RelationshipService';
import type { MedicineDTO } from '../../application/services/MedicationService';
import { getMedPatientName, getMedPatientId } from '../../application/services/MedicationService';
import type { User } from '../../domain/models/User';

interface DashboardData {
  totalUsers: number;
  elderlyCount: number;
  caregiverCount: number;
  familiarCount: number;
  adminCount: number;
  totalMedicines: number;
  totalRelationships: number;
  activeRelationships: number;
  globalAdherence: number;
  totalTaken: number;
  totalMissed: number;
  criticalPatients: number;
}

interface AdherencePoint {
  name: string;
  tomadas: number;
  omitidas: number;
}

interface MedsByPatient {
  name: string;
  medicamentos: number;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className || ''}`} />;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

const ROLE_MAP: Record<string, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'bg-purple-100 text-purple-700' },
  cuidador: { label: 'Cuidador', cls: 'bg-blue-100 text-blue-700' },
  familiar: { label: 'Familiar', cls: 'bg-sky-100 text-sky-700' },
  adulto_mayor: { label: 'Adulto Mayor', cls: 'bg-emerald-100 text-emerald-700' },
  adultoMayor: { label: 'Adulto Mayor', cls: 'bg-emerald-100 text-emerald-700' },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_MAP[role] || { label: role, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentMeds, setRecentMeds] = useState<MedicineDTO[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [adherenceChart, setAdherenceChart] = useState<AdherencePoint[]>([]);
  const [medsChart, setMedsChart] = useState<MedsByPatient[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [users, medicines] = await Promise.all([
        UserService.getAllUsers(),
        MedicationService.getAllMedicines(),
      ]);

      const elderly = users.filter(u => ['adulto_mayor', 'adultoMayor', 'Adulto Mayor'].includes(u.role));
      const caregivers = users.filter(u => u.role === 'cuidador');
      const familiars = users.filter(u => u.role === 'familiar');
      const admins = users.filter(u => u.role === 'admin');

      // Relationships
      let totalRels = 0;
      let activeRels = 0;
      const relResults = await Promise.allSettled(
        elderly.map(p => RelationshipService.getElderlyRelationships(Number(p.id)))
      );
      relResults.forEach(r => {
        if (r.status === 'fulfilled') {
          totalRels += r.value.length;
          activeRels += r.value.filter((x: any) => x.status === 'active').length;
        }
      });

      // Adherence stats
      const statsResults = await Promise.allSettled(
        elderly.map(p => MedicineLogService.getStatsByPatient(p.id))
      );

      let totalTaken = 0;
      let totalMissed = 0;
      let totalScheduled = 0;
      let criticalCount = 0;
      const adherencePoints: AdherencePoint[] = [];

      elderly.forEach((p, i) => {
        const r = statsResults[i];
        if (r.status === 'fulfilled' && r.value) {
          const s = r.value;
          totalTaken += s.taken || 0;
          totalMissed += s.missed || 0;
          totalScheduled += s.total || 0;
          if ((s.adherence_percentage || 0) < 60) criticalCount++;
          adherencePoints.push({
            name: p.name.split(' ')[0],
            tomadas: s.taken || 0,
            omitidas: s.missed || 0,
          });
        } else {
          adherencePoints.push({ name: p.name.split(' ')[0], tomadas: 0, omitidas: 0 });
        }
      });

      const globalAdherence = totalScheduled > 0
        ? Math.round((totalTaken / totalScheduled) * 100)
        : 0;

      // Meds per patient
      const medsPerPatient: Record<string, number> = {};
      medicines.forEach(m => {
        let pName = getMedPatientName(m);
        if (!pName) {
          const pid = getMedPatientId(m);
          if (pid) {
            const found = users.find(u => String(u.id) === String(pid));
            pName = found ? found.name.split(' ')[0] : null;
          }
        } else {
          pName = pName.split(' ')[0];
        }
        if (!pName) pName = 'General';
        medsPerPatient[pName] = (medsPerPatient[pName] || 0) + 1;
      });
      const medsChartData = Object.entries(medsPerPatient)
        .map(([name, medicamentos]) => ({ name, medicamentos }))
        .sort((a, b) => b.medicamentos - a.medicamentos)
        .slice(0, 8);

      // Pie chart
      const pieChartData = [
        { name: 'Adultos Mayores', value: elderly.length },
        { name: 'Familiares', value: familiars.length },
        { name: 'Cuidadores', value: caregivers.length },
        { name: 'Admins', value: admins.length },
      ].filter(d => d.value > 0);

      // Recent items
      const sortedMeds = [...medicines]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      const sortedUsers = [...users]
        .sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        })
        .slice(0, 6);

      setData({
        totalUsers: users.length,
        elderlyCount: elderly.length,
        caregiverCount: caregivers.length,
        familiarCount: familiars.length,
        adminCount: admins.length,
        totalMedicines: medicines.length,
        totalRelationships: totalRels,
        activeRelationships: activeRels,
        globalAdherence,
        totalTaken,
        totalMissed,
        criticalPatients: criticalCount,
      });
      setAdherenceChart(adherencePoints);
      setMedsChart(medsChartData);
      setPieData(pieChartData);
      setRecentMeds(sortedMeds);
      setRecentUsers(sortedUsers);
      setAllUsers(users);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpiCards = data ? [
    {
      title: 'Total Usuarios',
      value: data.totalUsers,
      sub: `${data.elderlyCount} adultos mayores`,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/30',
    },
    {
      title: 'Medicamentos',
      value: data.totalMedicines,
      sub: 'registrados en el sistema',
      icon: Pill,
      gradient: 'from-emerald-500 to-emerald-600',
      glow: 'shadow-emerald-500/30',
    },
    {
      title: 'Relaciones activas',
      value: data.activeRelationships,
      sub: `de ${data.totalRelationships} totales`,
      icon: Link2,
      gradient: 'from-violet-500 to-violet-600',
      glow: 'shadow-violet-500/30',
    },
    {
      title: 'Adherencia global',
      value: data.globalAdherence,
      suffix: '%',
      sub: `${data.criticalPatients} pacientes criticos`,
      icon: TrendingUp,
      gradient: data.globalAdherence >= 75 ? 'from-emerald-500 to-emerald-600' : data.globalAdherence >= 60 ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600',
      glow: 'shadow-emerald-500/30',
    },
  ] : [];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Resumen general del sistema NONA
            {lastUpdated && (
              <span className="ml-2 text-slate-400">
                &middot; Actualizado {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-primary transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-10 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        ) : (
          kpiCards.map((card, i) => (
            <div key={i} className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="flex items-start justify-between relative">
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                  <h3 className="text-4xl font-extrabold text-slate-900 mt-1 tracking-tight tabular-nums">
                    {card.value.toLocaleString()}{'suffix' in card && card.suffix ? card.suffix : ''}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">{card.sub}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} ${card.glow} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Row 2: Area Chart + Pie Chart */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
        {/* Area chart - adherencia */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Dosis por paciente
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tomadas vs omitidas hoy</p>
            </div>
            <a href="/stats" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
              Ver modulo <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="p-6">
            {loading ? (
              <Skeleton className="h-52 w-full" />
            ) : adherenceChart.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-slate-400 text-sm">
                Sin datos de adherencia disponibles.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={adherenceChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTaken" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradMissed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tomadas" name="Tomadas" stroke="#10b981" strokeWidth={2.5} fill="url(#gradTaken)" dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="omitidas" name="Omitidas" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradMissed)" dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center gap-6 mt-3 justify-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-slate-500 font-medium">Tomadas ({data?.totalTaken || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs text-slate-500 font-medium">Omitidas ({data?.totalMissed || 0})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Usuarios por rol
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribucion del sistema</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Sin usuarios.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, name: any) => [`${v} usuarios`, name]} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600 font-medium">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Bar Chart + Recent Users */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
        {/* Bar chart - meds per patient */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-500" />
              Medicamentos por paciente
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Top pacientes con mas medicamentos asignados</p>
          </div>
          <div className="p-6">
            {loading ? (
              <Skeleton className="h-52 w-full" />
            ) : medsChart.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-slate-400 text-sm">Sin datos.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={medsChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="medicamentos" name="Medicamentos" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Usuarios recientes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Ultimos registros en el sistema</p>
            </div>
            <a href="/users" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-28 mb-1.5" />
                    <Skeleton className="h-2.5 w-36" />
                  </div>
                </div>
              ))
            ) : recentUsers.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">No hay usuarios.</div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Medicines Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-500" />
              Ultimos medicamentos registrados
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Medicamentos agregados recientemente al sistema</p>
          </div>
          <a href="/medications" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
            Ver todos <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentMeds.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Sin medicamentos registrados.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3">Medicamento</th>
                  <th className="px-6 py-3">Paciente</th>
                  <th className="px-6 py-3">Dosis</th>
                  <th className="px-6 py-3">Frecuencia</th>
                  <th className="px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentMeds.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="font-semibold text-slate-800">{med.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium">{getMedPatientName(med) || (() => { const pid = getMedPatientId(med); return pid ? allUsers.find(u => String(u.id) === String(pid))?.name : null; })() || 'No asignado'}</td>
                    <td className="px-6 py-3.5 text-slate-700 font-semibold">{med.dosage}</td>
                    <td className="px-6 py-3.5 text-slate-600">{med.frequency}</td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs">
                      {new Date(med.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios', desc: 'Gestion de roles', href: '/users', color: 'bg-blue-50 border-blue-100 text-blue-700', icon: Users },
          { label: 'Medicamentos', desc: 'Inventario completo', href: '/medications', color: 'bg-emerald-50 border-emerald-100 text-emerald-700', icon: Pill },
          { label: 'Relaciones', desc: 'Vinculos y permisos', href: '/relationships', color: 'bg-purple-50 border-purple-100 text-purple-700', icon: Link2 },
          { label: 'Adherencia', desc: 'Seguimiento de tomas', href: '/stats', color: 'bg-amber-50 border-amber-100 text-amber-700', icon: Activity },
        ].map((mod) => (
          <a key={mod.href} href={mod.href} className={`rounded-2xl border p-4 hover:shadow-md transition-all flex items-center gap-3 ${mod.color}`}>
            <mod.icon className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">{mod.label}</p>
              <p className="text-[11px] mt-0.5 opacity-70">{mod.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
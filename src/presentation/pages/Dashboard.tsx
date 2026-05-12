import { Users, Pill, TriangleAlert as AlertTriangle, TrendingUp, Activity, Bell, ArrowUpRight } from 'lucide-react';

const statCards = [
  { title: 'Usuarios Activos', value: '1,248', trend: '+12%', up: true, icon: Users, accent: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  { title: 'Medicamentos', value: '456', trend: '+4%', up: true, icon: Pill, accent: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { title: 'Alertas Criticas', value: '12', trend: '-2%', up: false, icon: AlertTriangle, accent: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600' },
  { title: 'Adherencia Media', value: '89%', trend: '+7%', up: true, icon: TrendingUp, accent: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600' },
];

const activityFeed = [
  { user: 'Admin Julian', action: 'actualizo permisos de relacion para', target: 'Cristina Portilla', time: 'Hace 2 min', dot: 'bg-blue-500' },
  { user: 'Sistema', action: 'detecto baja adherencia en', target: 'Jose Antonio', time: 'Hace 15 min', dot: 'bg-red-500' },
  { user: 'Admin Julian', action: 'registro nuevo medicamento', target: 'Losartan 50mg', time: 'Hace 45 min', dot: 'bg-emerald-500' },
  { user: 'Danny C.', action: 'solicito cambio de rol a', target: 'Administrador', time: 'Hace 2 horas', dot: 'bg-amber-500' },
];

const alerts = [
  { title: 'Stock Critico', desc: 'Insulina Glargina se agotara pronto.', color: 'border-red-400 bg-red-50', label: 'text-red-600' },
  { title: 'Nueva Solicitud', desc: 'Soporte tecnico solicitado por Valeria G.', color: 'border-blue-400 bg-blue-50', label: 'text-blue-600' },
  { title: 'Alerta Medica', desc: 'Dosis omitida 3 veces por Carlos R.', color: 'border-amber-400 bg-amber-50', label: 'text-amber-600' },
];

export function Dashboard() {
  return (
    <div className="space-y-7 pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">Vista General</h1>
          <p className="text-[13px] text-slate-500 mt-0.5 font-medium">Monitoreo en tiempo real de la plataforma Nona.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">En vivo</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.text}`} />
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {s.trend}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.title}</p>
            <h3 className="text-[28px] font-extrabold text-slate-900 mt-0.5 tracking-tight leading-none">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="text-[14px] font-bold text-slate-900">Auditoria de Actividad</h3>
            </div>
            <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Ver todo <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors">
                <div className={`w-8 h-8 rounded-full ${item.dot} flex-shrink-0 flex items-center justify-center text-white font-bold text-[12px] shadow-sm`}>
                  {item.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">{item.user}</span>{' '}
                    <span className="font-medium">{item.action}</span>{' '}
                    <span className="font-semibold text-blue-600">{item.target}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-500" />
              <h3 className="text-[14px] font-bold text-slate-900">Alertas del Sistema</h3>
            </div>
            <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              {alerts.length}
            </span>
          </div>
          <div className="flex-1 p-4 space-y-2.5">
            {alerts.map((a, i) => (
              <div key={i} className={`px-4 py-3.5 rounded-xl border-l-4 ${a.color}`}>
                <p className={`text-[12px] font-bold ${a.label}`}>{a.title}</p>
                <p className="text-[12px] text-slate-600 mt-0.5 leading-snug font-medium">{a.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-900 rounded-b-2xl">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Soporte Nona</p>
            <p className="text-[12px] text-slate-300 mt-1 leading-snug font-medium">Contacta al equipo tecnico si necesitas asistencia.</p>
            <button className="w-full mt-3 py-2 bg-white hover:bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors">
              Contactar soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

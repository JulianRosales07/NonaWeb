import { Users, Pill, AlertTriangle, TrendingUp, Activity, Bell } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { title: 'Usuarios Activos', value: '1,248', icon: Users, trend: '+12%', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
    { title: 'Medicamentos Globales', value: '456', icon: Pill, trend: '+4%', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { title: 'Alertas Críticas', value: '12', icon: AlertTriangle, trend: '-2%', color: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' },
    { title: 'Adherencia Media', value: '89%', icon: TrendingUp, trend: '+7%', color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vista General</h1>
        <p className="text-slate-500 mt-1">Monitoreo en tiempo real de la plataforma Nona.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className={`relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
               <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                 {stat.trend}
               </span>
               <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">vs último mes</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Auditoría de Actividad <Activity className="w-4 h-4 text-primary" />
            </h3>
            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline px-3 py-1 bg-primary/5 rounded-full transition-colors">Ver historial completo</button>
          </div>
          <div className="p-4 space-y-2">
            {[
              { user: 'Admin Julián', action: 'actualizó permisos de relación', target: 'Cristina Portilla', time: 'hace 2 min', color: 'bg-blue-500' },
              { user: 'Sistema', action: 'detectó baja adherencia en', target: 'Jose Antonio', time: 'hace 15 min', color: 'bg-red-500' },
              { user: 'Admin Julián', action: 'creó nuevo medicamento', target: 'Losartán 50mg', time: 'hace 45 min', color: 'bg-emerald-500' },
              { user: 'Danny C.', action: 'solicitó cambio de rol a', target: 'Administrador', time: 'hace 2 horas', color: 'bg-purple-500' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50/80 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                <div className={`w-10 h-10 rounded-full ${item.color} flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                  {item.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {item.user} <span className="font-medium text-slate-500 lowercase">{item.action}</span> {item.target}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.time}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-primary transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications / Alerts Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               Alertas <Bell className="w-4 h-4 text-amber-500" />
             </h3>
             <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">3</span>
          </div>
          
          <div className="space-y-5">
            {[
              { title: 'Stock Crítico', desc: 'Insulina Glargina se agotará pronto.', type: 'critical' },
              { title: 'Nueva Solicitud', desc: 'Soporte técnico de Valeria G.', type: 'info' },
              { title: 'Alerta Médica', desc: 'Pensión omitida 3 veces por Carlos.', type: 'urgent' }
            ].map((alert, i) => (
              <div key={i} className="relative pl-5 border-l-2 border-slate-100 hover:border-primary transition-colors group">
                 <div className={`absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-slate-300 group-hover:bg-primary transition-all`} />
                 <p className="text-xs font-bold text-slate-800 tracking-tight">{alert.title}</p>
                 <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">{alert.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-900/10">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Soporte Nona</p>
             <p className="text-xs font-medium mt-1 leading-relaxed">¿Necesitas ayuda técnica con los datos en tiempo real?</p>
             <button className="w-full mt-4 py-2 bg-white text-slate-900 text-[10px] font-bold uppercase rounded-lg tracking-widest hover:bg-slate-100 transition-colors">Contáctanos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Activity, TrendingDown, TrendingUp } from 'lucide-react';

export function Stats() {
  const chartData = [
    { name: 'Lun', consumidos: 120, omitidos: 15 },
    { name: 'Mar', consumidos: 132, omitidos: 10 },
    { name: 'Mié', consumidos: 101, omitidos: 20 },
    { name: 'Jue', consumidos: 140, omitidos: 5 },
    { name: 'Vie', consumidos: 150, omitidos: 8 },
    { name: 'Sáb', consumidos: 110, omitidos: 25 },
    { name: 'Dom', consumidos: 130, omitidos: 12 },
  ];

  const maxTotal = Math.max(...chartData.map(d => d.consumidos + d.omitidos));

  const topMeds = [
    { name: 'Losartán 50mg', usage: 85, color: 'bg-emerald-500' },
    { name: 'Insulina Glargina', usage: 72, color: 'bg-blue-500' },
    { name: 'Paracetamol 500mg', usage: 65, color: 'bg-indigo-500' },
    { name: 'Metformina 850mg', usage: 45, color: 'bg-purple-500' },
    { name: 'Aspirina 100mg', usage: 30, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          Análisis e Insights <Activity className="text-primary w-6 h-6" />
        </h1>
        <p className="text-slate-500 mt-1">Métricas de adherencia, consumo y alertas de la última semana.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
          <div className="flex flex-col space-y-1.5 pb-2">
            <p className="text-sm text-slate-500">Tasa de Adherencia Global</p>
            <h3 className="text-4xl font-semibold text-emerald-600 flex items-end gap-2">
              92% <TrendingUp className="w-6 h-6 mb-1" />
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">Los pacientes están cumpliendo con sus horarios de forma óptima.</p>
        </div>
        
        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
          <div className="flex flex-col space-y-1.5 pb-2">
            <p className="text-sm text-slate-500">Dosis Omitidas esta Semana</p>
            <h3 className="text-4xl font-semibold text-rose-600 flex items-end gap-2">
              95 <TrendingDown className="w-6 h-6 mb-1 opacity-70" />
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">-15% respecto a la semana pasada.</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col space-y-1.5 pb-2">
            <p className="text-sm text-slate-500">Medicamentos Registrados</p>
            <h3 className="text-4xl font-semibold text-blue-600">
              1,420
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">+25 nuevos esta semana.</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* CSS Chart */}
        <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="text-xl font-semibold leading-none tracking-tight">Historial de Consumo en 7 Días</h3>
            <p className="text-sm text-slate-500 mt-1">Relación entre tomas correctas y tomas omitidas o pasadas.</p>
          </div>
          <div className="h-64 flex items-end gap-2 mt-4 px-2">
            {chartData.map((d, i) => {
              const heightConsumidos = (d.consumidos / maxTotal) * 100;
              const heightOmitidos = (d.omitidos / maxTotal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 relative group">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                    {d.consumidos} Tomados / {d.omitidos} Omitidos
                  </div>
                  <div className="w-full max-w-[40px] flex flex-col-reverse justify-end rounded-t-sm overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                    <div style={{ height: `${heightConsumidos}%` }} className="bg-primary/80 hover:bg-primary transition-colors w-full flex-none rounded-b-sm" />
                    <div style={{ height: `${heightOmitidos}%` }} className="bg-rose-400/80 hover:bg-rose-500 transition-colors w-full flex-none rounded-t-sm" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{d.name}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-8 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/80" />
              <span className="text-sm text-slate-600">Dosis Consumidas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400/80" />
              <span className="text-sm text-slate-600">Dosis Omitidas</span>
            </div>
          </div>
        </div>

        {/* Top Meds */}
        <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="text-xl font-semibold leading-none tracking-tight">Top 5 Medicamentos Más Consumidos</h3>
            <p className="text-sm text-slate-500 mt-1">Basado en el registro diario de los registros de NonaApp.</p>
          </div>
          <div className="space-y-6 mt-4">
            {topMeds.map((med, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-800">{med.name}</span>
                  <span className="text-sm font-bold text-slate-500">{med.usage}% global</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${med.color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${med.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

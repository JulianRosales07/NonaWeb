import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Hop as Home, Users, Pill, Settings, LogOut, Activity, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export function DashboardLayout() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Usuarios & Relaciones', path: '/users', icon: Users },
    { name: 'Medicamentos & Stock', path: '/medications', icon: Pill },
    { name: 'Configuracion', path: '/settings', icon: Settings },
  ];


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f5f6fa]">
      {/* Sidebar */}
      <aside className="w-[240px] bg-slate-900 flex-col hidden md:flex flex-shrink-0 relative overflow-hidden">
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '20px 20px' }}
        />
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 h-[64px] flex items-center px-5 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40 flex-shrink-0">
              <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-bold text-white tracking-tight">Nona Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] px-3 pb-3 pt-1">Menu principal</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="relative z-10 p-3 border-t border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/20 flex items-center justify-center text-blue-400 font-bold text-[13px] flex-shrink-0">
              {(storedUser.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">{storedUser.name || 'Admin'}</p>
              <p className="text-[11px] text-slate-500 capitalize truncate leading-tight">{storedUser.role || 'Administrador'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-red-500/15 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-[64px] bg-white border-b border-slate-200/80 flex items-center justify-between px-8 z-10 flex-shrink-0 shadow-sm">
          <div /> {/* spacer */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[13px] font-bold text-slate-800 leading-tight">{storedUser.name || 'Admin'}</p>
              <p className="text-[11px] text-slate-400 capitalize leading-tight">{storedUser.role || 'Administrador'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-[13px] shadow-md shadow-blue-500/30 flex-shrink-0">
              {(storedUser.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

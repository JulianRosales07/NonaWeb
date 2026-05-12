import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Users, Pill, Settings, LogOut, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export function DashboardLayout() {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Usuarios & Relaciones', path: '/users', icon: Users },
    { name: 'Medicamentos & Stock', path: '/medications', icon: Pill },
    { name: 'Estadísticas', path: '/stats', icon: Activity },
    { name: 'Configuración', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/60 shadow-sm flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Nona Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/60 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-end px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold">{JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'}</span>
              <span className="text-xs text-slate-500 capitalize">{JSON.parse(localStorage.getItem('user') || '{}').role || 'Administrador'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'}`} alt="Avatar" />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CircleAlert as AlertCircle, Heart, CircleCheck as CheckCircle } from 'lucide-react';
import { AuthService } from '../../application/services/AuthService';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await AuthService.login(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciales incorrectas. Verifica e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-slate-900 flex-col justify-between p-14 overflow-hidden">
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-blue-600/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] bg-sky-400/10 rounded-full blur-[100px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-bold text-white tracking-tight">Nona Admin</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-semibold text-white/70 tracking-[0.12em] uppercase">Panel de Administracion</span>
            </div>
            <h1 className="text-[52px] font-extrabold text-white leading-[1.05] tracking-[-0.03em]">
              Cuidado<br />
              inteligente,<br />
              <span className="text-blue-400">sin limites.</span>
            </h1>
            <p className="text-[15px] text-slate-400 leading-relaxed max-w-[340px] font-light">
              Supervisa usuarios, medicamentos y relaciones de cuidado desde una plataforma centralizada y segura.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Monitoreo de medicamentos en tiempo real',
              'Gestion de cuidadores y adultos mayores',
              'Estadisticas avanzadas de adherencia',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" strokeWidth={2} />
                <span className="text-[13px] text-slate-300 font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/8">
          <p className="text-[11px] text-slate-600 font-medium">Nona App &copy; 2026. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-8 bg-slate-50/60">
        <div className="w-full max-w-[400px] space-y-9">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-slate-900">Nona Admin</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-[30px] font-extrabold text-slate-900 tracking-[-0.02em] leading-tight">Bienvenido de nuevo</h2>
            <p className="text-[15px] text-slate-500 leading-snug">Ingresa tus credenciales para acceder al panel de control.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] font-semibold text-red-700 leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-widest">Correo electronico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@nona.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-widest">Contrasena</label>
                <a href="#" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Olvidaste tu contrasena?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <label htmlFor="remember" className="text-[13px] text-slate-600 cursor-pointer select-none font-medium">
                Mantener sesion iniciada
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-[14px] font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-60 shadow-lg shadow-slate-900/20 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  Iniciar Sesion
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-[11px] text-slate-400 font-medium tracking-wide">
            Acceso exclusivo para administradores autorizados de Nona App.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
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
      // Validar si es admin o darle paso
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 relative z-10 p-4">
        {/* Branding Side */}
        <div className="hidden md:flex flex-col justify-center p-12 select-none">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-primary/20 flex items-center justify-center mb-8 transform -rotate-6">
            <Pill className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Gestión inteligente <br/>
            para <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Nona App</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-sm">
            Administra usuarios, cuidadores, medicamentos y obtén estadísticas precisas en tiempo real.
          </p>
        </div>

        {/* Form Side */}
        <div className="flex items-center justify-center md:p-8">
          <Card className="w-full max-w-md backdrop-blur-xl bg-white/70 border-white shadow-2xl p-2">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-6">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h2>
              <p className="text-slate-500 mb-8">Ingresa tus credenciales para acceder al panel.</p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="admin@nona.com" 
                      className="pl-9 h-11 bg-white/50 border-slate-200" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 ml-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="••••••••" 
                      className="pl-9 h-11 bg-white/50 border-slate-200" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end mt-2">
                </div>

                <Button type="submit" className="w-full h-11 text-base font-medium mt-6 group" disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

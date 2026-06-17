'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  LogOut,
  Package,
  MapPin,
  Heart,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Truck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

type AuthTab = 'login' | 'register';

export default function AuthModal() {
  const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);
  const setAuthModalOpen = useAuthStore((s) => s.setAuthModalOpen);
  const authMode = useAuthStore((s) => s.authMode);
  const setAuthMode = useAuthStore((s) => s.setAuthMode);
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  // Internal tab state for login/register view
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
  };

  // Reset tab when modal opens
  const handleOpenChange = (open: boolean) => {
    setAuthModalOpen(open);
    if (open && authMode !== 'profile') {
      setActiveTab(authMode === 'register' ? 'register' : 'login');
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-[95vw] bg-[#000000]/98 backdrop-blur-2xl border-white/10 p-0 overflow-hidden rounded-3xl">
        <DialogTitle className="sr-only">
          {authMode === 'profile' ? 'Mi Perfil' : activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {authMode === 'profile'
            ? 'Gestiona tu perfil N10K'
            : activeTab === 'login'
              ? 'Ingresa a tu cuenta N10K'
              : 'Regístrate en N10K'}
        </DialogDescription>

        {authMode === 'profile' && user ? (
          <ProfileView user={user} onLogout={logout} onUpdateProfile={updateProfile} onClose={() => setAuthModalOpen(false)} />
        ) : (
          <>
            {/* Tab Header */}
            <div className="flex border-b border-white/10" role="tablist" aria-label="Acceso a cuenta">
              <button
                type="button"
                role="tab"
                id="auth-tab-login"
                aria-selected={activeTab === 'login'}
                aria-controls="auth-panel-login"
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-4 text-sm font-montserrat-bold tracking-wider uppercase transition-all duration-300 cursor-pointer relative ${
                  activeTab === 'login'
                    ? 'text-[#E30613]'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                Iniciar Sesión
                {activeTab === 'login' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E30613]" />
                )}
              </button>
              <button
                type="button"
                role="tab"
                id="auth-tab-register"
                aria-selected={activeTab === 'register'}
                aria-controls="auth-panel-register"
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-4 text-sm font-montserrat-bold tracking-wider uppercase transition-all duration-300 cursor-pointer relative ${
                  activeTab === 'register'
                    ? 'text-[#E30613]'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                Registrarse
                {activeTab === 'register' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E30613]" />
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'login' ? (
              <div id="auth-panel-login" role="tabpanel" aria-labelledby="auth-tab-login">
              <LoginForm
                onLogin={login}
                onSwitchToRegister={() => handleTabChange('register')}
                onClose={() => setAuthModalOpen(false)}
              />
              </div>
            ) : (
              <div id="auth-panel-register" role="tabpanel" aria-labelledby="auth-tab-register">
              <RegisterForm
                onRegister={register}
                onSwitchToLogin={() => handleTabChange('login')}
                onClose={() => setAuthModalOpen(false)}
              />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ==================== LOGIN FORM ==================== */
function LoginForm({
  onLogin,
  onSwitchToRegister,
  onClose,
}: {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSwitchToRegister: () => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Formato de correo electrónico inválido');
      return;
    }
    setLoading(true);
    setError('');

    const success = await onLogin(email, password);
    setLoading(false);
    if (!success) {
      setError('Credenciales incorrectas');
      return;
    }
    toast({ title: 'Bienvenido', description: 'Sesión iniciada correctamente' });
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E30613] to-[#ff4d4f] flex items-center justify-center shadow-lg shadow-[#E30613]/25">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-montserrat-extrabold text-white tracking-tight">BIENVENIDO</h2>
        <p className="text-gray-500 text-sm mt-1 font-montserrat-medium">Inicia sesión en tu cuenta N10K</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#E30613] pl-10 h-12 rounded-xl"
            aria-label="Correo electrónico"
            aria-invalid={!!error}
            disabled={loading}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#E30613] pl-10 pr-10 h-12 rounded-xl"
            aria-label="Contraseña"
            aria-invalid={!!error}
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-[#E30613] rounded" />
            <span className="text-gray-400 text-xs">Recordarme</span>
          </label>
          <button type="button" className="text-[#E30613] text-xs font-semibold hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E30613] hover:bg-[#ff2d34] text-white font-montserrat-black h-12 rounded-xl tracking-wider uppercase shadow-lg shadow-[#E30613]/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-gray-600 text-xs uppercase">o</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Register link */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          ¿No tienes cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-[#E30613] font-montserrat-bold hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}

/* ==================== REGISTER FORM ==================== */
function RegisterForm({
  onRegister,
  onSwitchToLogin,
  onClose,
}: {
  onRegister: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  onSwitchToLogin: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field-level validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !emailRegex.test(val)) {
      setEmailError('Formato de correo inválido');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (val: string) => {
    if (val && val.length < 6) {
      setPasswordError('Mínimo 6 caracteres');
    } else {
      setPasswordError('');
    }
    // Also re-check confirm
    if (confirmPassword && val !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
    } else {
      setConfirmError('');
    }
  };

  const validateConfirm = (val: string) => {
    if (val && val !== password) {
      setConfirmError('Las contraseñas no coinciden');
    } else {
      setConfirmError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Formato de correo electrónico inválido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    const success = await onRegister(name, email, password, phone || undefined);
    setLoading(false);

    if (!success) {
      setError('No se pudo crear la cuenta. Verifica tus datos o intenta más tarde.');
      return;
    }

    toast({
      title: '¡Cuenta creada exitosamente!',
      description: `Bienvenido a N10K, ${name}`,
    });
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E30613] to-[#ff4d4f] flex items-center justify-center shadow-lg shadow-[#E30613]/25">
          <Image
            src="/brand/nuevo-panda.webp"
            alt="N10K Panda"
            width={200}
            height={198}
            className="h-10 w-auto object-contain"
          />
        </div>
        <h2 className="text-2xl font-montserrat-extrabold text-white tracking-tight">CREAR CUENTA</h2>
        <p className="text-gray-500 text-sm mt-1 font-montserrat-medium leading-snug">
          Únete al<br />movimiento N10K Caballero
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div role="alert" className="bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Nombre completo *"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#E30613] pl-10 h-11 rounded-xl"
            aria-label="Nombre completo"
            disabled={loading}
          />
        </div>

        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="email"
              placeholder="Correo electrónico *"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); validateEmail(e.target.value); }}
              className={`bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#E30613] pl-10 h-11 rounded-xl ${
                emailError ? 'border-[#E30613]/50' : ''
              }`}
              aria-label="Correo electrónico"
              disabled={loading}
            />
          </div>
          {emailError && (
            <p className="text-[#E30613] text-[10px] mt-1 ml-1 font-montserrat-medium">{emailError}</p>
          )}
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#E30613] pl-10 h-11 rounded-xl"
            aria-label="Teléfono"
            disabled={loading}
          />
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña *"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); validatePassword(e.target.value); }}
              className={`bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#E30613] pl-10 pr-10 h-11 rounded-xl ${
                passwordError ? 'border-[#E30613]/50' : ''
              }`}
              aria-label="Contraseña"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && (
            <p className="text-[#E30613] text-[10px] mt-1 ml-1 font-montserrat-medium">{passwordError}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña *"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); validateConfirm(e.target.value); }}
              className={`bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#E30613] pl-10 h-11 rounded-xl ${
                confirmError ? 'border-[#E30613]/50' : ''
              }`}
              aria-label="Confirmar contraseña"
              disabled={loading}
            />
            {!confirmError && confirmPassword && confirmPassword === password && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {confirmError && (
            <p className="text-[#E30613] text-[10px] mt-1 ml-1 font-montserrat-medium">{confirmError}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E30613] hover:bg-[#ff2d34] text-white font-montserrat-black h-12 rounded-xl tracking-wider uppercase shadow-lg shadow-[#E30613]/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </form>

      {/* Login link */}
      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#E30613] font-montserrat-bold hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}

type ProfileTab = 'perfil' | 'pedidos';

/* ==================== MOCK ORDERS ==================== */
interface MockOrderItem {
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

interface MockOrder {
  id: string;
  date: string;
  status: 'entregado' | 'en-camino' | 'procesando';
  total: number;
  items: MockOrderItem[];
}

const mockOrders: MockOrder[] = [
  {
    id: '#N10K-2026-001',
    date: '2026-02-28',
    status: 'entregado',
    total: 74.98,
    items: [
      { name: 'Hoodie Bold Negro', size: 'M', color: 'Negro', price: 39.99, quantity: 1, image: '/products/hoodie-negro.webp' },
      { name: 'Sueter Clásico Perla', size: 'L', color: 'Perla', price: 34.99, quantity: 1, image: '/products/sueter-perla.webp' },
    ],
  },
  {
    id: '#N10K-2026-002',
    date: '2026-03-10',
    status: 'en-camino',
    total: 54.98,
    items: [
      { name: 'Shorts Breeze Azul Claro', size: 'S', color: 'Azul Claro', price: 24.99, quantity: 1, image: '/products/shorts-breeze/azul-claro-1.webp' },
      { name: 'Tee Esencial Blanco', size: 'M', color: 'Blanco', price: 29.99, quantity: 1, image: '/products/tee-blanco.webp' },
    ],
  },
  {
    id: '#N10K-2026-003',
    date: '2026-03-14',
    status: 'procesando',
    total: 39.99,
    items: [
      { name: 'Hoodie Bold Vinotinto', size: 'XL', color: 'Vinotinto', price: 39.99, quantity: 1, image: '/products/hoodie-vinotinto.webp' },
    ],
  },
];

const statusConfig: Record<MockOrder['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'entregado': { label: 'Entregado', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  'en-camino': { label: 'En camino', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: <Truck className="h-3.5 w-3.5" /> },
  'procesando': { label: 'Procesando', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20', icon: <Clock className="h-3.5 w-3.5" /> },
};

/* ==================== PROFILE VIEW ==================== */
function ProfileView({
  user,
  onLogout,
  onUpdateProfile,
  onClose,
}: {
  user: { id: string; name: string; email: string; phone?: string; avatar?: string; createdAt: string };
  onLogout: () => void;
  onUpdateProfile: (data: Partial<typeof user>) => Promise<boolean>;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [profileTab, setProfileTab] = useState<ProfileTab>('perfil');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const ok = await onUpdateProfile({ name: editName, phone: editPhone || undefined });
    setSaving(false);
    if (ok) {
      setEditing(false);
    } else {
      toast({ title: 'Error', description: 'No se pudo actualizar el perfil', variant: 'destructive' });
    }
  };

  const profileItems = [
    { icon: <Heart className="h-5 w-5 text-[#E30613]" />, label: 'Favoritos', desc: 'Productos guardados' },
    { icon: <MapPin className="h-5 w-5 text-[#E30613]" />, label: 'Direcciones', desc: 'Gestionar direcciones de envío' },
    { icon: <Settings className="h-5 w-5 text-[#E30613]" />, label: 'Configuración', desc: 'Notificaciones y privacidad' },
  ];

  return (
    <div>
      {/* Profile Tab Header */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setProfileTab('perfil')}
          className={`flex-1 py-3.5 text-sm font-montserrat-bold tracking-wider uppercase transition-all duration-300 cursor-pointer relative ${
            profileTab === 'perfil'
              ? 'text-[#E30613]'
              : 'text-white/30 hover:text-white/60'
          }`
          }
        >
          <User className="h-4 w-4 inline mr-1.5 -mt-0.5" />
          Perfil
          {profileTab === 'perfil' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E30613]" />
          )}
        </button>
        <button
          onClick={() => setProfileTab('pedidos')}
          className={`flex-1 py-3.5 text-sm font-montserrat-bold tracking-wider uppercase transition-all duration-300 cursor-pointer relative ${
            profileTab === 'pedidos'
              ? 'text-[#E30613]'
              : 'text-white/30 hover:text-white/60'
          }`}
        >
          <Package className="h-4 w-4 inline mr-1.5 -mt-0.5" />
          Mis Pedidos
          {profileTab === 'pedidos' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E30613]" />
          )}
        </button>
      </div>

      {profileTab === 'perfil' ? (
        <div className="p-6 sm:p-8">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E30613] to-[#ff4d4f] flex items-center justify-center shadow-lg shadow-[#E30613]/25 flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-2xl font-montserrat-black text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-sm"
                    placeholder="Nombre"
                  />
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-9 rounded-lg text-sm"
                    placeholder="Teléfono"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-[#E30613] hover:bg-[#ff2d34] text-white rounded-lg text-xs" onClick={handleSave} disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/10 text-gray-400 rounded-lg text-xs" onClick={() => setEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-montserrat-extrabold text-white truncate">{user.name}</h3>
                  <p className="text-gray-500 text-sm truncate">{user.email}</p>
                  {user.phone && <p className="text-gray-600 text-xs">{user.phone}</p>}
                  <button
                    onClick={() => setEditing(true)}
                    className="text-[#E30613] text-xs font-montserrat-bold mt-1 hover:underline"
                  >
                    Editar perfil
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Pedidos', value: '3' },
              { label: 'Favoritos', value: '0' },
              { label: 'Puntos', value: '0' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card !rounded-xl p-3 text-center">
                <p className="text-xl font-montserrat-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase font-montserrat-bold">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-1 mb-6">
            {profileItems.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E30613]/10 transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-montserrat-bold text-white">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-[#E30613] transition-colors" />
              </button>
            ))}
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full border-[#E30613]/30 text-[#E30613] hover:bg-[#E30613]/10 hover:text-[#ff4d4f] font-montserrat-bold rounded-xl h-11"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      ) : (
        /* ==================== ORDER HISTORY TAB ==================== */
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="flex items-center gap-2 mb-5">
            <Package className="h-5 w-5 text-[#E30613]" />
            <h3 className="text-lg font-montserrat-extrabold text-white">Mis Pedidos</h3>
          </div>

          {mockOrders.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-12 w-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Aún no tienes pedidos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockOrders.map((order) => {
                const status = statusConfig[order.status];
                const isExpanded = expandedOrder === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden transition-all duration-300 hover:border-white/10"
                  >
                    {/* Order header */}
                    <button
                      className="w-full p-4 flex items-center gap-3 cursor-pointer text-left"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      {/* Product thumbnails */}
                      <div className="flex -space-x-2 flex-shrink-0">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-lg overflow-hidden border-2 border-[#111] bg-[#1A1A1A]"
                          >
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-lg border-2 border-[#111] bg-[#1A1A1A] flex items-center justify-center">
                            <span className="text-[10px] text-white/50 font-bold">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-montserrat-bold text-white">{order.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.bg} ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-white/30">
                          {new Date(order.date).toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-sm font-montserrat-extrabold text-white">${order.total.toFixed(2)}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-white/30" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-white/30" />
                        )}
                      </div>
                    </button>

                    {/* Expandable order details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 animate-fade-in">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-12 h-14 rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-montserrat-bold text-white truncate">{item.name}</p>
                              <p className="text-[10px] text-white/30">
                                Talla: {item.size} · Color: {item.color} · Cant: {item.quantity}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-white/60 flex-shrink-0">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-xs text-white/30">Total del pedido</span>
                          <span className="text-sm font-montserrat-extrabold text-[#E30613]">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

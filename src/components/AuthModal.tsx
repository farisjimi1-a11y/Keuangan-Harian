import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { loginUser, registerUser, loginAsGuest } from '../utils/auth';
import { UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthSuccess: (session: UserSession, message: string) => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  canDismiss = true,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Silakan masukkan email atau nama akun Anda.');
      return;
    }
    if (!password) {
      setErrorMsg('Silakan masukkan kata sandi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = loginUser(email, password, rememberMe);
      setLoading(false);

      if (!res.success || !res.session) {
        setErrorMsg(res.error || 'Gagal masuk. Periksa kembali email dan kata sandi.');
        return;
      }

      onAuthSuccess(
        res.session,
        `Selamat datang kembali, ${res.session.user.name}! Data Anda siap digunakan.`
      );
    }, 200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Format email tidak valid.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Kata sandi minimal 4 karakter.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = registerUser(name, email, password, rememberMe);
      setLoading(false);

      if (!res.success || !res.session) {
        setErrorMsg(res.error || 'Gagal mendaftarkan akun.');
        return;
      }

      onAuthSuccess(
        res.session,
        `Akun ${res.session.user.name} berhasil dibuat! Catatan keuangan Anda kini tersimpan aman.`
      );
    }, 200);
  };

  const handleQuickDemoLogin = () => {
    setErrorMsg(null);
    setLoading(true);
    setTimeout(() => {
      const res = loginUser('farisjimi1@gmail.com', '123456', true);
      setLoading(false);
      if (res.success && res.session) {
        onAuthSuccess(res.session, `Masuk ke akun Faris Jimi berhasil!`);
      } else {
        // If not found, register it
        const reg = registerUser('Faris Jimi', 'farisjimi1@gmail.com', '123456', true);
        if (reg.success && reg.session) {
          onAuthSuccess(reg.session, `Akun Faris Jimi aktif! Data tersimpan permanen.`);
        }
      }
    }, 150);
  };

  const handleGuestLogin = () => {
    const session = loginAsGuest();
    onAuthSuccess(session, 'Masuk sebagai Tamu (Data disimpan di browser lokal).');
  };

  return (
    <div
      id="auth_modal_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        id="auth_modal_card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white relative">
          {canDismiss && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-indigo-100" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-200">
              Penyimpanan Akun Aman
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {tab === 'login' ? 'Masuk ke Keuangan Harian' : 'Buat Akun Pribadi Anda'}
          </h2>
          <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
            Data keuangan Anda tersimpan permanen dan tidak akan berubah saat aplikasi dibuka
            kembali.
          </p>

          {/* Tab Switcher */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-indigo-900/40 rounded-xl">
            <button
              type="button"
              id="auth_tab_login"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              id="auth_tab_register"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email atau Nama Pengguna
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input_login_email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh: farisjimi1@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input_login_password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Tampilkan sandi"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="check_remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Tetap masuk (Jangan keluar waktu dibuka)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="btn_submit_login"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Memproses...' : 'Masuk ke Akun'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input_register_name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="contoh: Faris Jimi"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input_register_email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="emailanda@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input_register_password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Tampilkan sandi"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="check_register_remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Ingat akun ini di perangkat ini
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="btn_submit_register"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Mendaftarkan...' : 'Buat Akun & Simpan'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              atau opsi cepat
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Quick Demo and Guest Options */}
          <div className="space-y-2">
            <button
              type="button"
              id="btn_quick_demo_login"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Masuk 1-Klik Akun Demo (Faris Jimi)</span>
            </button>

            <button
              type="button"
              id="btn_guest_login"
              onClick={handleGuestLogin}
              className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium transition-colors text-center"
            >
              Gunakan sebagai Tamu (Tanpa Akun)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

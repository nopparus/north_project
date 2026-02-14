
import React, { useState } from 'react';
import { Layout, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

// Simple password-based login
// USER_PASS  = access to the app (read-only / user mode)
// ADMIN_PASS = access to admin features
const USER_PASS  = 'fiber2568';
const ADMIN_PASS = 'fiberadmin2568';

interface LoginPageProps {
  onLogin: (isAdmin: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password === ADMIN_PASS) {
      onLogin(true);
    } else if (password === USER_PASS) {
      onLogin(false);
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
      shake();
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div
        className={`w-full max-w-sm transition-all ${shaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={shaking ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-2xl shadow-blue-600/40 mb-4">
            <Layout className="text-white" size={36} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">FiberFlow BOQ</h1>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Enterprise Planner</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-black text-white mb-1">เข้าสู่ระบบ</h2>
          <p className="text-xs text-slate-500 mb-6">กรุณาใส่รหัสผ่านเพื่อใช้งาน</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <input
                  autoFocus
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className={`w-full bg-slate-800 border rounded-xl px-4 py-3 pr-10 text-sm text-white outline-none focus:ring-2 transition-all ${
                    error
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!password}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30"
            >
              <LogIn size={16} />
              เข้าสู่ระบบ
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-6">
          FiberFlow BOQ Planner © {new Date().getFullYear()}
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

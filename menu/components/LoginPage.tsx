
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Artificial delay for feel
    await new Promise(r => setTimeout(r, 800));
    
    const result = await login('admin', password);
    if (!result.success) {
      setError('Invalid access key. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-zinc-900 border border-zinc-800 mb-6 text-indigo-500 shadow-xl shadow-indigo-500/10">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Nexus Gateway</h1>
          <p className="text-zinc-500">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 ml-1">
                Security Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your key..."
                  className="block w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-3 text-sm text-rose-500 animate-in slide-in-from-top-1 duration-200">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Access System
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
        
        <p className="text-center mt-8 text-zinc-600 text-sm">
          System Key Hint: <code className="bg-zinc-900 px-2 py-1 rounded text-zinc-400">admin123</code>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

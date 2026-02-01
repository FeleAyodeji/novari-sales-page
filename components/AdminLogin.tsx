
import React, { useState } from 'react';
import { supabase } from '../supabase';

interface AdminLoginProps {
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    }
    // Success is handled by the onAuthStateChange listener in App.tsx
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans selection:bg-gold selection:text-black">
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold tracking-[0.2em] text-white mb-2">NOVARI</h1>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-4"></div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Secure Admin Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1.5 block">Admin Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@novari.com" 
              className="w-full bg-black border border-zinc-800 focus:border-gold rounded-xl px-6 py-4 text-white outline-none transition-all placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1.5 block">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-black border border-zinc-800 focus:border-gold rounded-xl px-6 py-4 text-white outline-none transition-all placeholder:text-zinc-700"
            />
          </div>

          {error && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center py-2">{error}</p>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full gold-bg text-black font-black py-4 rounded-xl text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2"
          >
            {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Authorize Access'}
          </button>
        </form>

        <button 
          onClick={onCancel}
          className="w-full mt-6 text-zinc-500 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors"
        >
          Return to Storefront
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;

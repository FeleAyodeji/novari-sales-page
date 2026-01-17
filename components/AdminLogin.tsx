
import React, { useState } from 'react';

interface AdminLoginProps {
  correctPassword: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ correctPassword, onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans selection:bg-gold selection:text-black">
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Aesthetic background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold tracking-[0.2em] text-white mb-2">NOVARI</h1>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-4"></div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Administrator Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password" 
              className={`w-full bg-black border ${error ? 'border-red-500' : 'border-zinc-800'} focus:border-gold rounded-xl px-6 py-4 text-white outline-none transition-all placeholder:text-zinc-700`}
              autoFocus
            />
            {error && (
              <p className="absolute -bottom-6 left-0 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Incorrect credentials</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full gold-bg text-black font-black py-4 rounded-xl text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Authenticate
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

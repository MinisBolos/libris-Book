import React, { useState, useEffect } from 'react';
import { Lock, User, Key, ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [error, setError] = useState('');
  
  // Security State
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Constants
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 30; // seconds

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLocked && lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockoutTime]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError('');

    // Hardcoded credentials for demo purposes
    // Security ID is strictly checked against "Dando95612947"
    if (securityId !== 'Dando95612947' || password.length < 4 || !email.includes('@')) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setLockoutTime(LOCKOUT_DURATION);
        setError(`Muitas tentativas falhas. Bloqueado por ${LOCKOUT_DURATION}s.`);
      } else {
        setError(`Credenciais inválidas. Tentativa ${newAttempts} de ${MAX_ATTEMPTS}.`);
      }
      return;
    }

    // Success
    setAttempts(0);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-indigo-600 p-8 text-center relative">
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Área Restrita</h2>
          <p className="text-indigo-200 text-sm">Acesso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {isLocked ? (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-200 animate-pulse">
               <AlertTriangle className="mx-auto mb-2" size={24} />
               <p className="font-bold">Acesso Bloqueado</p>
               <p className="text-sm mb-2">Muitas tentativas incorretas.</p>
               <span className="text-2xl font-mono font-bold">{lockoutTime}s</span>
             </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                  <Lock size={16} /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail Corporativo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@libris.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID de Segurança</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={securityId}
                    onChange={(e) => setSecurityId(e.target.value)}
                    placeholder="Insira o ID único"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Este ID é fornecido pelo sistema central.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transform active:scale-[0.98] transition-all"
              >
                Acessar Painel
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
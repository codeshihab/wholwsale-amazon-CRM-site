import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, t, language } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('Wholesale Connect USA');
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(email, password);
      onClose();
    } else if (mode === 'register') {
      await register(name, email, password, businessName);
      onClose();
    } else if (mode === 'forgot') {
      setForgotSent(true);
      setTimeout(() => {
        setForgotSent(false);
        setMode('login');
      }, 2500);
    }
  };

  const handleDemoLogin = async () => {
    await login('mdshihabhossen.dm@gmail.com', 'password123');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-xs space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
            WC
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {mode === 'login' ? t.login : mode === 'register' ? t.register : t.forgotPassword}
          </h2>
          <p className="text-slate-500 text-xs">
            {mode === 'login'
              ? t.loginSubtitle
              : mode === 'register'
              ? 'Create your wholesale referral management workspace'
              : 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {forgotSent ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="font-bold">Password Reset Link Dispatched</p>
            <p className="text-[11px]">Check your inbox for instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Shihab Hossen"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Business Agency Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="Wholesale Connect USA"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@wholesaleconnectusa.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>{mode === 'login' ? t.login : mode === 'register' ? t.register : 'Reset Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Demo One-Click Sign In */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
          >
            {t.demoLogin}
          </button>

          <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px]">
            {mode === 'login' ? (
              <>
                <span>Don't have an account?</span>
                <button onClick={() => setMode('register')} className="text-blue-600 font-semibold hover:underline">
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <button onClick={() => setMode('login')} className="text-blue-600 font-semibold hover:underline">
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLogin } from './useAuthQueries';
import {
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';


export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate(
      { email, password },
      {
     onSuccess: (data) => {


  if (data.data.user.role === 'teacher') {
    navigate('/teacher/dashboard');
  } else {
    navigate('/student/dashboard');
  }
},
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-3xl glass-panel relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl mb-4">
            <Sparkles className="h-6 w-6 animate-float" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">Sign in to access your dashboard</p>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 p-3.5 mb-6 text-sm text-danger-400 bg-danger-500/10 rounded-xl border border-danger-500/20">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl outline-none text-slate-200 placeholder-slate-550 text-sm transition-all"
              />
            </div>
          </div>

     <div>
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
    Password
  </label>

  <div className="relative">
    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />

    <input
      type={showPassword ? 'text' : 'password'}
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      className="w-full pl-12 pr-12 py-3.5 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl outline-none text-slate-200 placeholder-slate-550 text-sm transition-all"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
    >
      {showPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  </div>
</div>
<div className="flex justify-end">
  <Link
    to="/forgot-password"
    className="text-sm text-brand-400 hover:text-brand-300 hover:underline"
  >
    Forgot Password?
  </Link>
</div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-dark-950 font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.99] cursor-pointer"
          >
            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400 font-semibold">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-brand-400 hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

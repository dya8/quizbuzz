import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRegister } from './useAuthQueries';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Sparkles,
  GraduationCap,
  School,
  Eye,
  EyeOff
} from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();
  const navigate = useNavigate();

  const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('one special character');
  }

  return errors;
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg('');

  const passwordErrors = validatePassword(password);

  if (passwordErrors.length > 0) {
    setErrorMsg(
      `Password must contain ${passwordErrors.join(', ')}.`
    );
    return;
  }

  registerMutation.mutate(
    { name, email, password, role },
    {
      onSuccess: (data) => {
        console.log(data);

        if (data?.user?.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      },
      onError: (err) => {
        setErrorMsg(
          err.response?.data?.message ||
          'Registration failed.'
        );
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
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl mb-3">
            <Sparkles className="h-6 w-6 animate-float" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">Get started with Intellecta AI today</p>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 p-3.5 mb-5 text-sm text-danger-400 bg-danger-500/10 rounded-xl border border-danger-500/20">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl outline-none text-slate-200 placeholder-slate-550 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
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
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
    Password
  </label>

  <div className="relative">
    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />

    <input
      type={showPassword ? 'text' : 'password'}
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter password"
      className="w-full pl-12 pr-12 py-3.5 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl outline-none text-slate-200 placeholder-slate-550 text-sm transition-all"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
    >
      {showPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  </div>

  <div className="mt-3 text-xs space-y-1">
    <p className={password.length >= 8 ? 'text-green-400' : 'text-slate-500'}>
      ✓ At least 8 characters
    </p>

    <p className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-slate-500'}>
      ✓ One uppercase letter
    </p>

    <p className={/[a-z]/.test(password) ? 'text-green-400' : 'text-slate-500'}>
      ✓ One lowercase letter
    </p>

    <p className={/[0-9]/.test(password) ? 'text-green-400' : 'text-slate-500'}>
      ✓ One number
    </p>

    <p
      className={
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
          ? 'text-green-400'
          : 'text-slate-500'
      }
    >
      ✓ One special character
    </p>
  </div>
</div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 px-4 border rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer font-semibold text-sm ${
                  role === 'student'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                    : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700'
                }`}
              >
                <GraduationCap size={16} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-3 px-4 border rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer font-semibold text-sm ${
                  role === 'teacher'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                    : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700'
                }`}
              >
                <School size={16} />
                <span>Teacher</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-dark-950 font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.99] cursor-pointer mt-2"
          >
            {registerMutation.isPending ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 font-semibold">
          <span>Already have an account? </span>
          <Link to="/login" className="text-brand-400 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

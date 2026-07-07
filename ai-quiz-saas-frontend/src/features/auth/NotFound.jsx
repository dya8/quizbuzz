import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 text-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md p-8 rounded-3xl glass-panel relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 bg-danger-500/10 text-danger-400 rounded-full mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200 mt-2">Page Not Found</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <Link to="/">
          <button className="inline-flex items-center space-x-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold rounded-xl transition-all shadow-lg shadow-brand-500/10 active:scale-[0.99] cursor-pointer">
            <Home size={18} />
            <span>Go to Dashboard</span>
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

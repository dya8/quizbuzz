import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Award, 
  BookOpen, 
  Trophy, 
  LogOut, 
  BarChart2, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGetStudentDashboard } from "../features/student-dashboard/useStudentQueries";
export const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { data: dashboardData } = useGetStudentDashboard();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'My Hub', path: '/student/dashboard', icon: BookOpen },
    { label: 'Browse Quizzes', path: '/student/quizzes', icon: Trophy },
    { label: 'My Analytics', path: '/student/analytics', icon: BarChart2 },
  ];

  const metrics = dashboardData?.data?.metrics;

const gamificationData = {
  streak: metrics?.streak ?? 0,
  xp: metrics?.totalXp ?? 0,
  level: metrics?.level ?? 1,
  xpToNextLevel: 100,
};

const xpPercentage = Math.min(
  (gamificationData.xp / gamificationData.xpToNextLevel) * 100,
  100
);

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <header className="h-20 border-b border-slate-900/60 px-6 md:px-12 flex items-center justify-between bg-dark-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center space-x-8">
          <Link to="/student/dashboard" className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-wider text-gradient flex items-center space-x-1.5">
              <Sparkles className="h-5 w-5 text-brand-400 fill-brand-400/20" />
              <span>Intellecta</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 neon-glow' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full"
          >
            <Flame className="h-5 w-5 text-orange-500 fill-orange-500 animate-pulse-subtle" />
            <span className="text-sm font-extrabold text-orange-400">{gamificationData.streak} Day Streak</span>
          </motion.div>

          <div className="hidden lg:flex items-center space-x-3 bg-slate-900/40 border border-slate-900 px-4 py-1.5 rounded-2xl">
            <Award className="h-4 w-4 text-brand-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level {gamificationData.level}</span>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{gamificationData.xp} XP</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="hidden md:flex p-2.5 rounded-xl bg-slate-900/60 hover:bg-danger-500/10 border border-slate-900 hover:border-danger-500/20 text-slate-400 hover:text-danger-400 transition-colors"
          >
            <LogOut size={16} />
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-900 bg-dark-950 px-6 py-4 flex flex-col space-y-3"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-danger-400 hover:bg-danger-500/10 transition-colors text-left"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

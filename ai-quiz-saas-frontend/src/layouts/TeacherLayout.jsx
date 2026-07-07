import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Eye, 
  FileEdit, 
  Library, 
  BarChart3, 
  Menu, 
  Bell, 
  ChevronRight, 
  LogOut, 
  User, 
  ChevronLeft 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const TeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'AI Quiz Generator', path: '/teacher/upload', icon: UploadCloud },
    { label: 'Question Review', path: '/teacher/review/latest', icon: Eye },
    { label: 'Quiz Builder', path: '/teacher/quiz-builder', icon: FileEdit },
    { label: 'My Quizzes', path: '/teacher/quizzes', icon: Library },
    { label: 'Deep Analytics', path: '/teacher/analytics', icon: BarChart3 },
  ];

  const pathnames = location.pathname.split('/').filter((x) => x);


  return (
    <div className="min-h-screen flex bg-dark-950 text-slate-100">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel border-r border-slate-900 flex flex-col h-screen sticky top-0 z-40 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-900/60 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-gradient tracking-wide"
              >
                Intellecta AI
              </motion.span>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-lg text-brand-500 mx-auto"
              >
                I
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path.split('/:')[0]);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 neon-glow'
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-brand-400' : 'text-slate-400'} />
                  {!collapsed && (
                    <span className="text-sm font-semibold tracking-wide transition-opacity">
                      {item.label}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-900/60">
          {!collapsed ? (
            <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-900">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-slate-100 uppercase">
                  {user?.name?.[0] || 'T'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Teacher Account'}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-danger-400 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 bg-slate-900/40 border border-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-danger-400"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <header className="h-20 border-b border-slate-900/60 px-8 flex items-center justify-between sticky top-0 bg-dark-950/80 backdrop-blur-md z-30">
          <div className="flex items-center space-x-2 text-sm text-slate-400 font-medium">
            <span>Teacher</span>
            {pathnames.slice(1).map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`;
              const isLast = index === pathnames.slice(1).length - 1;
              return (
                <div key={name} className="flex items-center space-x-2">
                  <ChevronRight size={14} className="text-slate-650" />
                  <Link
                    to={routeTo}
                    className={`hover:text-brand-400 capitalize ${isLast ? 'text-slate-200 font-semibold' : ''}`}
                  >
                    {name.replace('-', ' ')}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">

            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center font-bold text-slate-100 uppercase text-xs">
                  {user?.name?.[0] || 'T'}
                </div>
                <div className="text-left hidden sm:block">
                  <h4 className="text-xs font-semibold text-slate-200">{user?.name || 'Teacher'}</h4>
                  <p className="text-[9px] text-slate-500 capitalize">{user?.role}</p>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-52 glass-panel p-2 rounded-2xl border border-slate-800 shadow-2xl z-50 animate-scale-in"
                  >
                    <Link to="/teacher/analytics" onClick={() => setShowProfileMenu(false)}>
                      <div className="flex items-center space-x-3 p-2.5 hover:bg-slate-900/60 rounded-xl text-slate-400 hover:text-slate-250 transition-colors cursor-pointer">
                        <BarChart3 size={16} />
                        <span className="text-xs font-semibold">Analytics Summary</span>
                      </div>
                    </Link>
                    <div className="h-px bg-slate-900/60 my-1.5" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-2.5 hover:bg-danger-500/10 text-slate-400 hover:text-danger-400 rounded-xl transition-colors text-left"
                    >
                      <LogOut size={16} />
                      <span className="text-xs font-semibold">Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

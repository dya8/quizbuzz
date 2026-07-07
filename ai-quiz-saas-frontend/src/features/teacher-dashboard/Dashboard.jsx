import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Library, 
  Users, 
  BrainCircuit, 
  ArrowUpRight, 
  UploadCloud, 
  PlusCircle, 
  LineChart, 
  Calendar 
} from 'lucide-react';
import { useGetTeacherDashboard } from './useQuizQueries';


export const TeacherDashboard = () => {
  const { data: dashboardData, isLoading } = useGetTeacherDashboard();
   
const data = dashboardData?.data;
 const currentMonthYear = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const quickActions = [
    { title: 'Upload & Generate', desc: 'Generate quizzes from PDF with Gemini AI', link: '/teacher/upload', icon: UploadCloud, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
    { title: 'Create Quiz', desc: 'Build manually or load custom templates', link: '/teacher/quiz-builder', icon: PlusCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Deep Analytics', desc: 'Inspect performance graphs & charts', link: '/teacher/analytics', icon: LineChart, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(x => <div key={x} className="h-32 bg-slate-900 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Teacher Workspace</h1>
          <p className="text-sm text-slate-400 mt-1">Manage classrooms, create AI assessments, and analyze student analytics</p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 font-semibold">
          <Calendar size={14} />
          <span>{currentMonthYear}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Quizzes</span>
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
              <Library size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{data.metrics.totalQuizzes}</h3>
            <span className="text-xs text-slate-500 mt-1 block">{data.metrics.live} Live / {data.metrics.drafts} Drafts</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students Enrolled</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-450 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{data.metrics.studentsEnrolled}</h3>
            <span className="text-xs text-accent-500 mt-1 block">Active across classes</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Questions Created</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <BrainCircuit size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{data.metrics.aiGeneratedQuestions}</h3>
            <span className="text-xs text-indigo-400 mt-1 block">Gemini generation pipeline</span>
          </div>
        </div>

       
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-wide">Quick Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} to={action.link} className="block group">
                  <div className="p-6 rounded-2xl bg-dark-900/40 border border-slate-900 group-hover:border-brand-500/30 group-hover:bg-brand-500/5 transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className={`p-3 rounded-xl inline-block border ${action.color} mb-4`}>
                        <Icon size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{action.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{action.desc}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-end text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white tracking-wide">Recent activity feed</h2>
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-slate-900 last:border-b-0 last:pb-0">
                <div className="h-2 w-2 rounded-full bg-brand-500 mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-300 leading-normal">{activity.description}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

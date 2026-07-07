import React from 'react';
import { useGetAnalytics } from './useQuizQueries';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line 
} from 'recharts';
import { BarChart3, TrendingUp, Award, Clock, Users } from 'lucide-react';

export const TeacherAnalytics = () => {
  const { data: analyticsData, isLoading } = useGetAnalytics('teacher');
  const analytics = analyticsData?.data;
  const summary = analytics?.summary;

const performance =
  analytics?.performance ;

const questionStats =
  analytics?.questionStats ;

const engagement =
  analytics?.engagement;
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-900 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-900 rounded-2xl"></div>
          <div className="h-80 bg-slate-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="text-brand-400" />
          <span>Deep Analytics Suite</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Real-time stats tracking class performance distributions, question accuracy metrics, and engagement funnels.</p>
      </div>

      {/* Stats Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-dark-900/40 border border-slate-900 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Average Accuracy</span>
<span className="text-xl font-bold text-white mt-0.5 block">
  {summary?.avgAccuracy ?? 0}%
</span>          </div>
        </div>

        <div className="p-5 bg-dark-900/40 border border-slate-900 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-555 uppercase tracking-wider block">Participation Rate</span>
<span className="text-xl font-bold text-white mt-0.5 block">
  {summary?.participationRate ?? 0}%
</span>          </div>
        </div>

        <div className="p-5 bg-dark-900/40 border border-slate-900 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-555 uppercase tracking-wider block">Avg Time spent</span>
<span className="text-xl font-bold text-white mt-0.5 block">
  {summary?.avgTimeSpent ?? 0} min
</span>          </div>
        </div>

        <div className="p-5 bg-dark-900/40 border border-slate-900 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-555 uppercase tracking-wider block">Total Attempts</span>
<span className="text-xl font-bold text-white mt-0.5 block">
  {summary?.totalAttempts ?? 0}
</span>          </div>
        </div>
      </div>

      {/* Recharts Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Class Performance */}
        <div className="p-6 border border-slate-900 bg-dark-900/40 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Class Performance Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0c1b', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                />
                <Bar dataKey="students" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Question Breakdown */}
        <div className="p-6 border border-slate-900 bg-dark-900/40 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Question-by-Question Difficulty Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="question" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f0c1b', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Legend iconType="circle" fontSize={10} wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="correct" name="Correct %" stackId="a" fill="#10b981" />
                <Bar dataKey="incorrect" name="Incorrect %" stackId="a" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Engagement Funnel */}
        <div className="lg:col-span-2 p-6 border border-slate-900 bg-dark-900/40 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Student Participation & Engagement Funnel</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f0c1b', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                <Area type="monotone" dataKey="visits" name="Quiz Views" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Quiz Completions" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetStudentDashboard } from './useStudentQueries';
import { 
  Flame, 
  ChevronRight,
  Brain,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const { data: dashboardData, isLoading } = useGetStudentDashboard();
  const data = dashboardData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-900 rounded-2xl"></div>
          <div className="h-40 bg-slate-900 rounded-2xl"></div>
          <div className="h-40 bg-slate-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Learning Hub</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Access your active courses, check streaks, and explore AI recommendations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Level Progress</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">Level {data.metrics.level}</h3>
          <span className="text-xs text-brand-400 mt-1.5 block">{data.metrics.totalXp} Total XP</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Streak</span>
          <h3 className="text-2xl font-extrabold text-orange-450 mt-2 flex items-center space-x-2">
            <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
            <span>{data.metrics.streak} Days</span>
          </h3>
          <span className="text-xs text-slate-500 mt-1.5 block">Keep it up!</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
          <h3 className="text-2xl font-extrabold text-emerald-450 mt-2">{data.metrics.avgAccuracy}%</h3>
          <span className="text-xs text-slate-500 mt-1.5 block">Across {data.metrics.takenCount} attempts</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Quizzes</span>
          <h3 className="text-2xl font-extrabold text-indigo-400 mt-2">{data.metrics.takenCount}</h3>
          <span className="text-xs text-slate-500 mt-1.5 block">Assessments finished</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 border border-slate-900 bg-dark-900/40 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand-500/15 text-brand-400 rounded-xl">
              <Brain size={20} className="animate-float" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI-Powered Skill Analysis</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Custom profile recommendations compiled by Gemini AI</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-xs text-slate-300 leading-relaxed">
            {data.aiInsights.recommendation}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-accent-500 uppercase tracking-wider flex items-center space-x-1">
                <ThumbsUp size={12} />
                <span>Strong Topics</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.aiInsights.strongTopics.map((topic, idx) => (
                  <span key={idx} className="text-[10px] font-semibold bg-accent-500/10 text-accent-400 border border-accent-500/20 px-2.5 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-danger-400 uppercase tracking-wider flex items-center space-x-1">
                <AlertCircle size={12} />
                <span>Focus Required</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.aiInsights.weakTopics.map((topic, idx) => (
                  <span key={idx} className="text-[10px] font-semibold bg-danger-500/10 text-danger-400 border border-danger-500/20 px-2.5 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Recommended Quizzes</h3>
            <Link to="/student/quizzes" className="text-[10px] text-brand-400 hover:underline font-bold">View All</Link>
          </div>
          
          <div className="space-y-3">
            {data.quizzesAvailable.map((quiz) => (
              <div key={quiz.id} className="p-5 bg-dark-900/40 border border-slate-900 hover:border-slate-800 transition-all rounded-2xl flex flex-col justify-between h-40">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {quiz.tag}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{quiz.timeLimit} Mins</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3 line-clamp-1">{quiz.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">{quiz.questionsCount} MCQ Questions</p>
                </div>
                <Link to={`/student/quiz/${quiz.id}`} className="mt-4 flex items-center justify-between text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors">
                  <span>Start Challenge</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

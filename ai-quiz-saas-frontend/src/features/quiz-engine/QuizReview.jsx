import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetQuizResults } from '../student-dashboard/useStudentQueries';
import { MCQOptionSelector } from '../../components/MCQOptionSelector';
import { 
  Trophy, 
  Sparkles, 
  Clock, 
  Award, 
  HelpCircle, 
  ArrowRight, 
  Brain,
  CheckCircle,
  XCircle,
  Home
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const QuizReview = () => {
  const { id } = useParams();
  const { data: results, isLoading } = useGetQuizResults(id);

 
 const data = results?.data;
 if (!isLoading && !data) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Trophy size={56} className="text-slate-600 mb-4" />

      <h2 className="text-2xl font-bold text-white">
        No quiz results found
      </h2>

      <p className="text-slate-400 mt-2">
        Complete a quiz to view your performance report.
      </p>

      <Link to="/student/dashboard">
        <button className="mt-6 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold rounded-xl">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Celebration Header Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 border border-slate-900 bg-dark-900/40 rounded-3xl relative overflow-hidden text-center space-y-4 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/10 via-indigo-650/5 to-transparent pointer-events-none" />
        
        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-yellow-500 to-amber-400 text-dark-950 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 animate-float">
          <Trophy size={32} />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center space-x-1.5">
            <Sparkles className="text-yellow-400 fill-yellow-400/20" />
            <span>Congratulations!</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">You completed the assessment successfully.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4 border-t border-slate-900/60 mt-4">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Accuracy</span>
            <span className="text-xl font-extrabold text-white mt-1 block">
              {((data?.correctCount || 0 / data?.totalQuestions || 1) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Time Spent</span>
            <span className="text-xl font-extrabold text-white mt-1 block">
              {formatDuration(data?.timeSpentSeconds || 0)}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">XP Earned</span>
            <span className="text-xl font-extrabold text-gradient-gold mt-1 block">
              +{data?.xpGained || 0} XP
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid: Time Timeline + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Time spent per question chart */}
        <div className="lg:col-span-1 p-6 border border-slate-900 bg-dark-900/40 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
            <Clock size={14} className="text-brand-400" />
            <span>Time Timeline (Sec)</span>
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.timeSpentPerQuestion || []} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <XAxis dataKey="question" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f0c1b', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="seconds" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Question breakdown lists */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
            <HelpCircle size={15} className="text-brand-400" />
            <span>Detailed Question Review</span>
          </h3>

          <div className="space-y-6">
           {data?.reviewQuestions?.map((q, idx) => {
              return (
                <div key={idx} className="p-6 border border-slate-900 bg-dark-900/40 rounded-3xl space-y-4">
                  {/* Status row */}
                  <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                    <span className="text-xs font-bold text-slate-400">Question #{idx + 1}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center space-x-1 ${
                      q.isCorrect 
                        ? 'bg-accent-500/10 text-accent-400 border border-accent-500/25' 
                        : 'bg-danger-500/10 text-danger-400 border border-danger-500/25'
                    }`}>
                      {q.isCorrect ? (
                        <>
                          <CheckCircle size={12} />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-sm font-bold text-slate-200">{q.questionText}</h4>

                  {/* Option display using MCQOptionSelector */}
                  <MCQOptionSelector
                    options={q.options}
                    selectedOption={q.selectedOption}
                    correctOption={q.correctOption}
                    isReviewMode={true}
                  />

                  {/* AI Explanatory Card */}
                  <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl flex items-start space-x-3">
                    <div className="p-1.5 bg-brand-500/10 text-brand-400 rounded-lg mt-0.5">
                      <Brain size={14} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-355">AI Explanation Feedback</h5>
                      <p className="text-[11px] text-slate-450 mt-1 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Return home button */}
      <div className="flex justify-center pt-4 border-t border-slate-900">
        <Link to="/student/dashboard">
          <button className="flex items-center space-x-2 px-6 py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-all cursor-pointer text-sm">
            <Home size={16} />
            <span>Return to Hub</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

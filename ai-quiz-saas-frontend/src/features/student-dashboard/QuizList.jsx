import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetStudentQuizzes } from './useStudentQueries';
import { 
  Trophy, 
  Clock, 
  X, 
  Info,
  Sparkles
} from 'lucide-react';

export const QuizList = () => {
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const { data: quizzes } = useGetStudentQuizzes({ tag: selectedTag, status: selectedStatus });

  const list = quizzes?.data || [];
  const tagsList = ['All', 'Algorithms', 'Physics', 'React'];

  const filteredQuizzes = list.filter((q) => {
    const matchesTag = selectedTag === 'All' || q.tag === selectedTag;
    const matchesStatus = selectedStatus === 'All' || q.status === selectedStatus;
    return matchesTag && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Trophy className="text-brand-400" />
            <span>Quiz Catalog</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Select an assessment to start learning. Earn XP and extend your streak.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-900">
        <div className="flex items-center space-x-2">
          {['All', 'New', 'Attempted'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                selectedStatus === status
                  ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                  : 'border-slate-800 bg-slate-955/20 text-slate-400 hover:border-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {tagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div 
            key={quiz.id}
            onClick={() => setSelectedQuiz(quiz)}
            className="p-6 rounded-2xl bg-dark-900/40 border border-slate-900 hover:border-slate-850 hover:bg-slate-900/10 transition-all flex flex-col justify-between h-48 cursor-pointer group"
          >
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {quiz.tag}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                  quiz.status === 'Attempted' 
                    ? 'bg-accent-500/10 text-accent-400' 
                    : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {quiz.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-brand-450 transition-colors line-clamp-1">{quiz.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{quiz.description}</p>
            </div>

            <div className="flex items-center justify-between mt-4 text-[10px] text-slate-400 font-semibold border-t border-slate-900/60 pt-3">
              <span className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{quiz.timeLimit} Mins</span>
              </span>
              <span className="text-brand-450 font-bold">{quiz.points} XP Reward</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedQuiz && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuiz(null)}
              className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-dark-900 border-l border-slate-800 p-8 flex flex-col justify-between h-full z-10 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedQuiz.tag}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuiz(null)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-white">{selectedQuiz.title}</h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedQuiz.description}</p>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Info size={13} className="text-brand-400" />
                    <span>Assessment Specifications</span>
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                    <li>Time limit: {selectedQuiz.timeLimit} minutes total.</li>
                    <li>Questions count: {selectedQuiz.questionsCount} Multiple Choice.</li>
                    <li>Earn up to <span className="text-brand-400 font-bold">+{selectedQuiz.points} XP</span> on high scores.</li>
                    <li>Supports fullscreen distraction-free engine.</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-900/60 pt-6">
                <Link to={`/student/quiz/${selectedQuiz.id}`}>
                  <button className="w-full flex items-center justify-center space-x-2 py-4 bg-brand-500 hover:bg-brand-600 text-dark-950 font-extrabold rounded-xl shadow-lg shadow-brand-500/15 cursor-pointer text-sm">
                    <Sparkles size={16} />
                    <span>Begin Assessment</span>
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

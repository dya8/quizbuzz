import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateQuiz } from './useQuizQueries';
import { 
  Sparkles, 
  Clock, 
  Award, 
  Link as LinkIcon, 
  Copy, 
  CheckCircle2, 
  FileEdit
} from 'lucide-react';

export const QuizBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const createQuizMutation = useCreateQuiz();

  const passedQuestions = location.state?.questions || [];
  const chapterId = location.state?.chapterId;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(10);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePublish = async (e) => {
    e.preventDefault();
   const payload = {
  title,
  chapterId,
  description,
  timeLimit,

  questionIds: passedQuestions.map(
    (q) => q.id || q._id
  ),
};


    createQuizMutation.mutate(payload, {
    onSuccess: (response) => {
 

  setGeneratedId(
    response?.data?.quizId ||
    response?.data?._id ||
    response?.quizId ||
    'quiz_demo_123'
  );

  setShowSuccessModal(true);
},
    });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/student/quiz/${generatedId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <FileEdit className="text-brand-400" />
          <span>Assemble & Publish Quiz</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure timings, tags, and points. Convert your curated questions into an assessment.</p>
      </div>

      <form onSubmit={handlePublish} className="space-y-6 p-6 border border-slate-900 bg-dark-900/40 rounded-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quiz Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Mechanics Assessment"
              className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl outline-none text-slate-200 placeholder-slate-550 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Instructions / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide guidelines for students..."
              className="w-full p-4 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl outline-none text-slate-200 placeholder-slate-555 text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-900/60 py-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock size={12} className="text-brand-400" />
              <span>Time Limit (Mins)</span>
            </label>
            <input
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 rounded-xl outline-none text-slate-200 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Award size={12} className="text-brand-400" />
              <span>Points Per Question</span>
            </label>
            <input
              type="number"
              min="1"
              value={pointsPerQuestion}
              onChange={(e) => setPointsPerQuestion(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 rounded-xl outline-none text-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="bg-brand-500/5 border border-brand-500/10 p-4 rounded-xl flex items-center justify-between text-xs font-medium">
          <span className="text-slate-450">Total Curated Questions:</span>
          <span className="text-brand-400 font-bold text-sm">{passedQuestions.length}</span>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Go Back
          </button>
          <button
            type="submit"
            disabled={createQuizMutation.isPending || passedQuestions.length === 0}
            className="flex items-center space-x-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-dark-950 font-bold rounded-xl shadow-lg shadow-brand-500/20 cursor-pointer text-sm"
          >
            <Sparkles size={14} className="fill-current" />
            <span>Publish Assessment</span>
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-dark-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-2xl animate-scale-in"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500" />
              
              <div className="mx-auto w-14 h-14 bg-accent-500/10 border border-accent-500/20 text-accent-400 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Quiz Published Live!</h3>
                <p className="text-xs text-slate-550 mt-1.5">Your assessment is online. Share this link with students to start attempts.</p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950 p-3 rounded-2xl border border-slate-900">
                <LinkIcon size={16} className="text-slate-550 flex-shrink-0" />
                <span className="text-xs text-slate-400 truncate flex-1 text-left">
                  {`${window.location.origin}/student/quiz/${generatedId}`}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <span className="text-[10px] font-bold text-accent-400">Copied</span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/teacher/quizzes');
                  }}
                  className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-all cursor-pointer text-sm"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

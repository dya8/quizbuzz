import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizTimer } from '../../components/QuizTimer';
import { MCQOptionSelector } from '../../components/MCQOptionSelector';
import { useAttemptQuiz, useSubmitQuiz } from '../student-dashboard/useStudentQueries';
import { 
  Maximize2, 
  Minimize2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Flag
} from 'lucide-react';

export const QuizEngine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: attemptData, isLoading } = useAttemptQuiz(id);

  const submitQuizMutation = useSubmitQuiz();

const quizTitle = attemptData?.data?.title || "";
const questions = attemptData?.data?.questions || [];
const quizDuration = (attemptData?.data?.timeLimit || 30) * 60;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectOption = (option) => {
    const qId = questions[currentIdx].id || `q_${currentIdx}`;
    const newAnswers = { ...answers, [qId]: option };
    setAnswers(newAnswers);
    sessionStorage.setItem(`quiz_autosave_${id}`, JSON.stringify(newAnswers));
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(`quiz_autosave_${id}`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [id]);

  const handleToggleFlag = () => {
    setFlagged((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowSubmitConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSubmitQuiz = () => {

  const formattedAnswers = attemptData.data.questions.map((question, index) => ({
    questionId: question._id,
    selectedAnswer: answers[`q_${index}`] || "",
  }));


  submitQuizMutation.mutate(
    {
      quizId: id,
      answers: formattedAnswers,
      timeTaken: timeSpent,
    },
    {
      onSuccess: (data) => {
        sessionStorage.removeItem(`quiz_autosave_${id}`);

        if (document.fullscreenElement) {
          document.exitFullscreen();
        }

        navigate(`/student/results/${data.data._id}|| "latest-results"}`);
      },

      onError: () => {
        sessionStorage.removeItem(`quiz_autosave_${id}`);
        navigate("/student/results/latest-results");
      },
    }
  );
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col justify-between p-6 md:p-10 relative">
      <header className="flex items-center justify-between pb-6 border-b border-slate-900/60">
        <div>
          <h2 className="text-sm font-bold text-slate-550 uppercase tracking-widest">Assessment Mode</h2>
          <h1 className="text-base font-extrabold text-white mt-1">{quizTitle}</h1>
        </div>

        <div className="flex items-center space-x-6">
          <QuizTimer durationSeconds={quizDuration} onExpire={handleSubmitQuiz} />

          <button 
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto flex flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold bg-brand-500 text-dark-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Q{currentIdx + 1} of {questions.length}
                </span>
                {flagged[currentIdx] && (
                  <span className="text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/25 px-2.5 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                    <Flag size={10} className="fill-current" />
                    <span>Review Later</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">{currentQuestion.question}</h2>
            </div>

            <MCQOptionSelector
              options={currentQuestion.options}
              selectedOption={answers[currentQuestion.id || `q_${currentIdx}`]}
              onSelect={handleSelectOption}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-900/60 pt-6 space-y-6 max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center space-x-1 px-4 py-2.5 bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer text-xs"
          >
            <ArrowLeft size={14} />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFlag}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              flagged[currentIdx]
                ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Flag size={12} className={flagged[currentIdx] ? 'fill-current' : ''} />
            <span>{flagged[currentIdx] ? 'Flagged' : 'Flag for Later'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-1 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold rounded-xl transition-all cursor-pointer text-xs"
          >
            <span>{currentIdx === questions.length - 1 ? 'Finish' : 'Next'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center py-2 bg-slate-955/40 p-3 rounded-2xl border border-slate-900">
          {questions.map((q, idx) => {
            const hasAnswer = !!answers[q.id || `q_${idx}`];
            const isCurrent = currentIdx === idx;
            const isFlagged = flagged[idx];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent 
                    ? 'bg-brand-500 text-dark-950 font-extrabold ring-2 ring-brand-500/30 shadow-md shadow-brand-500/20' 
                    : isFlagged 
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/35'
                      : hasAnswer 
                        ? 'bg-accent-500/15 text-accent-400 border border-accent-500/25' 
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </footer>

      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-dark-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden animate-scale-in"
            >
              <div className="mx-auto w-12 h-12 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full flex items-center justify-center">
                <CheckCircle size={24} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Submit Assessment?</h3>
                <p className="text-xs text-slate-550 mt-1.5">You have answered {answeredCount} out of {questions.length} questions. You cannot edit answers after submission.</p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold rounded-xl shadow-lg shadow-brand-500/15 transition-all cursor-pointer text-xs"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

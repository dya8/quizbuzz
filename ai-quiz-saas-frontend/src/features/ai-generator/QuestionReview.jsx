import React, { useState,useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Check, ArrowRight, AlertCircle, Plus } from 'lucide-react';
import { useGetQuestionsByBatch } from './useAIQueries';
export const QuestionReview = () => {
  const { batchId } = useParams();
  
  const { data, isLoading } = useGetQuestionsByBatch(batchId);
 
  const location = useLocation();
  const navigate = useNavigate();
  const chapterId = location.state?.chapterId;

  

  const [questions, setQuestions] = useState([]);
useEffect(() => {
 

  if (!data) return;

  const questionsArray =
    data?.data?.questions ||
    data?.questions ||
    data?.data ||
    [];

  console.log("Questions Array:", questionsArray);

  setQuestions(
    questionsArray.map((q) => ({
      id: q._id,
      questionText: q.question,
      options: q.options || [],
      correctOption: q.correctAnswer,
      difficulty: q.difficulty,
      explanation: q.explanation,
    }))
  );
}, [data]);

  const handleEditQuestionText = (index, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index].questionText = value;
      return updated;
    });
  };

  const handleEditOptionText = (qIndex, oIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const oldOptionVal = updated[qIndex].options[oIndex];
      updated[qIndex].options[oIndex] = value;
      if (updated[qIndex].correctOption === oldOptionVal) {
        updated[qIndex].correctOption = value;
      }
      return updated;
    });
  };

  const handleSelectCorrectOption = (qIndex, optionVal) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].correctOption = optionVal;
      return updated;
    });
  };

  const handleDifficultyChange = (qIndex, diff) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].difficulty = diff;
      return updated;
    });
  };

  const handleDiscardQuestion = (qIndex) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_new_${Date.now()}`,
        questionText: 'New Question Text',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOption: 'Option A',
        difficulty: 'medium',
        explanation: ''
      }
    ]);
  };

  const handlePushToQuizBuilder = () => {
    navigate('/teacher/quiz-builder', { state: { questions, chapterId } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Sparkles className="text-brand-400 animate-float" />
            <span>Interactive AI Question Review</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and polish AI generated outputs. Switch correct answers, change options, and discard poor outputs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Question</span>
          </button>
          <button
            onClick={handlePushToQuizBuilder}
            disabled={questions.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-dark-950 font-bold rounded-xl shadow-lg shadow-brand-500/15 cursor-pointer text-xs"
          >
            <span>Proceed to Quiz Builder</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {questions.length === 0 && (
        <div className="p-8 border border-dashed border-slate-800 rounded-3xl bg-dark-900/20 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No questions left in this batch</h3>
          <p className="text-xs text-slate-550 max-w-sm mx-auto">You have discarded all questions. Add a new question manually or restart the AI generation.</p>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {questions.map((question, qIdx) => (
            <motion.div
              key={question.id || qIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-6 border border-slate-900 bg-dark-900/40 rounded-3xl relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
                <span className="text-xs font-bold text-brand-450 uppercase tracking-wider">Question #{qIdx + 1}</span>
                <div className="flex items-center space-x-3">
                  <select
                    value={question.difficulty}
                    onChange={(e) => handleDifficultyChange(qIdx, e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-350 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <button
                    onClick={() => handleDiscardQuestion(qIdx)}
                    className="p-1.5 bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 rounded-lg transition-colors cursor-pointer"
                    title="Discard Question"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Question Text</label>
                <textarea
                  rows={2}
                  value={question.questionText}
                  onChange={(e) => handleEditQuestionText(qIdx, e.target.value)}
                  className="w-full p-4 bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl outline-none text-slate-200 text-sm transition-all"
                  placeholder="Enter the question text..."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">MCQ Options (Check radio to mark correct)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option, oIdx) => {
                    const isCorrect = question.correctOption === option;
                    return (
                      <div 
                        key={oIdx}
                        className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all ${
                          isCorrect 
                            ? 'border-accent-500/40 bg-accent-500/5 ring-1 ring-accent-500/20' 
                            : 'border-slate-800/80 bg-slate-900/20'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectCorrectOption(qIdx, option)}
                          className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                            isCorrect 
                              ? 'border-accent-500 bg-accent-500 text-dark-950 font-bold text-xs' 
                              : 'border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          {isCorrect && <Check size={12} strokeWidth={3} />}
                        </button>

                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleEditOptionText(qIdx, oIdx, e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-slate-200 text-sm placeholder-slate-600 focus:ring-0 p-0"
                          placeholder={`Option ${oIdx + 1}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {questions.length > 0 && (
        <div className="flex items-center justify-end border-t border-slate-900 pt-6">
          <button
            onClick={handlePushToQuizBuilder}
            className="flex items-center space-x-2 px-6 py-4 bg-brand-500 hover:bg-brand-600 text-dark-950 font-extrabold rounded-xl shadow-lg shadow-brand-500/20 cursor-pointer transition-all"
          >
            <span>Proceed to Quiz Builder</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

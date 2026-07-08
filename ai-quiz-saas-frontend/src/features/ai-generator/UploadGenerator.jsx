import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from '../../components/FileUpload';
import { useGenerateQuestions } from './useAIQueries';
import { 
  Sparkles, 
  Settings, 
  Cpu, 
  Database, 
  FileText, 
  Play, 
  CheckCircle, 
  ChevronRight 
} from 'lucide-react';
import { useUploadChapter } from './useChapterQueries';
import apiClient from '../../services/apiClient';


export const UploadGenerator = () => {
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [quizType, setQuizType] = useState('multiple-choice');
  const [step, setStep] = useState(1);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [currentPipelineStep, setCurrentPipelineStep] = useState(0);
  const [chapterId, setChapterId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [subject, setSubject] = useState('');
  const generateMutation = useGenerateQuestions();
  const uploadChapterMutation = useUploadChapter();
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) {
      setStep(2);
    }
  };

  const waitForChapterReady = async (chapterId) => {
  let isReady = false;

  while (!isReady) {
    const response = await apiClient.get(
      `/chapters/${chapterId}/status`
    );

    const status = response.data.data.processingStatus;

    console.log("Current Status:", status);

    if (status === 'ready') {
      isReady = true;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 6000));
  }
};
 const handleStartGeneration = async () => {
  try {
    const response = await uploadChapterMutation.mutateAsync({
      file,
      title: chapterTitle,
      subject,
    });

    

    const uploadedChapterId = response.data.chapter.id;

    setChapterId(uploadedChapterId);
    await waitForChapterReady(uploadedChapterId);

    setStep(3);
  } catch (error) {
    console.error(error);
  }
};
  useEffect(() => {
    if (step !== 3) return;
     if (!chapterId) return;

  generateMutation.mutate(
  {
    chapterId,
    numQuestions,
    difficulty,
    quizType
  },
      {
        onSuccess: (data) => {
  const batchId = data?.data?.batchId;

  setTimeout(() => {
    navigate(`/teacher/review/${batchId}`, {
      state: {
        questions: data?.data?.questions || [],
        chapterId: chapterId
      }
    });
  }, 1000);
},
      }
    );

    let duration = 6000;
    const interval = setInterval(() => {
      setPipelineProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    return () => clearInterval(interval);
  }, [step,chapterId]);

  useEffect(() => {
    if (step !== 3) return;
    if (pipelineProgress < 35) {
      setCurrentPipelineStep(0);
    } else if (pipelineProgress < 70) {
      setCurrentPipelineStep(1);
    } else {
      setCurrentPipelineStep(2);
    }
  }, [pipelineProgress, step]);

  const simulateFallbackSuccess = () => {
    setTimeout(() => {
      const mockQuestions = [
        {
          id: 'q1',
          questionText: 'What is the correct syntax for declaring a variable in JavaScript?',
          options: ['var x = 5;', 'let x = 5;', 'const x = 5;', 'All of the above'],
          correctOption: 'All of the above',
          difficulty: 'easy',
          explanation: 'JavaScript allows variable declaration using var, let, and const.'
        },
        {
          id: 'q2',
          questionText: 'Which lifecycle method is triggered when a component mounts in React class components?',
          options: ['componentDidUpdate', 'componentWillMount', 'componentDidMount', 'render'],
          correctOption: 'componentDidMount',
          difficulty: 'medium',
          explanation: 'componentDidMount runs immediately after a component is inserted into the tree.'
        },
        {
          id: 'q3',
          questionText: 'What is the time complexity of searching a binary search tree in the worst case?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctOption: 'O(n)',
          difficulty: 'hard',
          explanation: 'In the worst case, a binary search tree can degenerate into a linked list, resulting in O(n) search time.'
        }
      ];
      navigate(`/teacher/review/latest`, { state: { questions: mockQuestions } });
    }, 6500);
  };

  const pipelineSteps = [
    { label: 'PDF Text Extraction', desc: 'Parsing pages, isolating text blocks, and cleaning layout templates.', icon: FileText },
    { label: 'Vector Embeddings Creation', desc: 'Mapping concepts, matching index nodes, and preparing context slices.', icon: Database },
    { label: 'Gemini LLM Compilation', desc: 'Invoking Gemini API, compiling structured questions, and validating distractor options.', icon: Cpu },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between px-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= num 
                ? 'bg-brand-500 text-dark-950 font-extrabold shadow-lg shadow-brand-500/25' 
                : 'bg-slate-900 border border-slate-800 text-slate-500'
            }`}>
              {num}
            </div>
            {num < 3 && (
              <div className={`w-20 md:w-36 h-0.5 mx-2 rounded-full ${
                step > num ? 'bg-brand-500' : 'bg-slate-900'
              }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
                <Sparkles size={20} className="text-brand-450 fill-brand-450/15" />
                <span>Upload Source Material</span>
              </h2>
              <p className="text-xs text-slate-550 mt-1">Upload a PDF containing lecture slides, textbook chapters, or reference sheets.</p>
            </div>

            <FileUpload onFileSelect={handleFileSelect} acceptedTypes={['.pdf']} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 p-6 border border-slate-900 bg-dark-900/40 rounded-2xl"
          >
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Settings size={18} className="text-brand-400" />
                <span>Configure Generation Options</span>
              </h2>
              <p className="text-xs text-slate-550 mt-1">Refine questions count, complexity levels, and format types.</p>
            </div>
            <div>
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
    Chapter Name
  </label>

  <input
    type="text"
    value={chapterTitle}
    onChange={(e) => setChapterTitle(e.target.value)}
    placeholder="Introduction to AI"
    className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200"
  />
</div>

<div>
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
    Subject
  </label>

  <input
    type="text"
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    placeholder="Artificial Intelligence"
    className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200"
  />
</div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Number of Questions</span>
                <span className="text-brand-450 font-bold text-sm">{numQuestions}</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty Tier</label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-3 rounded-xl border font-bold capitalize text-xs transition-all cursor-pointer ${
                      difficulty === diff
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-slate-800 bg-slate-900/10 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
    Question Type
  </label>

  <div className="grid grid-cols-3 gap-3">
    {[
      { label: 'MCQ', value: 'mcq' },
      { label: 'True / False', value: 'true_false' },
      { label: 'Short Answer', value: 'short_answer' },
    ].map((type) => (
      <button
        key={type.value}
        type="button"
        onClick={() => setQuizType(type.value)}
        className={`py-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
          quizType === type.value
            ? 'border-brand-500 bg-brand-500/10 text-brand-300'
            : 'border-slate-800 bg-slate-900/10 text-slate-500 hover:border-slate-700'
        }`}
      >
        {type.label}
      </button>
    ))}
  </div>
</div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-900/60">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Back to Upload
              </button>
             <button
  onClick={handleStartGeneration}
  disabled={!file || !chapterTitle || !subject}
                className="flex items-center space-x-2 px-5 py-3
bg-brand-500 hover:bg-brand-600
disabled:bg-slate-700 disabled:cursor-not-allowed
text-dark-950 font-bold rounded-xl"
              >
                <Play size={14} className="fill-current" />
                <span>Start AI Generation</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 border border-slate-900 bg-dark-900/40 rounded-3xl space-y-8"
          >
            <div className="text-center">
              <h2 className="text-lg font-bold text-white animate-pulse">AI Engine Processing...</h2>
              <p className="text-xs text-slate-550 mt-1">This will take about 5-10 seconds to process through Gemini models.</p>
              
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-6 relative">
                <motion.div
                  className="bg-brand-500 h-full rounded-full"
                  animate={{ width: `${pipelineProgress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {pipelineSteps.map((pStep, index) => {
                const Icon = pStep.icon;
                const isDone = index < currentPipelineStep;
                const isActive = index === currentPipelineStep;

                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border flex items-start space-x-4 transition-all duration-300 ${
                      isActive 
                        ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/25' 
                        : isDone 
                          ? 'border-slate-800 bg-slate-900/10 opacity-70' 
                          : 'border-slate-950 bg-slate-950/20 opacity-40'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive 
                        ? 'bg-brand-500/15 text-brand-400 animate-pulse' 
                        : isDone 
                          ? 'bg-accent-500/10 text-accent-400' 
                          : 'bg-slate-900 text-slate-600'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold flex items-center space-x-2 ${
                        isActive ? 'text-white' : isDone ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <span>{pStep.label}</span>
                        {isDone && <CheckCircle size={12} className="text-accent-400 animate-scale-in" />}
                      </h4>
                      <p className={`text-[10px] mt-1 leading-relaxed ${
                        isActive ? 'text-slate-450' : 'text-slate-600'
                      }`}>
                        {pStep.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

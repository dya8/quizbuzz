import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetQuizzes, usePublishQuiz } from './useQuizQueries';
import { Library, PlusCircle, CheckCircle, ExternalLink, Calendar, Copy, Clock,  Download } from 'lucide-react';
import { Trash2 } from "lucide-react";
import { useDeleteQuiz } from "./useQuizQueries";
import { motion, AnimatePresence } from "framer-motion";



export const TeacherQuizzes = () => {

  const { data: quizzes, isLoading } = useGetQuizzes();


  const publishMutation = usePublishQuiz();
 const [copiedId, setCopiedId] = useState(null);
const [deleteQuizId, setDeleteQuizId] = useState(null);
  const deleteMutation = useDeleteQuiz();



const list = quizzes?.data || [];
  const handleCopyLink = (id) => {
    const link = `${window.location.origin}/student/quiz/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePublish = (quizId, currentStatus) => {
    publishMutation.mutate({ quizId, isPublished: !currentStatus });
  };
  const downloadPDF = async (quizId, title) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/quizzes/${quizId}/pdf`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.pdf`;

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
    

  } catch (err) {
    console.error(err);
    alert("Failed to download PDF.");
  }

};
 const handleDeleteQuiz = (quizId) => {
  setDeleteQuizId(quizId);
};

const confirmDelete = () => {
  deleteMutation.mutate(deleteQuizId);
  setDeleteQuizId(null);
};

const cancelDelete = () => {
  setDeleteQuizId(null);
};

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-900 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(x => <div key={x} className="h-48 bg-slate-900 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Quizzes</h1>
          <p className="text-sm text-slate-400 mt-1">Review drafts, manage active quiz links, and create assessments.</p>
        </div>
        <Link to="/teacher/quiz-builder">
          <button className="flex items-center space-x-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold rounded-xl transition-all shadow-lg shadow-brand-500/15 cursor-pointer">
            <PlusCircle size={18} />
            <span>Create Quiz</span>
          </button>
        </Link>
      </div>

{list.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-800 rounded-3xl bg-dark-900/20">
    <Library size={48} className="text-slate-600 mb-4" />

    <h3 className="text-xl font-bold text-white">
      No quizzes yet
    </h3>

    <p className="text-slate-400 mt-2">
      Create your first quiz to get started.
    </p>

    <Link to="/teacher/quiz-builder">
      <button className="mt-6 flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold rounded-xl">
        <PlusCircle size={18} />
        Create Quiz
      </button>
    </Link>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {list.map((quiz) => (
      <div
        key={quiz._id || quiz.id}
        className="p-6 rounded-2xl bg-dark-900/40 border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between h-56 relative overflow-hidden"
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                quiz.published
                  ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/50'
              }`}
            >
              {quiz.published ? 'Live' : 'Draft'}
            </span>

            <span className="text-[10px] text-slate-500 flex items-center space-x-1 font-semibold">
              <Calendar size={12} />
              <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
            </span>
          </div>

          <h3 className="text-base font-bold text-white mt-4 line-clamp-1">
            {quiz.title}
          </h3>

          <div className="flex items-center space-x-4 mt-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center space-x-1">
              <Library size={14} className="text-slate-550" />
              <span>
                {quiz.totalQuestions || quiz.questionIds?.length || 0} Questions
              </span>
            </span>

            <span className="flex items-center space-x-1">
              <Clock size={14} className="text-slate-550" />
              <span>{quiz.timeLimit} Mins</span>
            </span>
          </div>
        </div>

   <div className="flex items-center justify-between mt-6 border-t border-slate-900/60 pt-4">

  <div className="flex gap-2">

    <button
      onClick={() =>
        handleTogglePublish(quiz._id || quiz.id, quiz.published)
      }
      className={`text-xs font-semibold px-4 py-2 border rounded-xl transition-all cursor-pointer ${
        quiz.published
          ? "border-slate-800 hover:border-slate-700 text-slate-400"
          : "border-brand-500/30 bg-brand-500/5 hover:bg-brand-500/15 text-brand-400"
      }`}
    >
      {quiz.published ? "Unpublish" : "Publish"}
    </button>
     <button
  onClick={() => downloadPDF(quiz._id || quiz.id, quiz.title)}
  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all"
>
  <Download size={14} />
  PDF
</button>
    <button
      onClick={() => handleDeleteQuiz(quiz._id || quiz.id)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
    >
      <Trash2 size={14} />
      Delete
    </button>

  </div>

  {quiz.published && (
    <button
      onClick={() => handleCopyLink(quiz._id || quiz.id)}
      className="text-xs font-semibold px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl flex items-center gap-2"
    >
      <Copy size={13} />
      {copiedId === (quiz._id || quiz.id)
        ? "Copied!"
        : "Copy Link"}
    </button>
  )}

</div>
      </div>
    ))}
  </div>
)}

<AnimatePresence>
  {deleteQuizId && (
    <>
      {/* Blur Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center z-50 px-4"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-dark-900 p-8 shadow-2xl">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="text-red-400" size={30} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center">
            Delete Quiz?
          </h2>

          <p className="text-slate-400 text-center mt-3">
            This action cannot be undone.
            <br />
            Are you sure you want to permanently delete this quiz?
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={cancelDelete}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              onClick={confirmDelete}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
    </div>
  );
};

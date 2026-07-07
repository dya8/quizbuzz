import React from "react";
import { useGetAnalytics } from "../teacher-dashboard/useQuizQueries";
import { CheckCircle, XCircle, Trophy } from "lucide-react";

export const StudentAnalytics = () => {
  const { data, isLoading } = useGetAnalytics("student");

  const analytics = data?.data;

  if (isLoading) {
    return (
      <div className="text-white text-lg">
        Loading...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-slate-400 mt-20">
        No quiz attempted yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Latest Quiz Report
        </h1>

        <p className="text-slate-400 mt-2">
          Review your most recent quiz.
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

        <div className="flex justify-between">

          <div>

            <h2 className="text-xl font-bold text-white">
              {analytics.quizTitle}
            </h2>

            <p className="text-slate-400 mt-2">
              {new Date(
                analytics.submittedAt
              ).toLocaleString()}
            </p>

          </div>

          <div className="text-right">

            <div className="text-5xl font-bold text-brand-400">

              {analytics.score}/{analytics.totalQuestions}

            </div>

            <div className="text-slate-400">

              {analytics.percentage}%

            </div>

            <div
              className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                analytics.passed
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {analytics.passed ? "Passed" : "Failed"}
            </div>

          </div>

        </div>

      </div>

      <div className="space-y-4">

        {analytics.review.map((item, index) => (

          <div
            key={index}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >

            <div className="flex justify-between">

              <h3 className="text-white font-semibold">

                Q{index + 1}. {item.question}

              </h3>

              {item.isCorrect ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-red-500" />
              )}

            </div>

            <div className="mt-5">

              <p className="text-sm text-slate-400">
                Your Answer
              </p>

              <div
                className={`mt-1 rounded-lg p-3 ${
                  item.isCorrect
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {item.selectedAnswer || "Not Answered"}
              </div>

            </div>

            {!item.isCorrect && (

              <div className="mt-4">

                <p className="text-sm text-slate-400">

                  Correct Answer

                </p>

                <div className="mt-1 rounded-lg bg-green-900/30 text-green-400 p-3">

                  {item.correctAnswer}

                </div>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
};
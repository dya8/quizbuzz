import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const QuizTimer = ({ durationSeconds, onExpire, isPaused = false }) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (timeLeft <= 0 && onExpire) {
        onExpire();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isPaused, onExpire]);

  const percentage = (timeLeft / durationSeconds) * 100;
  const radius = 32; // Compact, high-fidelity sizing
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = 'stroke-accent-500';
  let textColor = 'text-accent-400';

  if (percentage <= 25) {
    strokeColor = 'stroke-danger-500 animate-pulse';
    textColor = 'text-danger-400 animate-pulse font-bold';
  } else if (percentage <= 50) {
    strokeColor = 'stroke-warning-500';
    textColor = 'text-warning-400';
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          className="stroke-slate-800"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          className={`${strokeColor} transition-all duration-1000 ease-linear`}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          animate={{ strokeDashoffset }}
        />
      </svg>
      <span className={`absolute text-xs font-semibold tracking-wider ${textColor}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

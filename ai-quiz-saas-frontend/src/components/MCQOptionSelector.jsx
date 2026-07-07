import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export const MCQOptionSelector = ({
  options = [],
  selectedOption = null,
  onSelect = () => {},
  isReviewMode = false,
  correctOption = null,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {options.map((option, idx) => {
        const isSelected = selectedOption === option;
        const isCorrect = correctOption === option;
        
        let cardStyle = 'border-slate-800 bg-dark-900/40 text-slate-350 hover:border-brand-500/30 hover:bg-brand-500/5';
        let badge = null;

        if (isReviewMode) {
          if (isCorrect) {
            cardStyle = 'border-accent-500 bg-accent-500/10 text-accent-300 ring-2 ring-accent-500/20';
            badge = (
              <div className="p-1 bg-accent-500 text-dark-950 rounded-full animate-scale-in">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            );
          } else if (isSelected && !isCorrect) {
            cardStyle = 'border-danger-500 bg-danger-500/10 text-danger-300 ring-2 ring-danger-500/20';
            badge = (
              <div className="p-1 bg-danger-500 text-white rounded-full animate-scale-in">
                <X className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            );
          }
        } else {
          if (isSelected) {
            cardStyle = 'border-brand-500 bg-brand-500/10 text-brand-200 ring-2 ring-brand-500/40 neon-glow-active';
            badge = (
              <div className="h-4 w-4 rounded-full bg-brand-500 flex items-center justify-center text-dark-950 text-[10px] font-bold animate-scale-in">
                ✓
              </div>
            );
          }
        }

        const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

        return (
          <motion.button
            key={idx}
            disabled={disabled || isReviewMode}
            type="button"
            onClick={() => onSelect(option)}
            whileHover={!disabled && !isReviewMode ? { scale: 1.015, y: -2 } : {}}
            whileTap={!disabled && !isReviewMode ? { scale: 0.985 } : {}}
            className={`w-full text-left p-5 border rounded-2xl flex items-center justify-between transition-all duration-200 ${cardStyle} ${
              disabled && !isSelected ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                isSelected 
                  ? 'bg-brand-500 text-dark-950' 
                  : isReviewMode && isCorrect 
                    ? 'bg-accent-500 text-dark-950'
                    : isReviewMode && isSelected && !isCorrect
                      ? 'bg-danger-500 text-white'
                      : 'bg-slate-800/80 text-slate-400'
              }`}>
                {optionLabels[idx] || (idx + 1)}
              </div>
              <span className="font-semibold text-sm md:text-base">{option}</span>
            </div>
            {badge}
          </motion.button>
        );
      })}
    </div>
  );
};

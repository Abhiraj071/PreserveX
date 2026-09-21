import React from 'react';
import { Check } from 'lucide-react';

export default function WizardProgress({ currentStep, setStep, foodSelected, hasRecommendation = false }) {
  const steps = [
    { number: 1, label: "Food Selection", subtitle: "Identify product & properties" },
    { number: 2, label: "Conditions & Logistics", subtitle: "Storage temperature & shelf life" },
    { number: 3, label: "Recommendation", subtitle: "Requirements & materials" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-subtle max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-2 text-xs">
        {steps.map((s) => {
          const isCompleted = currentStep > s.number;
          const isCurrent = currentStep === s.number;
          const canClick = s.number === 1 || (s.number === 2 && foodSelected) || (s.number === 3 && (hasRecommendation || isCompleted));

          return (
            <button
              key={s.number}
              type="button"
              disabled={!canClick}
              onClick={() => canClick && setStep(s.number)}
              className={`p-2.5 rounded-lg text-left transition-colors flex items-center space-x-3 ${
                isCurrent 
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                  : isCompleted 
                  ? 'bg-slate-50 border border-slate-200 text-slate-700' 
                  : 'text-slate-400 border border-transparent'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.number}
              </div>

              <div className="min-w-0">
                <span className={`font-semibold block truncate ${isCurrent ? 'text-emerald-950 font-bold' : isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                  {s.label}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:block truncate">
                  {s.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

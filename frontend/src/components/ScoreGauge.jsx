import React from 'react';
import { Award, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const ScoreGauge = ({ score = 0, size = 180, strokeWidth = 14 }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let strokeColor = '#10b981'; // green
  let bgColor = 'bg-emerald-50';
  let borderColor = 'border-emerald-200';
  let ratingText = 'Strong Match';
  let Icon = CheckCircle2;

  if (normalizedScore < 50) {
    colorClass = 'text-rose-500';
    strokeColor = '#f43f5e';
    bgColor = 'bg-rose-50';
    borderColor = 'border-rose-200';
    ratingText = 'Needs Significant Optimization';
    Icon = XCircle;
  } else if (normalizedScore < 75) {
    colorClass = 'text-amber-500';
    strokeColor = '#f59e0b';
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-200';
    ratingText = 'Moderate Match';
    Icon = AlertTriangle;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score Number inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-slate-800">
            {normalizedScore}
            <span className="text-lg text-slate-400 font-semibold">%</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            ATS Score
          </span>
        </div>
      </div>

      {/* Match Rating Badge */}
      <div className={`mt-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${bgColor} ${borderColor} ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span>{ratingText}</span>
      </div>
    </div>
  );
};

export default ScoreGauge;

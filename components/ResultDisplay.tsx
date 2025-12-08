
import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { InfoIcon } from './icons/InfoIcon';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const FraudScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  
  let colorClass = 'text-green-500';
  if (score > 40) colorClass = 'text-yellow-500';
  if (score > 70) colorClass = 'text-red-500';

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className={`absolute text-3xl font-bold ${colorClass}`}>{score}</div>
    </div>
  );
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
    const verdictConfig = {
        Valid: {
            icon: <CheckCircleIcon className="w-8 h-8 text-green-500" />,
            bgColor: "bg-green-100 dark:bg-green-900/30",
            textColor: "text-green-700 dark:text-green-300",
            title: "Claim Valid"
        },
        Suspicious: {
            icon: <AlertTriangleIcon className="w-8 h-8 text-yellow-500" />,
            bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
            textColor: "text-yellow-700 dark:text-yellow-300",
            title: "Claim Suspicious"
        },
        Invalid: {
            icon: <XCircleIcon className="w-8 h-8 text-red-500" />,
            bgColor: "bg-red-100 dark:bg-red-900/30",
            textColor: "text-red-700 dark:text-red-300",
            title: "Claim Invalid"
        }
    };
    const currentVerdict = verdictConfig[result.finalVerdict];

    const PolicyCheckItem: React.FC<{label: string, value: boolean}> = ({label, value}) => (
        <li className="flex items-center text-sm">
            {value ? <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /> : <XCircleIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />}
            <span className={value ? 'text-slate-600 dark:text-slate-300' : 'text-red-600 dark:text-red-400 font-semibold'}>{label}</span>
        </li>
    );

    return (
        <div className="w-full space-y-6 animate-fade-in">
            <div className={`flex items-center p-4 rounded-lg ${currentVerdict.bgColor}`}>
                {currentVerdict.icon}
                <h2 className={`ml-3 text-2xl font-bold ${currentVerdict.textColor}`}>{currentVerdict.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">FRAUD PROBABILITY</h3>
                    <FraudScoreCircle score={result.fraudScore} />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">ESTIMATED PAYOUT</h3>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{result.estimatedPayout}</p>
                </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Summary</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{result.summary}</p>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-white">Policy Rule Checks</h3>
                <ul className="space-y-2">
                   <PolicyCheckItem label="Policy is active and in good standing" value={result.policyChecks.policyActive} />
                   <PolicyCheckItem label="Incident type is covered by policy" value={result.policyChecks.incidentCovered} />
                   <PolicyCheckItem label="Claim filed within allowed time limit" value={result.policyChecks.timeLimitOk} />
                </ul>
            </div>
        </div>
    );
};

export default ResultDisplay;
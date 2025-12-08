
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Analyzing Documents...</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">The AI agents are at work. This may take a moment.</p>
    </div>
  );
};

export default Loader;

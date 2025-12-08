
import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-md sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-xl md:text-2xl font-bold ml-3 text-slate-800 dark:text-white">
          AI Insurance Claim Validator
        </h1>
      </div>
    </header>
  );
};

export default Header;

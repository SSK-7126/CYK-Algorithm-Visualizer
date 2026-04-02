import React from 'react';
import { BrainCircuit, Info } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-8 px-4 border-b border-white/10 bg-surface/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <BrainCircuit className="w-8 h-8 text-primary animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-300 to-slate-500">
              CYK Algorithm Visualizer
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Theory of Computation & Context-Free Languages
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-xs text-slate-300">
            A membership algorithm for CFLs using Dynamic Programming.
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { ArrowRight, FileCheck, Layers, RefreshCw } from 'lucide-react';

const CNFTransformationView = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-5 h-5 text-secondary" />
        <h2 className="text-xl font-bold">CNF Conversion Module</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="group relative p-4 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all hover:border-secondary/30"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] uppercase font-bold rounded tracking-widest">
                {step.title}
              </span>
              <div className="text-slate-600 group-hover:text-secondary/50 transition-colors">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 h-12 line-clamp-3">
              {step.explanation}
            </p>

            <div className="space-y-1 font-mono text-xs bg-black/20 p-3 rounded-lg border border-white/5 overflow-auto max-h-48 scrollbar-thin">
              {Object.keys(step.grammar.rules).map(lhs => (
                <div key={lhs} className="flex gap-2">
                  <span className="text-primary font-bold">{lhs}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300">
                    {step.grammar.rules[lhs].join(' | ')}
                  </span>
                </div>
              ))}
            </div>

            {index < steps.length - 1 && (
              <div className="hidden xl:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 bg-background border border-white/10 rounded-full">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CNFTransformationView;

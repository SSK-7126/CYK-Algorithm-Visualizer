import React from 'react';
import { 
  BarChart3, 
  FastForward, 
  Pause, 
  Play, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Zap 
} from 'lucide-react';

const Controls = ({ 
  currentStepIndex, 
  totalSteps, 
  isPlaying, 
  onTogglePlay, 
  onNext, 
  onPrev, 
  onReset,
  onStepChange,
  currentStep
}) => {
  const progress = (currentStepIndex / (totalSteps - 1)) * 100;

  return (
    <div className="glass-panel p-6 space-y-6 sticky bottom-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Step Explanation */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Step Explanation</h3>
          </div>
          <p className="text-slate-300 font-medium md:max-w-xl">
            {currentStep?.explanation || "Ready to start the CYK parsing process."}
          </p>
          {currentStep?.added && currentStep.added.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Added:</span>
              {currentStep.added.map((item, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded text-[10px] font-bold">
                  {item.lhs} → {item.rhs}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onReset}
              className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button 
              onClick={onPrev}
              disabled={currentStepIndex === 0}
              className="p-3 disabled:opacity-30 disabled:pointer-events-none text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={onTogglePlay}
              className="p-5 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6 translate-x-0.5" />}
            </button>
            <button 
              onClick={onNext}
              disabled={currentStepIndex === totalSteps - 1}
              className="p-3 disabled:opacity-30 disabled:pointer-events-none text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onStepChange(totalSteps - 1)}
              className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <FastForward className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-full max-w-[200px] flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Step {currentStepIndex + 1}</span>
            <span>of {totalSteps}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer group"
           onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const percentage = x / rect.width;
             onStepChange(Math.floor(percentage * totalSteps));
           }}>
        <div 
          className="absolute h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
        <div className="absolute h-full w-full opacity-0 group-hover:opacity-100 bg-white/5 transition-opacity" />
      </div>
    </div>
  );
};

export default Controls;

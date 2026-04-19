import React from 'react';
import { FastForward, Pause, Play, RotateCcw, SkipBack, SkipForward, Sparkles } from 'lucide-react';

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
  const safeTotal = Math.max(totalSteps, 1);
  const progress = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="controls-rig">
      <div className="controls-rig__status">
        <div className="signal-pill signal-pill--mint">
          <Sparkles className="w-4 h-4" />
          Live explanation
        </div>
        <p className="text-sm leading-7 text-[color:var(--text-muted)]">
          {currentStep?.explanation || "Ready to start the CYK parsing process."}
        </p>
      </div>

      {currentStep?.added && currentStep.added.length > 0 && (
        <div className="added-panel">
          {currentStep.added.map((item, idx) => (
            <span key={`${item.lhs}-${item.rhs}-${idx}`} className="matrix-token">
              {item.lhs} → {item.rhs}
            </span>
          ))}
        </div>
      )}

      <div className="transport-row">
        <button type="button" onClick={onReset} className="transport-button" title="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onPrev}
          disabled={currentStepIndex === 0}
          className="transport-button"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button type="button" onClick={onTogglePlay} className="transport-button transport-button--primary">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-[1px]" />}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentStepIndex === totalSteps - 1}
          className="transport-button"
        >
          <SkipForward className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onStepChange(totalSteps - 1)} className="transport-button">
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      <div className="progress-meta">
        <span>Step {Math.min(currentStepIndex + 1, safeTotal)}</span>
        <span>{safeTotal} total</span>
      </div>

      <div
        className="timeline-bar"
        onClick={(e) => {
          if (totalSteps <= 1) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          onStepChange(Math.min(totalSteps - 1, Math.floor(percentage * totalSteps)));
        }}
      >
        <div className="timeline-bar__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default Controls;

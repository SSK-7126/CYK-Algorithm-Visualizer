import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Binary, Orbit, ScanSearch, Sparkles } from 'lucide-react';
import Header from './components/Header';
import GrammarInput from './components/GrammarInput';
import CNFTransformationView from './components/CNFTransformationView';
import CYKTable from './components/CYKTable';
import Controls from './components/Controls';
import { parseGrammar, convertToCNF } from './utils/grammarLogic';
import { runCYK } from './utils/cykLogic';

const App = () => {
  const [grammar, setGrammar] = useState(null);
  const [testString, setTestString] = useState("");
  const [cnfResult, setCnfResult] = useState(null);
  const [cykResult, setCykResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);

  const startVisualization = (grammarText, str) => {
    try {
      const parsed = parseGrammar(grammarText);
      const cnf = convertToCNF(parsed);
      const cyk = runCYK(cnf.final, str);

      setGrammar(parsed);
      setTestString(str);
      setCnfResult(cnf);
      setCykResult(cyk);
      setCurrentStepIndex(0);
      setIsVisualizing(true);
      setIsPlaying(false);

      setTimeout(() => {
        const element = document.getElementById('analysis-grid');
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (err) {
      console.error(err);
      alert("Error processing grammar. Please check the format.");
    }
  };

  const nextStep = useCallback(() => {
    if (cykResult && currentStepIndex < cykResult.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [cykResult, currentStepIndex]);

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const resetSteps = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const jumpToStep = (index) => {
    setCurrentStepIndex(Math.max(0, Math.min(index, cykResult.steps.length - 1)));
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        nextStep();
      }, 800);
    }
    return () => clearInterval(timer);
  }, [isPlaying, nextStep]);

  const insightCards = [
    { label: 'Grammar Rules', value: grammar ? Object.keys(grammar.rules).length : '00', icon: Binary, className: 'metric-card metric-card--blue' },
    { label: 'CNF Stages', value: cnfResult?.steps?.length ?? '04', icon: Orbit, className: 'metric-card metric-card--mint' },
    { label: 'CYK Steps', value: cykResult?.steps?.length ?? '00', icon: ScanSearch, className: 'metric-card metric-card--peach' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden text-[color:var(--text-primary)]">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="grid-fade" />

      <Header />

      <main className="relative z-10 max-w-[1500px] mx-auto px-4 md:px-8 pb-20">
        <section className="pt-28 md:pt-36">
          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="signal-pill signal-pill--soft">
                <Sparkles className="w-4 h-4" />
                CYK studio
              </div>

              <div className="space-y-4 max-w-3xl">
                <h1 className="display-title">
                  Clean, bright grammar analysis with a friendlier visual flow.
                </h1>
                <p className="text-lg md:text-xl text-[color:var(--text-muted)] leading-8 max-w-2xl">
                  A light, editorial-style interface for entering grammars, reviewing CNF transformations,
                  and stepping through every CYK merge without the heavy repeated-card look.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {insightCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.label}
                      whileHover={{ y: -5 }}
                      className={card.className}
                    >
                      <div className="metric-card__header">
                        <p>{card.label}</p>
                        <div className="icon-orb">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="metric-card__value">{card.value}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.05 }}
              className="hero-panel"
            >
              <div className="hero-panel__mesh" />
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--secondary)]">
                      Studio brief
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">Visualization mission</h2>
                  </div>
                  <div className="status-dot" />
                </div>

                <div className="space-y-4 text-sm leading-7 text-[color:var(--text-muted)]">
                  <p>
                    Build a grammar, test strings including epsilon, and inspect the triangular table
                    with more whitespace, clearer contrast, and softer motion.
                  </p>
                  <p>
                    Each panel now has its own visual identity so the workspace feels designed rather than cloned.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="mini-stat mini-stat--rose">
                    <span>Input mode</span>
                    <strong>Quick symbols</strong>
                  </div>
                  <div className="mini-stat mini-stat--blue">
                    <span>Playback</span>
                    <strong>Guided timeline</strong>
                  </div>
                  <div className="mini-stat mini-stat--mint">
                    <span>Empty string</span>
                    <strong>ε aware</strong>
                  </div>
                  <div className="mini-stat mini-stat--gold">
                    <span>Layout</span>
                    <strong>Responsive grid</strong>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>

        <section id="input-zone" className="pt-10">
          <GrammarInput onVisualize={startVisualization} />
        </section>

        <AnimatePresence>
          {isVisualizing && (
            <motion.section
              id="analysis-grid"
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.55 }}
              className="pt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="space-y-8">
                <section id="cnf-zone" className="surface-shell surface-shell--paper">
                  <div className="section-heading">
                    <span>Transformation stream</span>
                    <h2>CNF Conversion Atlas</h2>
                  </div>
                  <CNFTransformationView steps={cnfResult?.steps} />
                </section>
              </div>

              <div className="space-y-8">
                <section id="controls-zone" className="surface-shell surface-shell--tint sticky-panel">
                  <div className="section-heading">
                    <span>Playback rig</span>
                    <h2>Step Navigator</h2>
                  </div>
                  <Controls
                    currentStepIndex={currentStepIndex}
                    totalSteps={cykResult?.steps.length || 0}
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onReset={resetSteps}
                    onStepChange={jumpToStep}
                    currentStep={cykResult?.steps[currentStepIndex]}
                  />
                </section>

                <section className={`result-shell ${cykResult?.accepted ? 'result-shell--accept' : 'result-shell--reject'}`}>
                  <div className="section-heading">
                    <span>Decision output</span>
                    <h2>{cykResult?.accepted ? 'String accepted' : 'String rejected'}</h2>
                  </div>
                  <p className="text-base leading-7 text-[color:var(--text-muted)]">
                    {cykResult?.steps[currentStepIndex]?.explanation || cykResult?.explanation}
                  </p>
                </section>

                <section id="table-zone" className="surface-shell surface-shell--sky">
                  <div className="section-heading">
                    <span>Table analysis</span>
                    <h2>CYK Matrix Observatory</h2>
                  </div>
                  <CYKTable
                    string={testString}
                    table={cykResult?.table}
                    currentStep={cykResult?.steps[currentStepIndex]}
                  />
                </section>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;

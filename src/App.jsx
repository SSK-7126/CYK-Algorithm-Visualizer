import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GrammarInput from './components/GrammarInput';
import CNFTransformationView from './components/CNFTransformationView';
import CYKTable from './components/CYKTable';
import Controls from './components/Controls';
import { parseGrammar, convertToCNF } from './utils/grammarLogic';
import { runCYK } from './utils/cykLogic';
import { motion, AnimatePresence } from 'framer-motion';

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
      
      // Smooth scroll to results
      setTimeout(() => {
        const element = document.getElementById('visualization-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
      }, 800); // 800ms speed
    }
    return () => clearInterval(timer);
  }, [isPlaying, nextStep]);

  return (
    <div className="min-h-screen pb-20 selection:bg-primary/30 selection:text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <section>
          <GrammarInput onVisualize={startVisualization} />
        </section>

        <AnimatePresence>
          {isVisualizing && (
            <motion.div
              id="visualization-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              {/* CNF Conversion Panel */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-white/10 flex-1" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Step 1: CNF Conversion</h2>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
                <CNFTransformationView steps={cnfResult?.steps} />
              </section>

              {/* CYK Algorithm Panel */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-white/10 flex-1" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Step 2: CYK Table Filling</h2>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
                
                <CYKTable 
                  string={testString} 
                  table={cykResult?.table} 
                  currentStep={cykResult?.steps[currentStepIndex]} 
                />

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

              {/* Final Result Notification */}
              {currentStepIndex === (cykResult?.steps.length - 1) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-8 rounded-2xl border-2 text-center space-y-4 shadow-2xl transition-all ${
                    cykResult?.accepted 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-rose-500/10 border-rose-500/30'
                  }`}
                >
                  <div className={`text-4xl font-black uppercase tracking-widest ${
                    cykResult?.accepted ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {cykResult?.accepted ? 'Result: Accepted' : 'Result: Rejected'}
                  </div>
                  <p className="text-slate-400 font-medium">
                    {cykResult?.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { PencilLine, PlayCircle, PlusCircle, Quote } from 'lucide-react';

const EXAMPLES = [
  {
    name: "Standard CFG",
    grammar: "S -> AB | BC\nA -> BA | a\nB -> CC | b\nC -> AB | a",
    string: "baaba"
  },
  {
    name: "Simple Arithmetic",
    grammar: "E -> E T | a\nT -> + E | * E",
    string: "a+a*a"
  },
  {
    name: "Balanced Brackets",
    grammar: "S -> S S | ( S ) | ε",
    string: "(())()"
  }
];

const GrammarInput = ({ onVisualize }) => {
  const [grammarText, setGrammarText] = useState(EXAMPLES[0].grammar);
  const [testString, setTestString] = useState(EXAMPLES[0].string);
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!grammarText.trim() || !testString.trim()) {
      setError("Please provide both grammar and a test string.");
      return;
    }
    setError("");
    onVisualize(grammarText, testString);
  };

  const loadExample = (ex) => {
    setGrammarText(ex.grammar);
    setTestString(ex.string);
    setError("");
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <PencilLine className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Input Grammar & String</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Context-Free Grammar (CFG)
          </label>
          <textarea
            className="w-full h-48 bg-slate-900/50 border border-slate-800 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
            placeholder="S -> AB | BC&#10;A -> BA | a"
            value={grammarText}
            onChange={(e) => setGrammarText(e.target.value)}
          />
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Test String
            </label>
            <input
              type="text"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              placeholder="e.g., baaba"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Preloaded Examples
            </label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => loadExample(ex)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/30 transition-all"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full group mt-auto bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Visualization
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default GrammarInput;

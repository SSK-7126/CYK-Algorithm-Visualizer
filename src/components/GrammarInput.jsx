import React, { useRef, useState } from 'react';
import { ArrowRightLeft, PlayCircle, Sparkles, Type } from 'lucide-react';

const EPSILON = 'ε';

const EXAMPLES = [
  {
    name: "Classic CFG",
    grammar: "S -> AB | BC\nA -> BA | a\nB -> CC | b\nC -> AB | a",
    string: "baaba"
  },
  {
    name: "Arithmetic",
    grammar: "E -> ET | a\nT -> +E | *E",
    string: "a+a*a"
  },
  {
    name: "Balanced",
    grammar: "S -> SS | (S) | ε",
    string: "(())()"
  }
];

const GRAMMAR_KEYS = ['ε', '->', '|', '(', ')'];
const STRING_KEYS = ['(', ')'];

const GrammarInput = ({ onVisualize }) => {
  const [grammarText, setGrammarText] = useState(EXAMPLES[0].grammar);
  const [testString, setTestString] = useState(EXAMPLES[0].string);
  const [error, setError] = useState("");
  const grammarRef = useRef(null);
  const stringRef = useRef(null);

  const handleStart = () => {
    if (!grammarText.trim()) {
      setError("Please provide a grammar.");
      return;
    }
    setError("");
    onVisualize(grammarText, testString);
  };

  const loadExample = (example) => {
    setGrammarText(example.grammar);
    setTestString(example.string);
    setError("");
  };

  const insertTextAtCursor = (ref, value, setter, padWithSpaces = false) => {
    const element = ref.current;
    const insertion = padWithSpaces ? ` ${value} ` : value;

    if (!element) {
      setter(prev => prev + insertion);
      return;
    }

    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? start;
    const nextValue = `${element.value.slice(0, start)}${insertion}${element.value.slice(end)}`;

    setter(nextValue);

    requestAnimationFrame(() => {
      const cursor = start + insertion.length;
      element.focus();
      element.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <section className="input-stage">
      <div className="input-stage__intro">
        <div className="signal-pill signal-pill--peach">
          <Sparkles className="w-4 h-4" />
          Parser input deck
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Compose the grammar and launch the scan.</h2>
          <p className="text-[color:var(--text-muted)] leading-7 max-w-xl">
            The workspace below is optimized for rapid symbol entry, epsilon testing, and reusable sample grammars.
          </p>
        </div>

        <div className="example-rail">
          {EXAMPLES.map((example, index) => (
            <button
              key={example.name}
              type="button"
              onClick={() => loadExample(example)}
              className={`example-chip example-chip--${index % 3}`}
            >
              <span>{example.name}</span>
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="input-stage__grid">
        <article className="panel-card panel-card--editor panel-card--large">
          <div className="panel-card__header">
            <div>
              <p className="eyebrow">Grammar Canvas</p>
              <h3>Context-Free Grammar</h3>
            </div>
            <Type className="w-5 h-5 text-[color:var(--secondary)]" />
          </div>

          <textarea
            ref={grammarRef}
            className="command-surface command-surface--tall"
            placeholder="S -> AB | BC&#10;A -> BA | a"
            value={grammarText}
            onChange={(e) => setGrammarText(e.target.value)}
          />

          <div className="token-rail">
            {GRAMMAR_KEYS.map((token) => (
              <button
                key={token}
                type="button"
                className="token-chip token-chip--cool"
                onClick={() => insertTextAtCursor(grammarRef, token, setGrammarText, token !== 'ε' && token.length > 1)}
              >
                {token}
              </button>
            ))}
          </div>
        </article>

        <article className="panel-stack">
          <div className="panel-card panel-card--string">
            <div className="panel-card__header">
              <div>
                <p className="eyebrow">String Probe</p>
                <h3>Test String</h3>
              </div>
              <span className="panel-badge">ε-ready</span>
            </div>

            <input
              ref={stringRef}
              type="text"
              className="command-surface command-surface--compact"
              placeholder={`Leave empty for ${EPSILON}`}
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
            />

            <div className="token-rail">
              <button type="button" className="token-chip token-chip--warm" onClick={() => setTestString('')}>
                Insert {EPSILON}
              </button>
              {STRING_KEYS.map((token) => (
                <button
                  key={token}
                  type="button"
                  className="token-chip token-chip--warm"
                  onClick={() => insertTextAtCursor(stringRef, token, setTestString)}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-card panel-card--launch">
            <div className="panel-card__header">
              <div>
                <p className="eyebrow">Launch</p>
                <h3>Run Visualization</h3>
              </div>
            </div>

            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              Start the parser to generate CNF stages and the full CYK matrix timeline.
            </p>

            <button onClick={handleStart} className="launch-button">
              <PlayCircle className="w-5 h-5" />
              Start Visualization
            </button>

            {error && <div className="error-banner">{error}</div>}
          </div>
        </article>
      </div>
    </section>
  );
};

export default GrammarInput;

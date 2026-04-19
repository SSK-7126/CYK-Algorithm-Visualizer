/**
 * Utility for parsing and converting CFG to CNF
 */

const EPSILON_SYMBOL = 'ε';
const EPSILON_ALIASES = new Set(['', 'ε', 'Îµ', 'ÃŽÂµ', 'epsilon', 'eps', 'epsion']);

function isEpsilonProduction(rhs) {
  if (typeof rhs !== 'string') return false;
  return EPSILON_ALIASES.has(rhs.toLowerCase());
}

function normalizeProduction(rhs) {
  const compact = rhs.replace(/\s+/g, '');
  return isEpsilonProduction(compact) ? EPSILON_SYMBOL : compact;
}

export const parseGrammar = (text) => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  const rules = {};
  let start = null;

  lines.forEach((line, index) => {
    const parts = line.split('->').map(p => p.trim());
    if (parts.length !== 2) return;

    const lhs = parts[0];
    const rhsList = parts[1]
      .split('|')
      .map(r => normalizeProduction(r.trim()))
      .filter(Boolean);

    if (index === 0) start = lhs;
    rules[lhs] = [...(rules[lhs] || []), ...rhsList];
  });

  return { start, rules };
};

export const convertToCNF = (originalGrammar) => {
  const steps = [];
  const acceptsEmpty = canGenerateEmpty(originalGrammar);

  // Step 0: Clone initial
  let currentGrammar = JSON.parse(JSON.stringify(originalGrammar));
  steps.push({
    title: "Original Grammar",
    grammar: JSON.parse(JSON.stringify(currentGrammar)),
    explanation: "Starting point for transformation."
  });

  // Step 1: Eliminate Epsilon
  currentGrammar = removeEpsilon(currentGrammar);
  steps.push({
    title: "Step 1: Eliminate Epsilon",
    grammar: JSON.parse(JSON.stringify(currentGrammar)),
    explanation: "Removing rules like A -> ε and replacing them in other rules."
  });

  // Step 2: Eliminate Unit Productions
  currentGrammar = removeUnit(currentGrammar);
  steps.push({
    title: "Step 2: Eliminate Unit Productions",
    grammar: JSON.parse(JSON.stringify(currentGrammar)),
    explanation: "Removing rules like A -> B by substituting B's productions."
  });

  // Step 3: Eliminate Useless Symbols
  currentGrammar = removeUseless(currentGrammar);
  steps.push({
    title: "Step 3: Eliminate Useless Symbols",
    grammar: JSON.parse(JSON.stringify(currentGrammar)),
    explanation: "Removing non-generating and non-reachable symbols."
  });

  // Step 4: Convert to CNF (A -> BC or A -> a)
  currentGrammar = finalizeCNF(currentGrammar);
  steps.push({
    title: "Step 4: CNF Standardization",
    grammar: JSON.parse(JSON.stringify(currentGrammar)),
    explanation: "Ensuring all rules are of the form A -> BC or A -> a."
  });

  return { final: { ...currentGrammar, acceptsEmpty }, steps };
};

function canGenerateEmpty(g) {
  const nullable = new Set();
  let changed = true;

  while (changed) {
    changed = false;
    Object.keys(g.rules).forEach(lhs => {
      if (nullable.has(lhs)) return;

      const hasNullableProduction = g.rules[lhs].some(rhs => {
        if (isEpsilonProduction(rhs)) return true;
        return rhs.split('').every(symbol => nullable.has(symbol));
      });

      if (hasNullableProduction) {
        nullable.add(lhs);
        changed = true;
      }
    });
  }

  return nullable.has(g.start);
}

function removeEpsilon(g) {
  const nullable = new Set();
  const rules = { ...g.rules };

  // Pass 1: Find initially nullable
  Object.keys(rules).forEach(lhs => {
    if (rules[lhs].some(isEpsilonProduction)) {
      nullable.add(lhs);
      rules[lhs] = rules[lhs].filter(rhs => !isEpsilonProduction(rhs));
    }
  });

  // Pass 2: Iteratively find nullable
  let changed = true;
  while (changed) {
    changed = false;
    Object.keys(rules).forEach(lhs => {
      rules[lhs].forEach(rhs => {
        if (!nullable.has(lhs) && rhs.split('').every(char => nullable.has(char))) {
          nullable.add(lhs);
          changed = true;
        }
      });
    });
  }

  // Pass 3: Modify rules
  Object.keys(rules).forEach(lhs => {
    let newRhs = [];
    rules[lhs].forEach(rhs => {
      newRhs.push(rhs);
      if (rhs.length > 0) {
        // Generate combinations for nullable symbols
        const chars = rhs.split('');
        const combinations = (idx) => {
          if (idx === chars.length) return [""];
          const tails = combinations(idx + 1);
          const head = chars[idx];
          const res = [];
          tails.forEach(t => {
            res.push(head + t);
            if (nullable.has(head)) res.push(t);
          });
          return res;
        };
        newRhs.push(...combinations(0));
      }
    });
    // Cleanup: remove duplicates and empty/epsilon unless it's the start symbol logic
    // (simplified for this app)
    rules[lhs] = [...new Set(newRhs)].filter(r => !isEpsilonProduction(r));
  });

  return { ...g, rules };
}

function removeUnit(g) {
  const rules = { ...g.rules };
  let changed = true;

  while (changed) {
    changed = false;
    Object.keys(rules).forEach(A => {
      const newRhs = [];
      rules[A].forEach(rhs => {
        if (rhs.length === 1 && rules[rhs] && rhs !== A) {
          // A -> B where B is a variable
          rules[rhs].forEach(bProd => {
            if (!rules[A].includes(bProd)) {
              newRhs.push(bProd);
              changed = true;
            }
          });
        } else {
          newRhs.push(rhs);
        }
      });
      rules[A] = [...new Set([...rules[A], ...newRhs])].filter(r => !(r.length === 1 && rules[r]));
    });
  }
  return { ...g, rules };
}

function removeUseless(g) {
  let rules = { ...g.rules };

  // 1. Generating symbols
  const generating = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    Object.keys(rules).forEach(lhs => {
      rules[lhs].forEach(rhs => {
        const isGenerating = rhs.split('').every(c => !rules[c] || generating.has(c));
        if (isGenerating && !generating.has(lhs)) {
          generating.add(lhs);
          changed = true;
        }
      });
    });
  }

  // Filter non-generating
  Object.keys(rules).forEach(lhs => {
    if (!generating.has(lhs)) delete rules[lhs];
    else {
      rules[lhs] = rules[lhs].filter(rhs => rhs.split('').every(c => !rules[c] || generating.has(c)));
    }
  });

  // 2. Reachable symbols
  const reachable = new Set([g.start]);
  const queue = [g.start];
  while (queue.length > 0) {
    const sym = queue.shift();
    if (rules[sym]) {
      rules[sym].forEach(rhs => {
        rhs.split('').forEach(c => {
          if (rules[c] && !reachable.has(c)) {
            reachable.add(c);
            queue.push(c);
          }
        });
      });
    }
  }

  // Filter unreachable
  Object.keys(rules).forEach(lhs => {
    if (!reachable.has(lhs)) delete rules[lhs];
  });

  return { ...g, rules };
}

function finalizeCNF(g) {
  let rules = { ...g.rules };
  const terminals = {};
  let varCount = 0;

  let rulesArr = {};
  Object.keys(rules).forEach(lhs => {
    rulesArr[lhs] = rules[lhs].map(rhs => {
      if (rhs.length > 1) {
        return rhs.split('').map(c => {
          if (!g.rules[c]) {
            if (!terminals[c]) {
              let newVar = `T${c.toUpperCase()}`;
              while (g.rules[newVar] || rulesArr[newVar]) {
                newVar += "1";
              }
              terminals[c] = newVar;
              rulesArr[newVar] = [[c]];
            }
            return terminals[c];
          }
          return c;
        });
      }
      return [rhs];
    });
  });

  let done = false;
  while (!done) {
    done = true;
    const currentVars = Object.keys(rulesArr);
    currentVars.forEach(lhs => {
      rulesArr[lhs] = rulesArr[lhs].map(rhsArr => {
        if (rhsArr.length > 2) {
          done = false;
          const first = rhsArr[0];
          const rest = rhsArr.slice(1);
          let newVar = `X${varCount++}`;
          while (g.rules[newVar] || rulesArr[newVar]) {
            newVar = `X${varCount++}`;
          }
          rulesArr[newVar] = [rest];
          return [first, newVar];
        }
        return rhsArr;
      });
    });
  }

  const finalRules = {};
  Object.keys(rulesArr).forEach(lhs => {
    finalRules[lhs] = rulesArr[lhs].map(arr => arr.join(''));
  });

  return { ...g, rules: finalRules };
}

/**
 * Utility for parsing and converting CFG to CNF
 */

export const parseGrammar = (text) => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  const rules = {};
  let start = null;

  lines.forEach((line, index) => {
    const parts = line.split('->').map(p => p.trim());
    if (parts.length !== 2) return;

    const lhs = parts[0];
    const rhsList = parts[1].split('|').map(r => r.trim());

    if (index === 0) start = lhs;
    rules[lhs] = [...(rules[lhs] || []), ...rhsList];
  });

  return { start, rules };
};

export const convertToCNF = (originalGrammar) => {
  const steps = [];
  
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

  return { final: currentGrammar, steps };
};

function removeEpsilon(g) {
  const nullable = new Set();
  const rules = { ...g.rules };

  // Pass 1: Find initially nullable
  Object.keys(rules).forEach(lhs => {
    if (rules[lhs].includes('ε') || rules[lhs].includes('')) {
      nullable.add(lhs);
      rules[lhs] = rules[lhs].filter(r => r !== 'ε' && r !== '');
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
    rules[lhs] = [...new Set(newRhs)].filter(r => r !== '');
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

  // 1. Handle terminals in mixed rules or long rules
  Object.keys(rules).forEach(lhs => {
    rules[lhs] = rules[lhs].map(rhs => {
      if (rhs.length > 1) {
        return rhs.split('').map(c => {
          if (!rules[c]) { // it's a terminal
            if (!terminals[c]) {
              const newVar = `T${c.toUpperCase()}`;
              terminals[c] = newVar;
              rules[newVar] = [c];
            }
            return terminals[c];
          }
          return c;
        }).join('');
      }
      return rhs;
    });
  });

  // 2. Break down long rules A -> BCD into A -> BX, X -> CD
  let cnfRules = { ...rules };
  let done = false;
  while (!done) {
    done = true;
    const currentVars = Object.keys(cnfRules);
    currentVars.forEach(lhs => {
      cnfRules[lhs] = cnfRules[lhs].map(rhs => {
        if (rhs.length > 2) {
          done = false;
          const first = rhs[0];
          const rest = rhs.substring(1);
          const newVar = `X${varCount++}`;
          cnfRules[newVar] = [rest];
          return first + newVar;
        }
        return rhs;
      });
    });
  }

  return { ...g, rules: cnfRules };
}

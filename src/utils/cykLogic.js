/**
 * CYK Algorithm Implementation with Step Recording
 */

export const runCYK = (grammar, inputString) => {
  const n = inputString.length;
  const table = Array.from({ length: n + 1 }, () => 
    Array.from({ length: n + 1 }, () => new Set())
  );
  const steps = [];

  // Step 1: Initialization (Base Row - Length 1)
  for (let i = 1; i <= n; i++) {
    const char = inputString[i - 1];
    const vars = new Set();
    
    Object.keys(grammar.rules).forEach(lhs => {
      if (grammar.rules[lhs].includes(char)) {
        vars.add(lhs);
      }
    });
    
    table[1][i] = vars;
    steps.push({
      type: 'BASE',
      row: 1,
      col: i,
      char: char,
      vars: Array.from(vars),
      explanation: `Filling base row for character '${char}' at position ${i}. Variables {${Array.from(vars).join(', ')}} generate '${char}'.`
    });
  }

  // Step 2: Filling Table (Length 2 to n)
  for (let l = 2; l <= n; l++) { // Length
    for (let i = 1; i <= n - l + 1; i++) { // Start position
      for (let k = 1; k <= l - 1; k++) { // Partition
        const leftRow = k;
        const leftCol = i;
        const rightRow = l - k;
        const rightCol = i + k;

        const leftSet = table[leftRow][leftCol];
        const rightSet = table[rightRow][rightCol];

        const addedInThisStep = [];

        leftSet.forEach(B => {
          rightSet.forEach(C => {
            const combined = B + C;
            Object.keys(grammar.rules).forEach(A => {
              if (grammar.rules[A].includes(combined)) {
                if (!table[l][i].has(A)) {
                  table[l][i].add(A);
                  addedInThisStep.push({ lhs: A, rhs: combined });
                }
              }
            });
          });
        });

        steps.push({
          type: 'COMBINE',
          row: l,
          col: i,
          k: k,
          left: { row: leftRow, col: leftCol },
          right: { row: rightRow, col: rightCol },
          added: addedInThisStep,
          currentCellVars: Array.from(table[l][i]),
          explanation: `Combining T[${leftRow},${leftCol}] ({${Array.from(leftSet).join(', ')}}) and T[${rightRow},${rightCol}] ({${Array.from(rightSet).join(', ')}}).`
        });
      }
    }
  }

  const isAccepted = table[n][1].has(grammar.start);
  
  steps.push({
    type: 'FINAL',
    accepted: isAccepted,
    startSymbol: grammar.start,
    explanation: isAccepted 
      ? `Start symbol '${grammar.start}' found in T[${n},1]. String ACCEPTED!` 
      : `Start symbol '${grammar.start}' not found in T[${n},1]. String REJECTED.`
  });

  return { table, steps, accepted: isAccepted };
};

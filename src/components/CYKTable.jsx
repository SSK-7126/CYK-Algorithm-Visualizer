import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CYKTable = ({ string, table, currentStep }) => {
  if (!table || table.length === 0) return null;

  const n = string.length;
  const rows = [];
  
  // Construct triangular display rows
  // In our logic: table[len][start]
  // Row 1 (base): len = 1, start = 1..n
  // Row n (top): len = n, start = 1
  for (let l = 1; l <= n; l++) {
    const rowCells = [];
    for (let i = 1; i <= n - l + 1; i++) {
      rowCells.push({ len: l, pos: i });
    }
    rows.push(rowCells);
  }

  // Determine cell state based on current step
  const getCellState = (len, pos) => {
    if (!currentStep) return 'normal';
    
    // If it's a final step, we just show the result
    if (currentStep.type === 'FINAL') return 'normal';

    // If it's the cell currently being filled
    if (currentStep.row === len && currentStep.col === pos) return 'active';

    // If it's one of the source cells
    if (currentStep.type === 'COMBINE') {
      if (currentStep.left.row === len && currentStep.left.col === pos) return 'source';
      if (currentStep.right.row === len && currentStep.right.col === pos) return 'source';
    }

    // If the cell was already filled in previous steps
    // (This is a simplified check for visualization)
    if (len < currentStep.row || (len === currentStep.row && pos < currentStep.col)) return 'completed';

    return 'normal';
  };

  return (
    <div className="glass-panel p-8 overflow-x-auto min-h-[600px] flex flex-col items-center justify-center">
      <div className="mb-12 flex gap-4">
        {string.split('').map((char, i) => (
          <div key={i} className="w-16 sm:w-20 text-center font-bold text-lg text-primary/80 border-b-2 border-primary/20 pb-2">
            {char}
            <span className="block text-[10px] text-slate-500 mt-1 uppercase font-semibold">idx {i + 1}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 justify-center">
            {row.map((cell, cellIndex) => {
              const state = getCellState(cell.len, cell.pos);
              const vars = Array.from(table[cell.len][cell.pos]);
              
              return (
                <motion.div
                  key={`${cell.len}-${cell.pos}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: state === 'active' ? -5 : 0
                  }}
                  className={`
                    table-cell
                    ${state === 'active' ? 'active' : ''}
                    ${state === 'source' ? 'source border-accent border-2 bg-accent/10 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : ''}
                    ${state === 'completed' && vars.length > 0 ? 'completed border-secondary border-2' : ''}
                  `}
                >
                  <div className="absolute top-1 left-1.5 text-[8px] text-slate-500 font-bold uppercase">
                    T[{cell.len},{cell.pos}]
                  </div>

                  <AnimatePresence mode="popLayout">
                    <div className="flex flex-wrap gap-1 items-center justify-center p-2">
                      {vars.map((v) => (
                        <motion.span
                          key={v}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="px-1.5 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded text-[10px] font-bold"
                        >
                          {v}
                        </motion.span>
                      ))}
                      {vars.length === 0 && (
                        <span className="text-slate-700 font-bold">∅</span>
                      )}
                    </div>
                  </AnimatePresence>

                  {state === 'active' && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute inset-0 rounded-lg ring-4 ring-primary/40 animate-pulse-slow"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CYKTable;

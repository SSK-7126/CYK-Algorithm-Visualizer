import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EPSILON = '\u03B5';
const EMPTY_SET = '\u2205';

const CYKTable = ({ string, table, currentStep }) => {
  if (!table || table.length === 0) return null;

  const n = string.length;

  if (n === 0) {
    return (
      <div className="table-shell table-shell--empty">
        <div className="empty-orb">{EPSILON}</div>
        <h3 className="text-2xl font-semibold">Empty string inspection</h3>
        <p className="text-[color:var(--text-muted)] max-w-xl leading-7">
          The input is being interpreted as epsilon, so acceptance depends on whether the start symbol can derive {EPSILON}.
        </p>
      </div>
    );
  }

  const rows = [];
  for (let l = 1; l <= n; l++) {
    const rowCells = [];
    for (let i = 1; i <= n - l + 1; i++) {
      rowCells.push({ len: l, pos: i });
    }
    rows.push(rowCells);
  }

  const getCellState = (len, pos) => {
    if (!currentStep || currentStep.type === 'FINAL') return 'normal';
    if (currentStep.row === len && currentStep.col === pos) return 'active';

    if (currentStep.type === 'COMBINE') {
      if (currentStep.left.row === len && currentStep.left.col === pos) return 'source';
      if (currentStep.right.row === len && currentStep.right.col === pos) return 'source';
    }

    if (len < currentStep.row || (len === currentStep.row && pos < currentStep.col)) return 'completed';
    return 'normal';
  };

  return (
    <div className="table-shell">
      <div className="string-ribbon">
        {string.split('').map((char, index) => (
          <div key={`${char}-${index}`} className="string-ribbon__cell">
            <span>{char || EPSILON}</span>
            <small>idx {index + 1}</small>
          </div>
        ))}
      </div>

      <div className="triangle-matrix">
        {rows
          .slice()
          .reverse()
          .map((row) => (
            <div key={`row-${row[0].len}`} className="triangle-matrix__row">
              {row.map((cell) => {
                const state = getCellState(cell.len, cell.pos);
                const vars = Array.from(table[cell.len][cell.pos]);

                return (
                  <motion.div
                    key={`${cell.len}-${cell.pos}`}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: state === 'active' ? 1.03 : 1 }}
                    className={`matrix-node matrix-node--${state}`}
                  >
                    <div className="matrix-node__meta">T[{cell.len},{cell.pos}]</div>
                    <AnimatePresence mode="popLayout">
                      <div className="matrix-node__tokens">
                        {vars.map((value) => (
                          <motion.span
                            key={value}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="matrix-token"
                          >
                            {value}
                          </motion.span>
                        ))}
                        {vars.length === 0 && <span className="matrix-empty">{EMPTY_SET}</span>}
                      </div>
                    </AnimatePresence>
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

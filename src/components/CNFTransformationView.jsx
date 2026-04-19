import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FolderGit2 } from 'lucide-react';

const CNFTransformationView = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="cnf-stream">
      {steps.map((step, index) => (
        <motion.article
          key={step.title}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className="cnf-card"
        >
          <div className="cnf-card__line" />
          <div className="cnf-card__header">
            <div>
              <p className="eyebrow">Stage {index + 1}</p>
              <h3>{step.title}</h3>
            </div>
            <div className="icon-orb">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>

          <p className="text-sm leading-7 text-[color:var(--text-muted)]">{step.explanation}</p>

          <div className="rule-board">
            {Object.keys(step.grammar.rules).map((lhs) => (
              <div key={lhs} className="rule-row">
                <span className="rule-row__lhs">{lhs}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[color:var(--text-dim)]" />
                <span className="rule-row__rhs">{step.grammar.rules[lhs].join(' | ')}</span>
              </div>
            ))}
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default CNFTransformationView;

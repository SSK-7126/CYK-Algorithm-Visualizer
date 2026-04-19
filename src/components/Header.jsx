import React from 'react';
import { BrainCircuit, Boxes, Grid2x2, Radar } from 'lucide-react';

const navItems = [
  { label: 'Input', href: '#input-zone', icon: Boxes },
  { label: 'CNF', href: '#cnf-zone', icon: Grid2x2 },
  { label: 'Matrix', href: '#table-zone', icon: Radar }
];

const Header = () => {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
      <div className="max-w-[1500px] mx-auto nav-shell">
        <div className="flex items-center gap-4">
          <div className="brand-core">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--secondary)]">
              CYK Interface
            </p>
            <h2 className="text-sm md:text-base font-semibold tracking-[0.08em]">
              Algorithm Visualizer
            </h2>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 nav-pills">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.label} href={item.href} className="nav-pill">
                <Icon className="w-4 h-4" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="header-chip">
          <span className="status-dot" />
          CFL dynamic programming lab
        </div>
      </div>
    </header>
  );
};

export default Header;

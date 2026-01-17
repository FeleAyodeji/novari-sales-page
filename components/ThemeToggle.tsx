
import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-6 right-6 z-[70] p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-zinc-300 dark:border-zinc-800 shadow-xl hover:scale-110 transition-all flex items-center justify-center w-12 h-12 group overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {theme === 'dark' ? (
          <i className="fa-solid fa-sun text-gold text-xl animate-timer-tick"></i>
        ) : (
          <i className="fa-solid fa-moon text-zinc-900 text-xl group-hover:text-gold transition-colors"></i>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;

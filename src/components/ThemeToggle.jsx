import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ value = 'light', onChange, disabled = false }) {
  const isDark = value === 'dark';

  const handleToggle = () => {
    if (disabled) return;
    onChange?.(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className={`relative h-24 w-12 overflow-hidden rounded-full border-2 p-1.5 transition-colors ${
        disabled
          ? 'cursor-not-allowed border-slate-300 bg-slate-200/80 opacity-70'
          : 'border-slate-300 bg-gradient-to-b from-amber-100 via-slate-100 to-slate-300 hover:border-slate-400'
      }`}
    >
      <span className="pointer-events-none absolute inset-1.5 rounded-full border border-white/70 bg-white/25 shadow-[inset_0_1px_4px_rgba(15,23,42,0.15)]" />

      <span className="absolute left-1/2 top-2.5 -translate-x-1/2 text-amber-500">
        <Sun size={14} />
      </span>
      <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-indigo-700">
        <Moon size={14} />
      </span>

      <span
        className={`absolute left-1.5 top-1.5 h-7 w-7 rounded-full border border-white/80 bg-white shadow-[0_6px_14px_rgba(15,23,42,0.25)] transition-transform duration-300 ${
          isDark ? 'translate-y-[52px]' : 'translate-y-0'
        }`}
      />
    </button>
  );
}

import React from 'react';
import ThemeToggle from './ThemeToggle';

const fallbackThemes = [
  { key: 'light', label: 'Light' },
];

export default function Settings({
  isOpen,
  open,
  onClose,
  themes = fallbackThemes,
  themeKey = 'light',
  onThemeChange,
}) {
  const resolvedIsOpen = typeof isOpen === 'boolean' ? isOpen : Boolean(open);
  const normalizedThemeKey = themeKey === 'dark' ? 'dark' : 'light';
  const hasDarkTheme = themes.some((theme) => theme.key === 'dark');

  if (!resolvedIsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-extrabold text-slate-900">Display Preferences</h3>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm font-black text-slate-900">Theme</p>
              <p className="text-xs font-semibold text-slate-500">
                {normalizedThemeKey === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
            <ThemeToggle
              value={normalizedThemeKey}
              onChange={(nextTheme) => onThemeChange?.(nextTheme)}
              disabled={!hasDarkTheme}
            />
          </div>
          {!hasDarkTheme && (
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Dark mode toggle will be enabled when dark theme is available.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
          <h3 className="text-lg font-extrabold text-indigo-900">Parent Controls</h3>
          <p className="mt-2 text-sm font-semibold text-indigo-800">
            Logout and Delete Account are available only inside Parent Zone for child safety.
          </p>
        </section>
      </div>
    </div>
  );
}

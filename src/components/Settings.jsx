import React from 'react';

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
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {themes.map((theme) => {
              const active = theme.key === themeKey;
              return (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => onThemeChange?.(theme.key)}
                  aria-pressed={active}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors ${
                    active
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {theme.label}
                </button>
              );
            })}
          </div>

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

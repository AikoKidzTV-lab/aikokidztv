import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[1.75rem] border border-slate-700 bg-slate-900/90 p-8 text-center text-slate-100 shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
            <h1 className="text-2xl font-black text-white">Profile Settings</h1>
            <p className="mt-3 text-sm font-semibold text-slate-300">
              Please log in to view your account email.
            </p>
            <button
              type="button"
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
              }}
              className="mt-6 rounded-full border border-slate-500 bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-100 shadow-sm hover:bg-slate-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[1.75rem] border border-slate-700 bg-slate-900/90 p-6 text-slate-100 shadow-[0_20px_60px_rgba(2,6,23,0.5)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-black text-white">Profile Settings</h1>
            <button
              type="button"
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
              }}
              className="rounded-full border border-slate-500 bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-100 shadow-sm hover:bg-slate-700"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3">
              <p className="text-sm font-black text-slate-200">Email ID</p>
              <p className="mt-1 break-all text-base font-semibold text-white">{user.email || 'Not available'}</p>
            </div>

            <p className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200">
              This account now uses email only. Name and nickname fields were removed to avoid profile sync and loading issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

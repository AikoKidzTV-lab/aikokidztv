import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';

const showProfileToast = (icon, title) =>
  Swal.fire({
    toast: true,
    icon,
    title,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#f8fafc',
  });

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDisplayName(String(profile?.full_name || profile?.display_name || ''));
    setNickname(String(profile?.nickname || ''));
  }, [profile?.display_name, profile?.full_name, profile?.nickname]);

  const handleSaveProfile = async () => {
    if (isLoading) return;
    if (!user) return;

    try {
      setIsLoading(true);

      const updates = {
        full_name: displayName.trim() || null,
        nickname: nickname.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      showProfileToast('success', 'Profile saved successfully.');
      await Promise.resolve(fetchProfile?.(user.id)).catch((syncError) => {
        console.warn('[ProfileSettings] Profile refresh failed after save:', syncError);
      });
    } catch (error) {
      console.error('Error updating profile:', error?.message || error);
      showProfileToast('error', error?.message || 'Could not save profile right now.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[1.75rem] border border-slate-700 bg-slate-900/90 p-8 text-center text-slate-100 shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
            <h1 className="text-2xl font-black text-white">Profile Settings</h1>
            <p className="mt-3 text-sm font-semibold text-slate-300">
              Please log in to manage your profile details.
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

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSaveProfile();
            }}
            className="mt-6 space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-200">Display Name</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Enter display name"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-200">Nickname</span>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Enter nickname"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-400"
              />
            </label>

            <p className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200">
              Names can be similar. For identity issues, please provide your registered email.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-full border border-cyan-300 bg-gradient-to-r from-cyan-300 to-blue-300 px-5 py-2.5 text-sm font-black text-slate-900 shadow-sm hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

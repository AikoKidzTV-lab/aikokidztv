import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const STORAGE_BUCKET = 'coloring_pages';
const PREMIUM_UNLOCK_COST = 49;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const createUploadPath = (file) => {
  const rawName = file?.name || 'coloring-page';
  const ext = rawName.includes('.') ? rawName.slice(rawName.lastIndexOf('.')).toLowerCase() : '.jpg';
  const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.jpg';
  const base = rawName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'coloring-page';

  const unique =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `uploads/${Date.now()}-${unique}-${base}${safeExt}`;
};

export default function AdminPanel() {
  const [file, setFile] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUploaded, setLastUploaded] = useState(null);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleFileChange = (event) => {
    resetMessages();
    const nextFile = event.target.files?.[0] ?? null;

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.type && !ACCEPTED_TYPES.includes(nextFile.type)) {
      setFile(null);
      setError('Please select a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    setFile(nextFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!file) {
      setError('Please choose an image file before uploading.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadPath = createUploadPath(file);

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(uploadPath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadPath);
      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error('Could not generate a public URL for the uploaded image.');
      }

      const { data: insertedRow, error: insertError } = await supabase
        .from('coloring_pages')
        .insert({
          image_url: publicUrl,
          is_premium: isPremium,
        })
        .select('*')
        .single();

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      setLastUploaded(insertedRow);
      setSuccess(`Upload successful. Coloring page added${isPremium ? ' as PREMIUM' : ''}.`);
      setFile(null);
      setIsPremium(false);
      if (event.target && event.target instanceof HTMLFormElement) {
        event.target.reset();
      }
    } catch (err) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
            Admin • Coloring CMS
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Upload Coloring Pages</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Upload images to Supabase Storage (`{STORAGE_BUCKET}`) and save page metadata in the
            `coloring_pages` table.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">Coloring Page Image</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-emerald-300 hover:bg-emerald-50/50">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="text-4xl" aria-hidden>
                  🖼️
                </div>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {file ? file.name : 'Click to choose an image'}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  PNG, JPG/JPEG, or WEBP
                </p>
              </label>
              {file && (
                <p className="mt-2 text-xs text-slate-500">
                  Size: {(file.size / 1024).toFixed(1)} KB • Type: {file.type || 'unknown'}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>
                  <span className="block text-sm font-black text-amber-900">
                    Mark as Premium (Costs {PREMIUM_UNLOCK_COST} Gems)
                  </span>
                  <span className="block text-xs font-medium text-amber-800/80">
                    If unchecked, the page is immediately available to kids.
                  </span>
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !file}
              className={`w-full rounded-2xl px-5 py-3 text-sm font-black transition ${
                isSubmitting || !file
                  ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                  : 'border border-emerald-300 bg-gradient-to-r from-emerald-400 to-green-400 text-white shadow-lg shadow-emerald-200 hover:brightness-95'
              }`}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Coloring Page'}
            </button>
          </div>
        </form>

        {lastUploaded && (
          <div className="mt-6 rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Last Uploaded
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-[140px_1fr] sm:items-start">
              <img
                src={lastUploaded.image_url}
                alt="Last uploaded coloring page"
                className="aspect-[3/4] w-full rounded-xl border border-slate-200 object-cover bg-slate-50"
              />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 break-all">
                  URL: {lastUploaded.image_url}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  Premium: {lastUploaded.is_premium ? 'Yes' : 'No'}
                </p>
                <p className="text-xs font-medium text-slate-500">ID: {lastUploaded.id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

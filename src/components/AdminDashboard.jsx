import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  PlaySquare,
  Users,
  ImagePlus,
  Crown,
  Video,
  BookOpen,
  Pencil,
  Trash2,
  Loader2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { applySmallItemEconomy } from '../constants/gemEconomy';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const ADMIN_EMAIL = 'advdeepakkumar26@gmail.com';
const COLORING_STORAGE_BUCKET = 'coloring_images';
const COLORING_PREMIUM_COST = applySmallItemEconomy(3);
const COLORING_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const VIDEO_CATEGORIES = ['Learning', 'Stories', 'Songs'];

const createColoringUploadPath = (file) => {
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

const navItems = [
  { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'Manage Videos', label: 'Manage Videos', icon: PlaySquare },
  { key: 'Manage Coloring Pages', label: 'Manage Coloring Pages', icon: ImagePlus },
  { key: 'Manage Users', label: 'Manage Users', icon: Users },
];

const emptyVideoForm = {
  title: '',
  youtubeUrl: '',
  category: 'Learning',
  isPromoHomepage: false,
};

const extractYouTubeId = (input = '') => {
  const raw = String(input).trim();
  if (!raw) return '';

  const idOnlyPattern = /^[a-zA-Z0-9_-]{11}$/;
  if (idOnlyPattern.test(raw)) return raw;

  try {
    const normalized = raw.startsWith('http') ? raw : `https://${raw}`;
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || '';
      return idOnlyPattern.test(id) ? id : '';
    }

    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const watchId = url.searchParams.get('v') || '';
      if (idOnlyPattern.test(watchId)) return watchId;

      const pathParts = url.pathname.split('/').filter(Boolean);
      const embeddedId =
        (pathParts[0] === 'embed' || pathParts[0] === 'shorts' || pathParts[0] === 'live')
          ? pathParts[1]
          : '';
      return idOnlyPattern.test(embeddedId || '') ? embeddedId : '';
    }
  } catch {
    return '';
  }

  return '';
};

const AdminDashboard = ({ onBackToSite }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(emptyVideoForm);
  const [isVideosLoading, setIsVideosLoading] = useState(false);
  const [isVideoSubmitting, setIsVideoSubmitting] = useState(false);
  const [videoFormError, setVideoFormError] = useState('');
  const [videoFormSuccess, setVideoFormSuccess] = useState('');
  const [videoListError, setVideoListError] = useState('');
  const coloringFileInputRef = useRef(null);
  const [coloringFile, setColoringFile] = useState(null);
  const [coloringIsPremium, setColoringIsPremium] = useState(false);
  const [isColoringUploading, setIsColoringUploading] = useState(false);
  const [coloringUploadError, setColoringUploadError] = useState('');
  const [coloringUploadSuccess, setColoringUploadSuccess] = useState('');
  const [lastColoringUpload, setLastColoringUpload] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const isAuthorized = user?.email === ADMIN_EMAIL;

  const handleBackToSite = () => {
    if (onBackToSite) {
      onBackToSite();
      return;
    }
    window.history.pushState({}, '', '/');
    window.location.assign('/');
  };

  const handleFormChange = (key, value) => {
    setVideoFormError('');
    setVideoFormSuccess('');
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadVideos = async () => {
    setIsVideosLoading(true);
    setVideoListError('');

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, youtube_id, category, is_promo_homepage, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setVideos(data || []);
    } catch (err) {
      setVideoListError(err?.message || 'Failed to load videos.');
    } finally {
      setIsVideosLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'Manage Videos') return;
    loadVideos();
  }, [activeTab]);

  const handleAddVideo = async (e) => {
    e?.preventDefault();
    setVideoFormError('');
    setVideoFormSuccess('');

    const title = form.title.trim();
    const youtubeUrl = form.youtubeUrl.trim();

    if (!title || !youtubeUrl) {
      setVideoFormError('Please enter a video title and a YouTube URL.');
      return;
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      setVideoFormError('Invalid YouTube URL. Please paste a standard YouTube video link.');
      return;
    }

    setIsVideoSubmitting(true);

    try {
      const { data: insertedRow, error } = await supabase
        .from('videos')
        .insert({
          title,
          youtube_id: youtubeId,
          category: form.category,
          is_promo_homepage: form.isPromoHomepage,
        })
        .select('id, title, youtube_id, category, is_promo_homepage, created_at')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setVideos((prev) => [insertedRow, ...prev]);
      setForm(emptyVideoForm);
      setVideoFormSuccess(`Video added successfully (${youtubeId}).`);
    } catch (err) {
      setVideoFormError(err?.message || 'Failed to add video.');
    } finally {
      setIsVideoSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white text-2xl">
        Access Denied - Admin Only
      </div>
    );
  }

  const resetColoringMessages = () => {
    setColoringUploadError('');
    setColoringUploadSuccess('');
  };

  const validateColoringFile = (file) => {
    if (!file) return 'Please choose an image file.';
    if (file.type && COLORING_ACCEPTED_TYPES.includes(file.type)) return '';

    const ext = file.name?.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return '';

    return 'Please select a PNG, JPG/JPEG, or WEBP image.';
  };

  const setSelectedColoringFile = (file) => {
    resetColoringMessages();
    const validationMessage = validateColoringFile(file);
    if (validationMessage) {
      setColoringFile(null);
      setColoringUploadError(validationMessage);
      return;
    }
    setColoringFile(file);
  };

  const handleColoringFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      setColoringFile(null);
      return;
    }
    setSelectedColoringFile(nextFile);
  };

  const handleColoringDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isColoringUploading) return;
    setIsDragActive(true);
  };

  const handleColoringDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const handleColoringDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    if (isColoringUploading) return;

    const nextFile = event.dataTransfer?.files?.[0] ?? null;
    if (!nextFile) return;
    setSelectedColoringFile(nextFile);
  };

  const handleColoringUpload = async (event) => {
    event?.preventDefault?.();
    resetColoringMessages();

    const validationMessage = validateColoringFile(coloringFile);
    if (validationMessage) {
      setColoringUploadError(validationMessage);
      return;
    }

    setIsColoringUploading(true);

    try {
      const uploadPath = createColoringUploadPath(coloringFile);

      const { error: uploadError } = await supabase.storage
        .from(COLORING_STORAGE_BUCKET)
        .upload(uploadPath, coloringFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: coloringFile.type || undefined,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from(COLORING_STORAGE_BUCKET)
        .getPublicUrl(uploadPath);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Could not generate a public URL for the uploaded image.');
      }

      const { data: insertedRow, error: insertError } = await supabase
        .from('coloring_pages')
        .insert({
          image_url: publicUrl,
          is_premium: coloringIsPremium,
        })
        .select('*')
        .single();

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      setLastColoringUpload(insertedRow);
      setColoringUploadSuccess(
        `Coloring page uploaded successfully${coloringIsPremium ? ' (Premium)' : ''}.`
      );
      setColoringFile(null);
      setColoringIsPremium(false);
      if (coloringFileInputRef.current) {
        coloringFileInputRef.current.value = '';
      }
    } catch (err) {
      setColoringUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsColoringUploading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Manage Videos':
        return (
          <div className="space-y-8">
            <form
              onSubmit={handleAddVideo}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Content</p>
                  <h2 className="text-xl font-semibold text-slate-900">Add New Video</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Add videos for Cinema Magic and optionally surface them in the Homepage Free Gems section.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isVideoSubmitting}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow transition ${
                    isVideoSubmitting
                      ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                      : 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white hover:from-pink-400 hover:to-indigo-400'
                  }`}
                >
                  {isVideoSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Video'
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Video Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">YouTube Video URL</label>
                  <input
                    value={form.youtubeUrl}
                    onChange={(e) => handleFormChange('youtubeUrl', e.target.value)}
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-slate-500">
                    We automatically extract and save the standard YouTube video ID.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {VIDEO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Extracted YouTube ID (Preview)</label>
                  <input
                    value={extractYouTubeId(form.youtubeUrl) || ''}
                    type="text"
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    placeholder="Auto-detected after pasting URL"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <label className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isPromoHomepage}
                    onChange={(e) => handleFormChange('isPromoHomepage', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">
                      Show on Homepage for Free Gems (`is_promo_homepage`)
                    </span>
                    <span className="block text-xs text-slate-600">
                      If checked, this video can be used in the Homepage Watch &amp; Earn section.
                    </span>
                  </span>
                </label>
              </div>

              {videoFormError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span className="font-medium">{videoFormError}</span>
                </div>
              )}

              {videoFormSuccess && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <span className="font-medium">{videoFormSuccess}</span>
                </div>
              )}
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Library</p>
                  <h3 className="text-lg font-semibold text-slate-900">Video Inventory</h3>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-500">{videos.length} videos</p>
                  <button
                    type="button"
                    onClick={loadVideos}
                    disabled={isVideosLoading}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      isVideosLoading
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {isVideosLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>

              {videoListError && (
                <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
                  Failed to load videos: {videoListError}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Thumbnail</th>
                      <th className="px-6 py-3 font-semibold">Title</th>
                      <th className="px-6 py-3 font-semibold">Category</th>
                      <th className="px-6 py-3 font-semibold">Homepage Promo</th>
                      <th className="px-6 py-3 font-semibold">YouTube ID</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isVideosLoading && videos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          Loading videos...
                        </td>
                      </tr>
                    ) : videos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No videos in the database yet. Add your first video above.
                        </td>
                      </tr>
                    ) : videos.map((video, idx) => (
                      <tr
                        key={video.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                      >
                        <td className="px-6 py-3">
                          <div className="h-12 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {video.youtube_id ? (
                              <img
                                src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                                alt={video.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                No Image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="font-semibold text-slate-900">{video.title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-xs">
                            https://youtu.be/{video.youtube_id}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-700">{video.category}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              video.is_promo_homepage
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {video.is_promo_homepage ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                            {video.youtube_id}
                          </code>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              disabled
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 hover:border-red-200 hover:text-red-600 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'Manage Coloring Pages':
        return (
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Coloring CMS</p>
                  <h2 className="text-xl font-semibold text-slate-900">Manage Coloring Pages</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Upload page images to Supabase Storage and publish them in the coloring gallery.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                  Premium unlock cost: {COLORING_PREMIUM_COST} Gems
                </span>
              </div>

              <form onSubmit={handleColoringUpload} className="space-y-5">
                <input
                  ref={coloringFileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleColoringFileChange}
                  className="hidden"
                  disabled={isColoringUploading}
                />

                <button
                  type="button"
                  onClick={() => !isColoringUploading && coloringFileInputRef.current?.click()}
                  onDragEnter={handleColoringDragOver}
                  onDragOver={handleColoringDragOver}
                  onDragLeave={handleColoringDragLeave}
                  onDrop={handleColoringDrop}
                  className={`w-full rounded-2xl border-2 border-dashed p-8 text-left transition ${
                    isDragActive
                      ? 'border-emerald-400 bg-emerald-50 shadow-inner'
                      : 'border-slate-300 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40'
                  } ${isColoringUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div
                      className={`grid h-16 w-16 place-items-center rounded-2xl border ${
                        isDragActive
                          ? 'border-emerald-300 bg-white text-emerald-600'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      <UploadCloud size={28} />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-900">
                      {coloringFile ? coloringFile.name : 'Drag & drop a coloring page image here'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {coloringFile
                        ? `${(coloringFile.size / 1024).toFixed(1)} KB - ${coloringFile.type || 'image file'}`
                        : 'or click to browse PNG, JPG/JPEG, WEBP files'}
                    </p>
                  </div>
                </button>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={coloringIsPremium}
                      onChange={(e) => setColoringIsPremium(e.target.checked)}
                      disabled={isColoringUploading}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-amber-900">
                        Mark as Premium (Costs {COLORING_PREMIUM_COST} Gems)
                      </span>
                      <span className="block text-xs text-amber-800/80">
                        Premium pages will show a gem lock overlay in the Coloring Book.
                      </span>
                    </span>
                  </label>
                </div>

                {coloringUploadError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span className="font-medium">{coloringUploadError}</span>
                  </div>
                )}

                {coloringUploadSuccess && (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span className="font-medium">{coloringUploadSuccess}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isColoringUploading || !coloringFile}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                      isColoringUploading || !coloringFile
                        ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                        : 'border border-emerald-300 bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow hover:brightness-95'
                    }`}
                  >
                    {isColoringUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} />
                        Upload Coloring Page
                      </>
                    )}
                  </button>

                  {coloringFile && !isColoringUploading && (
                    <button
                      type="button"
                      onClick={() => {
                        setColoringFile(null);
                        resetColoringMessages();
                        if (coloringFileInputRef.current) coloringFileInputRef.current.value = '';
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </form>
            </div>

            {lastColoringUpload && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Latest Upload</p>
                    <h3 className="text-lg font-semibold text-slate-900">Published Coloring Page</h3>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      lastColoringUpload.is_premium
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {lastColoringUpload.is_premium ? 'Premium' : 'Free'}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={lastColoringUpload.image_url}
                      alt="Latest coloring page upload"
                      className="aspect-[3/4] h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">ID: {lastColoringUpload.id}</p>
                    <p className="break-all text-sm text-slate-600">
                      URL: {lastColoringUpload.image_url}
                    </p>
                    <p className="text-sm text-slate-600">
                      Created: {new Date(lastColoringUpload.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'Manage Users':
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">User Management View</h2>
            <p className="mt-2 text-sm text-slate-600">
              Placeholder content to verify tab switching. User tools will live here.
            </p>
          </div>
        );
      case 'Dashboard':
      default:
        const kpiStats = [
          { label: 'Total Users', value: '0', icon: Users, accent: 'bg-emerald-500' },
          { label: 'Active Premium Users', value: '0', icon: Crown, accent: 'bg-amber-500' },
          { label: 'Total Videos', value: '0', icon: Video, accent: 'bg-sky-500' },
          { label: 'Total AI Stories Generated', value: '0', icon: BookOpen, accent: 'bg-fuchsia-500' },
        ];

        const userGrowthData = [
          { day: 'Mon', users: 0 },
          { day: 'Tue', users: 0 },
          { day: 'Wed', users: 0 },
          { day: 'Thu', users: 0 },
          { day: 'Fri', users: 0 },
          { day: 'Sat', users: 0 },
          { day: 'Sun', users: 0 },
        ];

        const categoryData = [
          { name: 'Rhymes', value: 0 },
          { name: 'Stories', value: 0 },
          { name: 'Learning', value: 0 },
          { name: 'Movies', value: 0 },
        ];

        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <span className={`absolute inset-x-0 top-0 h-1 ${item.accent}`} />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                        <Icon size={22} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Engagement</p>
                    <h3 className="text-lg font-semibold text-slate-900">User Growth (Last 7 Days)</h3>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Content</p>
                    <h3 className="text-lg font-semibold text-slate-900">Popular Categories</h3>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Views" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full flex bg-slate-100 text-slate-900">
      <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-white">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-lg font-semibold text-white">
            AK
          </div>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Control</p>
            <p className="text-lg font-semibold">AikoKidz Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-slate-700 bg-slate-800 text-white shadow-inner'
                    : 'border-transparent text-slate-200 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? 'bg-emerald-400' : 'bg-slate-600 group-hover:bg-slate-400'
                  }`}
                />
                <Icon size={18} className="opacity-90" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-5">
          <button
            onClick={handleBackToSite}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            <ArrowLeft size={16} /> Back to Site
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-6xl px-8 py-10">
          <header className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mission Control</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">Secure access restricted to the primary admin email.</p>
          </header>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  Users,
  Video,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { isAdminEmail } from '../utils/admin';

const VIDEO_STORAGE_BUCKET = 'videos';
const THUMBNAIL_STORAGE_BUCKET = 'thumbnails';
const COLORING_STORAGE_BUCKET = 'coloring_pages';
const POEM_STORAGE_BUCKET = 'poems';

const IMAGE_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const IMAGE_ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
const VIDEO_ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
const VIDEO_ACCEPTED_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v'];
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024;
const VIDEO_CATEGORIES = ['Learning', 'Stories', 'Songs', 'Movies'];

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Manage Users', icon: Users },
  { key: 'videos', label: 'Manage Videos', icon: Video },
  { key: 'coloring_pages', label: 'Manage Coloring Pages', icon: ImagePlus },
  { key: 'poems', label: 'Manage Poems', icon: Pencil },
];

const makeRandomId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const sanitizeBaseName = (fileName = '') =>
  String(fileName || '')
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'file';

const getFileExtension = (fileName = '') => {
  const clean = String(fileName || '').trim();
  if (!clean.includes('.')) return '';
  return clean.slice(clean.lastIndexOf('.') + 1).toLowerCase();
};

const buildUploadPath = (file, folder, acceptedExtensions, fallbackExtension) => {
  const extension = getFileExtension(file?.name);
  const safeExtension = acceptedExtensions.includes(extension) ? extension : fallbackExtension;
  const baseName = sanitizeBaseName(file?.name || folder);
  return `${folder}/${Date.now()}-${makeRandomId()}-${baseName}.${safeExtension}`;
};

const validateFile = ({
  file,
  label,
  acceptedTypes,
  acceptedExtensions,
  maxSizeBytes,
  sizeMessage,
  typeMessage,
}) => {
  if (!file) return `${label} is required.`;
  if (Number.isFinite(file.size) && file.size > maxSizeBytes) {
    return sizeMessage;
  }

  if (file.type && acceptedTypes.includes(file.type)) return '';

  const extension = getFileExtension(file.name);
  if (acceptedExtensions.includes(extension)) return '';

  return typeMessage;
};

const getStoragePathFromUrl = (fileUrl = '', bucketName = '') => {
  const raw = typeof fileUrl === 'string' ? fileUrl.trim() : '';
  if (!raw || !bucketName) return '';

  try {
    const parsed = new URL(raw);
    const pathname = decodeURIComponent(parsed.pathname || '');
    const markers = [
      `/storage/v1/object/public/${bucketName}/`,
      `/storage/v1/object/sign/${bucketName}/`,
      `/storage/v1/object/${bucketName}/`,
    ];

    for (const marker of markers) {
      const index = pathname.indexOf(marker);
      if (index >= 0) {
        return pathname.slice(index + marker.length).replace(/^\/+/, '');
      }
    }

    return '';
  } catch {
    if (/^https?:\/\//i.test(raw)) return '';
    const normalized = raw.replace(/^\/+/, '');
    if (normalized.startsWith(`${bucketName}/`)) {
      return normalized.slice(bucketName.length + 1);
    }
    return normalized;
  }
};

const isStorageMissingFileError = (message = '') =>
  /not found|does not exist|no such file|404/i.test(String(message || ''));

const removeStoragePath = async (bucketName, storagePath) => {
  if (!storagePath) return;
  const { error } = await supabase.storage.from(bucketName).remove([storagePath]);
  if (error && !isStorageMissingFileError(error.message)) {
    throw new Error(error.message);
  }
};

const removeFileByUrl = async (bucketName, fileUrl) => {
  const path = getStoragePathFromUrl(fileUrl, bucketName);
  if (!path) return;
  await removeStoragePath(bucketName, path);
};

const uploadPublicFile = async ({
  file,
  bucketName,
  folder,
  acceptedExtensions,
  fallbackExtension,
}) => {
  const uploadPath = buildUploadPath(file, folder, acceptedExtensions, fallbackExtension);
  const { error } = await supabase.storage.from(bucketName).upload(uploadPath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(uploadPath);
  const publicUrl = publicData?.publicUrl;

  if (!publicUrl) {
    await removeStoragePath(bucketName, uploadPath).catch(() => {});
    throw new Error('Could not generate a public URL for uploaded file.');
  }

  return { uploadPath, publicUrl };
};

const fetchRowsWithFallbackOrder = async (tableName) => {
  const ordered = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
  if (ordered.error && isMissingTableError(ordered.error)) return [];
  if (!ordered.error) return ordered.data || [];

  if (!/created_at/i.test(ordered.error.message || '')) {
    throw new Error(ordered.error.message);
  }

  const fallback = await supabase.from(tableName).select('*');
  if (fallback.error && isMissingTableError(fallback.error)) return [];
  if (fallback.error) throw new Error(fallback.error.message);
  return fallback.data || [];
};

const fetchTableCount = async (tableName) => {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    if (isMissingTableError(error)) return 0;
    throw new Error(error.message);
  }

  return Number.isFinite(count) ? count : 0;
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString();
};

const readFirstString = (row, keys = [], fallback = '') => {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
};

const readFirstBoolean = (row, keys = [], fallback = false) => {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === 'boolean') return value;
  }
  return fallback;
};

const POEM_CATEGORY_OPTIONS = [
  'Animal Safari',
  'Nature & Earth',
  'Human Nature & Values',
  'Plants & Flowers',
  'Galaxies & Space',
];

const getMissingColumnName = (message = '') => {
  const patterns = [
    /column ["']?([a-zA-Z0-9_]+)["']? does not exist/i,
    /Could not find the ['"]([a-zA-Z0-9_]+)['"] column/i,
    /Could not find column ['"]([a-zA-Z0-9_]+)['"]/i,
  ];

  for (const pattern of patterns) {
    const match = String(message || '').match(pattern);
    if (match?.[1]) return match[1];
  }
  return '';
};

const isMissingTableError = (errorLike = null) => {
  const text = typeof errorLike === 'string'
    ? errorLike
    : `${errorLike?.message || ''} ${errorLike?.details || ''} ${errorLike?.hint || ''}`;

  return (
    String(errorLike?.code || '').toUpperCase() === '42P01' ||
    String(errorLike?.code || '').toUpperCase() === 'PGRST205' ||
    /relation\s+["']?[a-z0-9_.-]+["']?\s+does not exist/i.test(text) ||
    /could not find the table/i.test(text) ||
    /table\s+["']?[a-z0-9_.-]+["']?\s+does not exist/i.test(text)
  );
};

const runMutationWithMissingColumnFallback = async ({ payload, requiredColumns = [], mutate }) => {
  const requiredSet = new Set(requiredColumns.filter(Boolean));
  let nextPayload = { ...payload };

  for (let i = 0; i < 8; i += 1) {
    const result = await mutate(nextPayload);
    if (!result.error) {
      return { data: result.data, usedPayload: nextPayload };
    }

    const message = result.error?.message || 'Database mutation failed.';
    const missingColumn = getMissingColumnName(message);
    if (!missingColumn || requiredSet.has(missingColumn) || !(missingColumn in nextPayload)) {
      throw new Error(message);
    }

    delete nextPayload[missingColumn];
  }

  throw new Error('Database mutation failed due to repeated schema mismatch.');
};

const Feedback = ({ error, success }) => (
  <>
    {error && (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {error}
      </div>
    )}
    {success && (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        {success}
      </div>
    )}
  </>
);

function VideosSection({ isActive }) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingId, setDeletingId] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: VIDEO_CATEGORIES[0],
    isPremium: false,
    isPromoHomepage: false,
    existingVideoUrl: '',
    existingThumbnailUrl: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const resetMessages = () => {
    setSubmitError('');
    setSubmitSuccess('');
  };

  const clearLocalFiles = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const resetForm = () => {
    setEditingVideo(null);
    setForm({
      title: '',
      category: VIDEO_CATEGORIES[0],
      isPremium: false,
      isPromoHomepage: false,
      existingVideoUrl: '',
      existingThumbnailUrl: '',
    });
    clearLocalFiles();
    resetMessages();
  };

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setListError('');
    try {
      const data = await fetchRowsWithFallbackOrder('videos');
      setRows(data);
    } catch (error) {
      setListError(error?.message || 'Failed to load videos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;
    void loadRows();
  }, [isActive, loadRows]);

  const startEdit = (row) => {
    resetMessages();
    clearLocalFiles();
    setEditingVideo(row);
    setForm({
      title: readFirstString(row, ['title'], ''),
      category: readFirstString(row, ['category'], VIDEO_CATEGORIES[0]),
      isPremium: readFirstBoolean(row, ['is_premium'], false),
      isPromoHomepage: readFirstBoolean(row, ['is_promo_homepage'], false),
      existingVideoUrl: readFirstString(row, ['video_url'], ''),
      existingThumbnailUrl: readFirstString(row, ['thumbnail_url'], ''),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    const title = form.title.trim();
    if (!title) {
      setSubmitError('Video title is required.');
      return;
    }

    if (videoFile) {
      const videoValidation = validateFile({
        file: videoFile,
        label: 'Video file',
        acceptedTypes: VIDEO_ACCEPTED_TYPES,
        acceptedExtensions: VIDEO_ACCEPTED_EXTENSIONS,
        maxSizeBytes: MAX_VIDEO_SIZE_BYTES,
        sizeMessage: 'Video file is too large. Maximum allowed size is 200 MB.',
        typeMessage: 'Please upload an MP4, WEBM, MOV, or M4V video file.',
      });
      if (videoValidation) {
        setSubmitError(videoValidation);
        return;
      }
    }

    if (thumbnailFile) {
      const thumbnailValidation = validateFile({
        file: thumbnailFile,
        label: 'Thumbnail image',
        acceptedTypes: IMAGE_ACCEPTED_TYPES,
        acceptedExtensions: IMAGE_ACCEPTED_EXTENSIONS,
        maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
        sizeMessage: 'Thumbnail image is too large. Maximum allowed size is 8 MB.',
        typeMessage: 'Please upload a PNG, JPG/JPEG, or WEBP thumbnail image.',
      });
      if (thumbnailValidation) {
        setSubmitError(thumbnailValidation);
        return;
      }
    }

    const isEditing = Boolean(editingVideo?.id);
    if (!isEditing && !videoFile) {
      setSubmitError('Please upload a video file when creating a video.');
      return;
    }
    if (!isEditing && !thumbnailFile) {
      setSubmitError('Please upload a Thumbnail Image when creating a video.');
      return;
    }

    setIsSubmitting(true);

    let uploadedVideo = null;
    let uploadedThumbnail = null;
    const previousVideoUrl = readFirstString(editingVideo, ['video_url'], '');
    const previousThumbnailUrl = readFirstString(editingVideo, ['thumbnail_url'], '');
    let nextVideoUrl = form.existingVideoUrl.trim();
    let nextThumbnailUrl = form.existingThumbnailUrl.trim();

    try {
      if (videoFile) {
        uploadedVideo = await uploadPublicFile({
          file: videoFile,
          bucketName: VIDEO_STORAGE_BUCKET,
          folder: 'videos',
          acceptedExtensions: VIDEO_ACCEPTED_EXTENSIONS,
          fallbackExtension: 'mp4',
        });
        nextVideoUrl = uploadedVideo.publicUrl;
      }

      if (thumbnailFile) {
        uploadedThumbnail = await uploadPublicFile({
          file: thumbnailFile,
          bucketName: THUMBNAIL_STORAGE_BUCKET,
          folder: 'thumbnails',
          acceptedExtensions: IMAGE_ACCEPTED_EXTENSIONS,
          fallbackExtension: 'jpg',
        });
        nextThumbnailUrl = uploadedThumbnail.publicUrl;
      }

      if (!nextVideoUrl) {
        throw new Error('Missing video URL. Upload a video file to continue.');
      }
      if (!nextThumbnailUrl) {
        throw new Error('Missing thumbnail URL. Upload a Thumbnail Image to continue.');
      }

      const payload = {
        title,
        video_url: nextVideoUrl,
        thumbnail_url: nextThumbnailUrl,
        category: form.category?.trim() || null,
        is_premium: Boolean(form.isPremium),
        is_promo_homepage: Boolean(form.isPromoHomepage),
      };

      if (isEditing && editingVideo?.youtube_id && videoFile) {
        payload.youtube_id = null;
      }

      const mutation = await runMutationWithMissingColumnFallback({
        payload,
        requiredColumns: ['title', 'video_url', 'thumbnail_url'],
        mutate: (nextPayload) =>
          isEditing
            ? supabase.from('videos').update(nextPayload).eq('id', editingVideo.id).select('*').single()
            : supabase.from('videos').insert(nextPayload).select('*').single(),
      });

      const savedRow = mutation.data;
      if (isEditing) {
        setRows((prev) => prev.map((item) => (item.id === savedRow.id ? savedRow : item)));
      } else {
        setRows((prev) => [savedRow, ...prev]);
      }

      if (isEditing && uploadedVideo && previousVideoUrl && previousVideoUrl !== nextVideoUrl) {
        await removeFileByUrl(VIDEO_STORAGE_BUCKET, previousVideoUrl).catch(() => {});
      }
      if (
        isEditing &&
        uploadedThumbnail &&
        previousThumbnailUrl &&
        previousThumbnailUrl !== nextThumbnailUrl
      ) {
        await removeFileByUrl(THUMBNAIL_STORAGE_BUCKET, previousThumbnailUrl).catch(() => {});
      }

      resetForm();
      setSubmitSuccess(isEditing ? 'Video updated successfully.' : 'Video created successfully.');
    } catch (error) {
      if (uploadedVideo?.uploadPath) {
        await removeStoragePath(VIDEO_STORAGE_BUCKET, uploadedVideo.uploadPath).catch(() => {});
      }
      if (uploadedThumbnail?.uploadPath) {
        await removeStoragePath(THUMBNAIL_STORAGE_BUCKET, uploadedThumbnail.uploadPath).catch(
          () => {}
        );
      }
      setSubmitError(error?.message || 'Failed to save video.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id || deletingId) return;
    const confirmed = window.confirm(
      `Delete "${readFirstString(row, ['title'], 'this video')}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    resetMessages();
    setDeletingId(row.id);

    try {
      const { error } = await supabase.from('videos').delete().eq('id', row.id);
      if (error) throw new Error(error.message);

      setRows((prev) => prev.filter((item) => item.id !== row.id));
      if (editingVideo?.id === row.id) {
        resetForm();
      }

      await Promise.allSettled([
        removeFileByUrl(VIDEO_STORAGE_BUCKET, readFirstString(row, ['video_url'], '')),
        removeFileByUrl(THUMBNAIL_STORAGE_BUCKET, readFirstString(row, ['thumbnail_url'], '')),
      ]);

      setSubmitSuccess('Video deleted successfully.');
    } catch (error) {
      setSubmitError(error?.message || 'Failed to delete video.');
    } finally {
      setDeletingId('');
    }
  };
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Videos</h2>
            <p className="text-sm text-slate-600">
              Full CRUD for videos with separate thumbnail upload to the `thumbnails` bucket.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadRows()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Video Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, title: e.target.value }));
                  resetMessages();
                }}
                disabled={isSubmitting}
                placeholder="Enter video title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={form.category}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, category: e.target.value }));
                  resetMessages();
                }}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              >
                {VIDEO_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Video File {editingVideo ? '(optional to replace)' : '(required)'}
              </label>
              <input
                ref={videoInputRef}
                type="file"
                accept=".mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v"
                onChange={(e) => {
                  setVideoFile(e.target.files?.[0] || null);
                  resetMessages();
                }}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {form.existingVideoUrl && (
                <a
                  href={form.existingVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block break-all text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Current video URL
                </a>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Thumbnail Image {editingVideo ? '(optional to replace)' : '(required)'}
              </label>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  setThumbnailFile(e.target.files?.[0] || null);
                  resetMessages();
                }}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {form.existingThumbnailUrl && (
                <img
                  src={form.existingThumbnailUrl}
                  alt="Current video thumbnail"
                  className="mt-2 h-24 w-40 rounded-lg border border-slate-200 object-cover"
                />
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isPremium}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, isPremium: e.target.checked }));
                  resetMessages();
                }}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Mark as Premium
            </label>

            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isPromoHomepage}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, isPromoHomepage: e.target.checked }));
                  resetMessages();
                }}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Show on Homepage Promo
            </label>
          </div>

          <Feedback error={submitError} success={submitSuccess} />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                isSubmitting
                  ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                  : 'border border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingVideo ? 'Update Video' : 'Create Video'}
            </button>

            {editingVideo && (
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <XCircle size={16} />
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
            Video Library
          </h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {rows.length} items
          </span>
        </div>

        {listError && (
          <div className="px-6 py-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {listError}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-[180px] place-items-center px-6 py-8 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading videos...
            </span>
          </div>
        ) : rows.length === 0 ? (
          <div className="grid min-h-[180px] place-items-center px-6 py-8 text-sm text-slate-600">
            No videos found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Thumbnail</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Video URL</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Premium</th>
                  <th className="px-4 py-3 text-left">Promo</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const thumb = readFirstString(row, ['thumbnail_url'], '');
                  const rowId = String(row.id);
                  return (
                    <tr key={rowId} className="bg-white">
                      <td className="px-4 py-3">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={readFirstString(row, ['title'], 'video thumbnail')}
                            className="h-14 w-24 rounded-md border border-slate-200 object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {readFirstString(row, ['title'], 'Untitled')}
                      </td>
                      <td className="px-4 py-3">
                        {readFirstString(row, ['video_url'], '') ? (
                          <a
                            href={readFirstString(row, ['video_url'], '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="max-w-[220px] truncate text-indigo-600 hover:text-indigo-800"
                          >
                            Open
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{readFirstString(row, ['category'], 'N/A')}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {readFirstBoolean(row, ['is_premium'], false) ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {readFirstBoolean(row, ['is_promo_homepage'], false) ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(row.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            disabled={isSubmitting || Boolean(deletingId)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600 hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(row)}
                            disabled={isSubmitting || Boolean(deletingId)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600 hover:border-red-200 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === row.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CrudMediaSection({
  isActive,
  sectionTitle,
  sectionDescription,
  tableName,
  bucketName,
  titleColumn = 'title',
  mediaColumn = 'image_url',
  mediaLabel = 'Image',
  mediaRequiredOnCreate = true,
  contentColumn = '',
  contentLabel = 'Content',
  premiumColumn = '',
  premiumLabel = 'Premium',
  premiumHeading = 'Premium',
  categoryColumn = '',
  categoryLabel = 'Category',
  categoryHeading = 'Category',
  categoryOptions = [],
  categoryRequired = false,
  childCategory = null,
}) {
  const normalizedCategoryOptions = useMemo(
    () =>
      (Array.isArray(categoryOptions) ? categoryOptions : [])
        .map((option) => {
          if (typeof option === 'string') {
            const value = option.trim();
            if (!value) return null;
            return { value, label: value };
          }

          const value = String(option?.value || '').trim();
          const label = String(option?.label || value).trim();
          if (!value || !label) return null;
          return { value, label };
        })
        .filter(Boolean),
    [categoryOptions]
  );

  const defaultCategoryValue = '';
  const hasCategory = Boolean(categoryColumn);

  const childCategoryMatchValue = String(childCategory?.matchValue || '').trim();
  const childCategoryLabel = String(childCategory?.label || 'Subcategory').trim() || 'Subcategory';
  const childCategoryIdColumn = String(childCategory?.idColumn || '').trim();
  const childCategoryNameColumn = String(childCategory?.nameColumn || '').trim();
  const childCategoryDisplayColumn = String(childCategory?.displayColumn || '').trim();

  const normalizedChildCategoryOptions = useMemo(
    () =>
      (Array.isArray(childCategory?.options) ? childCategory.options : [])
        .map((option) => {
          const value = String(option?.value || '').trim();
          const name = String(option?.name || '').trim();
          const label = String(option?.label || name).trim();
          if (!value || !label) return null;
          return {
            value,
            name: name || label,
            label,
          };
        })
        .filter(Boolean),
    [childCategory]
  );

  const hasChildCategory =
    hasCategory && Boolean(childCategoryMatchValue) && normalizedChildCategoryOptions.length > 0;

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [editingRow, setEditingRow] = useState(null);
  const [deletingId, setDeletingId] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    isPremium: false,
    existingMediaUrl: '',
    category: defaultCategoryValue,
    childCategoryId: '',
  });
  const [mediaFile, setMediaFile] = useState(null);
  const mediaInputRef = useRef(null);

  const resetMessages = () => {
    setSubmitError('');
    setSubmitSuccess('');
  };

  const clearFileInput = () => {
    setMediaFile(null);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const resetForm = () => {
    setEditingRow(null);
    setForm({
      title: '',
      content: '',
      isPremium: false,
      existingMediaUrl: '',
      category: defaultCategoryValue,
      childCategoryId: '',
    });
    clearFileInput();
    resetMessages();
  };

  const readRowMediaUrl = useCallback(
    (row) =>
      readFirstString(
        row,
        [mediaColumn, 'image_url', 'thumbnail_url', 'media_url', 'file_url', 'cover_url'],
        ''
      ),
    [mediaColumn]
  );

  const resolveChildCategoryOption = useCallback(
    (row) => {
      if (!hasChildCategory) return null;

      const storedId = readFirstString(
        row,
        [childCategoryIdColumn, 'animal_id', 'animalId', 'animal_slug', 'animal_key'],
        ''
      );
      if (storedId) {
        return normalizedChildCategoryOptions.find((option) => option.value === storedId) || null;
      }

      const storedName = readFirstString(
        row,
        [childCategoryNameColumn, childCategoryDisplayColumn, 'animal_name', 'subcategory'],
        ''
      ).toLowerCase();

      if (!storedName) return null;

      return (
        normalizedChildCategoryOptions.find(
          (option) =>
            option.name.toLowerCase() === storedName || option.label.toLowerCase() === storedName
        ) || null
      );
    },
    [
      childCategoryDisplayColumn,
      childCategoryIdColumn,
      childCategoryNameColumn,
      hasChildCategory,
      normalizedChildCategoryOptions,
    ]
  );

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setListError('');
    try {
      const data = await fetchRowsWithFallbackOrder(tableName);
      setRows(data);
    } catch (error) {
      setListError(error?.message || `Failed to load ${sectionTitle.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  }, [sectionTitle, tableName]);

  useEffect(() => {
    if (!isActive) return;
    void loadRows();
  }, [isActive, loadRows]);

  const startEdit = (row) => {
    resetMessages();
    clearFileInput();

    const currentCategory = hasCategory
      ? readFirstString(row, [categoryColumn, 'category'], defaultCategoryValue)
      : '';
    const selectedChildOption = resolveChildCategoryOption(row);

    setEditingRow(row);
    setForm({
      title: readFirstString(row, [titleColumn, 'title', 'name'], ''),
      content: contentColumn
        ? readFirstString(row, [contentColumn, 'content', 'description', 'body', 'text'], '')
        : '',
      isPremium: premiumColumn
        ? readFirstBoolean(row, [premiumColumn, 'is_premium'], false)
        : false,
      existingMediaUrl: readRowMediaUrl(row),
      category: currentCategory || defaultCategoryValue,
      childCategoryId:
        hasChildCategory && currentCategory === childCategoryMatchValue
          ? selectedChildOption?.value || ''
          : '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    const title = form.title.trim();
    if (!title) {
      setSubmitError('Title is required.');
      return;
    }

    if (mediaFile) {
      const validation = validateFile({
        file: mediaFile,
        label: mediaLabel,
        acceptedTypes: IMAGE_ACCEPTED_TYPES,
        acceptedExtensions: IMAGE_ACCEPTED_EXTENSIONS,
        maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
        sizeMessage: `${mediaLabel} is too large. Maximum allowed size is 8 MB.`,
        typeMessage: `Please upload a PNG, JPG/JPEG, or WEBP ${mediaLabel.toLowerCase()}.`,
      });
      if (validation) {
        setSubmitError(validation);
        return;
      }
    }

    const isEditing = Boolean(editingRow?.id);
    if (!isEditing && mediaRequiredOnCreate && !mediaFile) {
      setSubmitError(`${mediaLabel} is required when creating a new ${sectionTitle.slice(0, -1)}.`);
      return;
    }

    const selectedCategory = hasCategory ? form.category.trim() : '';
    if (hasCategory && categoryRequired && !selectedCategory) {
      setSubmitError(`${categoryLabel} is required.`);
      return;
    }

    const selectedChildCategory =
      hasChildCategory && selectedCategory === childCategoryMatchValue
        ? normalizedChildCategoryOptions.find((option) => option.value === form.childCategoryId) || null
        : null;

    if (hasChildCategory && selectedCategory === childCategoryMatchValue && !selectedChildCategory) {
      setSubmitError(`${childCategoryLabel} is required when "${childCategoryMatchValue}" is selected.`);
      return;
    }

    setIsSubmitting(true);

    let uploadedMedia = null;
    const previousMediaUrl = readRowMediaUrl(editingRow);
    let nextMediaUrl = form.existingMediaUrl.trim();

    try {
      if (mediaFile) {
        uploadedMedia = await uploadPublicFile({
          file: mediaFile,
          bucketName,
          folder: tableName,
          acceptedExtensions: IMAGE_ACCEPTED_EXTENSIONS,
          fallbackExtension: 'jpg',
        });
        nextMediaUrl = uploadedMedia.publicUrl;
      }

      if (mediaRequiredOnCreate && !nextMediaUrl) {
        throw new Error(`${mediaLabel} URL is missing. Please upload a file.`);
      }

      const payload = {
        [titleColumn]: title,
      };

      if (contentColumn) {
        payload[contentColumn] = form.content.trim();
      }
      if (premiumColumn) {
        payload[premiumColumn] = Boolean(form.isPremium);
      }
      if (hasCategory) {
        payload[categoryColumn] = selectedCategory || null;
      }
      if (hasChildCategory) {
        if (selectedCategory === childCategoryMatchValue && selectedChildCategory) {
          if (childCategoryIdColumn) {
            payload[childCategoryIdColumn] = selectedChildCategory.value;
          }
          if (childCategoryNameColumn) {
            payload[childCategoryNameColumn] = selectedChildCategory.name;
          }
          if (childCategoryDisplayColumn) {
            payload[childCategoryDisplayColumn] = selectedChildCategory.label;
          }
        } else {
          if (childCategoryIdColumn) {
            payload[childCategoryIdColumn] = null;
          }
          if (childCategoryNameColumn) {
            payload[childCategoryNameColumn] = null;
          }
          if (childCategoryDisplayColumn) {
            payload[childCategoryDisplayColumn] = null;
          }
        }
      }
      if (nextMediaUrl) {
        payload[mediaColumn] = nextMediaUrl;
      }

      const requiredColumns = [titleColumn];
      if (!isEditing && mediaRequiredOnCreate) {
        requiredColumns.push(mediaColumn);
      }
      if (hasCategory && categoryRequired) {
        requiredColumns.push(categoryColumn);
      }

      const mutation = await runMutationWithMissingColumnFallback({
        payload,
        requiredColumns,
        mutate: (nextPayload) =>
          isEditing
            ? supabase.from(tableName).update(nextPayload).eq('id', editingRow.id).select('*').single()
            : supabase.from(tableName).insert(nextPayload).select('*').single(),
      });

      const savedRow = mutation.data;
      if (isEditing) {
        setRows((prev) => prev.map((row) => (row.id === savedRow.id ? savedRow : row)));
      } else {
        setRows((prev) => [savedRow, ...prev]);
      }

      if (isEditing && uploadedMedia && previousMediaUrl && previousMediaUrl !== nextMediaUrl) {
        await removeFileByUrl(bucketName, previousMediaUrl).catch(() => {});
      }

      resetForm();
      setSubmitSuccess(isEditing ? `${sectionTitle.slice(0, -1)} updated.` : `${sectionTitle.slice(0, -1)} created.`);
    } catch (error) {
      if (uploadedMedia?.uploadPath) {
        await removeStoragePath(bucketName, uploadedMedia.uploadPath).catch(() => {});
      }
      setSubmitError(error?.message || `Failed to save ${sectionTitle.toLowerCase()}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id || deletingId) return;
    const itemTitle = readFirstString(row, [titleColumn, 'title', 'name'], 'this item');
    const confirmed = window.confirm(`Delete "${itemTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    resetMessages();
    setDeletingId(row.id);

    try {
      const { error } = await supabase.from(tableName).delete().eq('id', row.id);
      if (error) throw new Error(error.message);

      setRows((prev) => prev.filter((item) => item.id !== row.id));
      if (editingRow?.id === row.id) {
        resetForm();
      }

      await removeFileByUrl(bucketName, readRowMediaUrl(row)).catch(() => {});
      setSubmitSuccess(`${sectionTitle.slice(0, -1)} deleted.`);
    } catch (error) {
      setSubmitError(error?.message || `Failed to delete ${sectionTitle.toLowerCase()}.`);
    } finally {
      setDeletingId('');
    }
  };

  const showChildCategorySelect = hasChildCategory && form.category === childCategoryMatchValue;

  const readRowCategorySummary = useCallback(
    (row) => {
      if (!hasCategory) return '';

      const primary = readFirstString(row, [categoryColumn, 'category'], '');
      if (!primary) return 'N/A';

      if (hasChildCategory && primary === childCategoryMatchValue) {
        const childLabel = readFirstString(
          row,
          [childCategoryDisplayColumn, childCategoryNameColumn, 'subcategory', 'animal_name'],
          ''
        );
        if (childLabel) {
          return `${primary} - ${childLabel}`;
        }
      }

      return primary;
    },
    [
      categoryColumn,
      childCategoryDisplayColumn,
      childCategoryMatchValue,
      childCategoryNameColumn,
      hasCategory,
      hasChildCategory,
    ]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{sectionTitle}</h2>
            <p className="text-sm text-slate-600">{sectionDescription}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadRows()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, title: e.target.value }));
                  resetMessages();
                }}
                disabled={isSubmitting}
                placeholder={`Enter ${sectionTitle.slice(0, -1).toLowerCase()} title`}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {mediaLabel} {editingRow ? '(optional to replace)' : mediaRequiredOnCreate ? '(required)' : '(optional)'}
              </label>
              <input
                ref={mediaInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  setMediaFile(e.target.files?.[0] || null);
                  resetMessages();
                }}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {form.existingMediaUrl && (
                <img
                  src={form.existingMediaUrl}
                  alt={`${sectionTitle} preview`}
                  className="mt-2 h-24 w-40 rounded-lg border border-slate-200 object-cover"
                />
              )}
            </div>
          </div>

          {contentColumn && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{contentLabel}</label>
              <textarea
                value={form.content}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, content: e.target.value }));
                  resetMessages();
                }}
                disabled={isSubmitting}
                rows={5}
                placeholder={`Enter ${sectionTitle.toLowerCase()} ${contentLabel.toLowerCase()}`}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
            </div>
          )}

          {hasCategory && (
            <div className={`grid gap-4 ${showChildCategorySelect ? 'md:grid-cols-2' : ''}`}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{categoryLabel}</label>
                <select
                  value={form.category}
                  onChange={(e) => {
                    const nextCategory = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      category: nextCategory,
                      childCategoryId:
                        hasChildCategory && nextCategory === childCategoryMatchValue
                          ? prev.childCategoryId
                          : '',
                    }));
                    resetMessages();
                  }}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
                >
                  <option value="">Select a category</option>
                  {normalizedCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {showChildCategorySelect && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {childCategoryLabel}
                  </label>
                  <select
                    value={form.childCategoryId}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, childCategoryId: e.target.value }));
                      resetMessages();
                    }}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
                  >
                    <option value="">Select an animal</option>
                    {normalizedChildCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {premiumColumn && (
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isPremium}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, isPremium: e.target.checked }));
                  resetMessages();
                }}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              {premiumLabel}
            </label>
          )}

          <Feedback error={submitError} success={submitSuccess} />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                isSubmitting
                  ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                  : 'border border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingRow ? 'Update' : 'Create'}
            </button>

            {editingRow && (
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <XCircle size={16} />
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
            {sectionTitle} Library
          </h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {rows.length} items
          </span>
        </div>

        {listError && (
          <div className="px-6 py-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {listError}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-[180px] place-items-center px-6 py-8 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </span>
          </div>
        ) : rows.length === 0 ? (
          <div className="grid min-h-[180px] place-items-center px-6 py-8 text-sm text-slate-600">
            No items found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">{mediaLabel}</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  {hasCategory && <th className="px-4 py-3 text-left">{categoryHeading}</th>}
                  {contentColumn && <th className="px-4 py-3 text-left">{contentLabel}</th>}
                  {premiumColumn && <th className="px-4 py-3 text-left">{premiumHeading}</th>}
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const rowId = String(row.id);
                  const rowMediaUrl = readRowMediaUrl(row);
                  return (
                    <tr key={rowId} className="bg-white">
                      <td className="px-4 py-3">
                        {rowMediaUrl ? (
                          <img
                            src={rowMediaUrl}
                            alt={readFirstString(row, [titleColumn, 'title', 'name'], 'media')}
                            className="h-14 w-24 rounded-md border border-slate-200 object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {readFirstString(row, [titleColumn, 'title', 'name'], 'Untitled')}
                      </td>
                      {hasCategory && (
                        <td className="px-4 py-3 text-slate-700">{readRowCategorySummary(row)}</td>
                      )}
                      {contentColumn && (
                        <td className="max-w-[360px] px-4 py-3 text-slate-700">
                          <p className="line-clamp-2">
                            {readFirstString(
                              row,
                              [contentColumn, 'content', 'description', 'body', 'text'],
                              '-'
                            )}
                          </p>
                        </td>
                      )}
                      {premiumColumn && (
                        <td className="px-4 py-3 text-slate-700">
                          {readFirstBoolean(row, [premiumColumn, 'is_premium'], false) ? 'Yes' : 'No'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-slate-600">{formatDate(row.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            disabled={isSubmitting || Boolean(deletingId)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600 hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(row)}
                            disabled={isSubmitting || Boolean(deletingId)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600 hover:border-red-200 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === row.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardOverviewSection({ summary, isLoading, loadError, onRefresh }) {
  const cards = [
    { label: 'Total Users', value: summary.users },
    { label: 'Total Videos', value: summary.videos },
    { label: 'Coloring Pages', value: summary.coloringPages },
    { label: 'Poems', value: summary.poems },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Admin Overview</h2>
            <p className="text-sm text-slate-600">
              Quick summary from Supabase to monitor content and user growth.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh Summary
          </button>
        </div>

        {loadError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {isLoading ? '...' : card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsersSection({ isActive }) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const rowsData = await fetchRowsWithFallbackOrder('profiles');
      setRows(rowsData);
    } catch (error) {
      setLoadError(error?.message || 'Failed to load users from Supabase.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;
    void loadUsers();
  }, [isActive, loadUsers]);

  const filteredRows = rows.filter((row) => {
    const haystack = [
      readFirstString(row, ['email'], ''),
      readFirstString(row, ['full_name', 'name'], ''),
      String(row?.id || ''),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Manage Users</h2>
            <p className="text-sm text-slate-600">
              Live user records fetched directly from Supabase `profiles`.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadUsers()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh Users
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by email, name, or user id"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          />
        </div>

        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-[120px] place-items-center text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading users...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">User ID</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Gems</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row) => (
                  <tr key={String(row.id)} className="bg-white">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{String(row.id)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {readFirstString(row, ['email'], 'N/A')}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {readFirstString(row, ['full_name', 'name'], 'N/A')}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{Number(row?.gems || 0)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(row?.created_at)}</td>
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const AdminDashboard = ({ onBackToSite }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState({
    users: 0,
    videos: 0,
    coloringPages: 0,
    poems: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const isAuthorized = isAdminEmail(user?.email);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError('');

    try {
      const [users, videos, coloringPages, poems] = await Promise.all([
        fetchTableCount('profiles'),
        fetchTableCount('videos'),
        fetchTableCount('coloring_pages'),
        fetchTableCount('poems'),
      ]);

      setSummary({ users, videos, coloringPages, poems });
    } catch (error) {
      setSummaryError(error?.message || 'Failed to load dashboard summary.');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;
    void loadSummary();
  }, [isAuthorized, loadSummary]);

  const handleBackToSite = () => {
    if (onBackToSite) {
      onBackToSite();
      return;
    }
    window.history.pushState({}, '', '/');
    window.location.assign('/');
  };

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-2xl text-white">
        Access Denied - Admin Only
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900">
      <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900 text-white">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Mission Control</p>
          <h1 className="mt-2 text-xl font-semibold">Admin Dashboard</h1>
          <p className="mt-1 text-xs text-slate-400">Manage videos and content libraries.</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-slate-700 bg-slate-800 text-white'
                    : 'border-transparent text-slate-200 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={17} />
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-5">
          <button
            type="button"
            onClick={handleBackToSite}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-white"
          >
            <ArrowLeft size={16} />
            Back to Site
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-7xl px-8 py-8">
          {activeTab === 'dashboard' && (
            <DashboardOverviewSection
              summary={summary}
              isLoading={summaryLoading}
              loadError={summaryError}
              onRefresh={loadSummary}
            />
          )}

          {activeTab === 'users' && <UsersSection isActive />}

          {activeTab === 'videos' && <VideosSection isActive />}

          {activeTab === 'coloring_pages' && (
            <CrudMediaSection
              isActive
              sectionTitle="Coloring Pages"
              sectionDescription="Upload, edit, and delete coloring pages. Files are stored in the `coloring_pages` bucket."
              tableName="coloring_pages"
              bucketName={COLORING_STORAGE_BUCKET}
              titleColumn="title"
              mediaColumn="image_url"
              mediaLabel="Coloring Image"
              mediaRequiredOnCreate
              premiumColumn="is_premium"
              premiumLabel="Mark as Premium"
              premiumHeading="Premium"
            />
          )}

          {activeTab === 'poems' && (
            <CrudMediaSection
              isActive
              sectionTitle="Manage Poems"
              sectionDescription="Full poems CRUD with title/content/image and unified category management in one section."
              tableName="poems"
              bucketName={POEM_STORAGE_BUCKET}
              titleColumn="title"
              mediaColumn="image_url"
              mediaLabel="Poem Cover Image"
              mediaRequiredOnCreate
              contentColumn="content"
              contentLabel="Poem Content"
              premiumColumn="is_free"
              premiumLabel="Mark as Free"
              premiumHeading="Free"
              categoryColumn="category"
              categoryLabel="Select Category"
              categoryHeading="Category"
              categoryOptions={POEM_CATEGORY_OPTIONS}
              categoryRequired
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;



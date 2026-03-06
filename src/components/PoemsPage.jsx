import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const readPoemText = (row) =>
  (row?.content ||
    row?.poem ||
    row?.body ||
    row?.description ||
    row?.text ||
    '')
    .toString()
    .trim();

const readPoemTitle = (row, fallbackIndex) =>
  (row?.title || row?.name || `Poem ${fallbackIndex + 1}`).toString().trim();

const readPoemCategory = (row) => (row?.category || '').toString().trim();
const readPoemSubcategory = (row) =>
  (row?.subcategory || row?.animal_name || '').toString().trim();

export default function PoemsPage() {
  const [poems, setPoems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedPoemId, setSelectedPoemId] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadPoems = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const { data, error } = await supabase
          .from('poems')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        if (!mounted) return;
        const normalized = (data || [])
          .map((row, index) => ({
            id: String(row?.id || `poem-${index + 1}`),
            title: readPoemTitle(row, index),
            content: readPoemText(row),
            imageUrl:
              (row?.image_url || row?.cover_url || row?.thumbnail_url || '').toString().trim() || '',
            category: readPoemCategory(row),
            subcategory: readPoemSubcategory(row),
            createdAt: row?.created_at || null,
          }))
          .filter((row) => row.content);

        setPoems(normalized);
        if (normalized.length > 0) {
          setSelectedPoemId(normalized[0].id);
        }
      } catch (error) {
        if (!mounted) return;
        setLoadError(error?.message || 'Failed to load poems.');
        setPoems([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadPoems();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPoem = useMemo(
    () => poems.find((poem) => poem.id === selectedPoemId) || null,
    [poems, selectedPoemId]
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-950 via-sky-900 to-cyan-800 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-8 text-3xl opacity-90">{'\u{1F426}'}</div>
        <div className="absolute right-10 top-12 text-4xl opacity-90">{'\u{1F43C}'}</div>
        <div className="absolute left-1/4 top-24 text-4xl opacity-80">{'\u{1F338}'}</div>
        <div className="absolute right-1/3 top-32 text-3xl opacity-80">{'\u{1F98B}'}</div>
        <div className="absolute left-14 bottom-28 text-5xl opacity-70">{'\u{1F30A}'}</div>
        <div className="absolute right-8 bottom-24 text-5xl opacity-70">{'\u{1F30C}'}</div>
        <div className="absolute -left-16 top-1/3 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/80">Poems Garden</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Cute Galaxy Poems {'\u{1F426}\u{1F43C}\u{1F338}'}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-cyan-50/90 sm:text-base">
                Browse and read all available poems.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/30 bg-slate-900/50 px-4 py-2 text-sm font-bold">
              <span>{poems.length} poems</span>
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
                className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
              >
                Back Home
              </Link>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mb-5 rounded-2xl border border-rose-200/30 bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-100">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-cyan-100/80">
              Poems Library
            </h2>

            {isLoading ? (
              <div className="grid min-h-[220px] place-items-center text-sm font-semibold text-cyan-100">
                Loading poems...
              </div>
            ) : poems.length === 0 ? (
              <div className="grid min-h-[220px] place-items-center text-sm font-semibold text-cyan-100">
                No poems found.
              </div>
            ) : (
              <div className="space-y-3">
                {poems.map((poem) => {
                  const isActive = selectedPoemId === poem.id;

                  return (
                    <button
                      key={poem.id}
                      type="button"
                      onClick={() => setSelectedPoemId(poem.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-fuchsia-200/70 bg-fuchsia-400/20'
                          : 'border-white/20 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <p className="text-base font-black text-white">{poem.title}</p>
                      {poem.category ? (
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-fuchsia-100/85">
                          {poem.subcategory ? `${poem.category} - ${poem.subcategory}` : poem.category}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs font-semibold text-cyan-100/80">Open poem</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
            {!selectedPoem ? (
              <div className="grid min-h-[320px] place-items-center text-center">
                <div>
                  <div className="mb-3 text-5xl">{'\u{1F338}\u{1F426}\u{1F4D6}'}</div>
                  <p className="text-lg font-black text-white">Select a poem to start reading.</p>
                </div>
              </div>
            ) : (
              <article>
                <h2 className="text-2xl font-black text-white sm:text-3xl">{selectedPoem.title}</h2>
                {selectedPoem.category ? (
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.15em] text-fuchsia-100/85">
                    {selectedPoem.subcategory
                      ? `${selectedPoem.category} - ${selectedPoem.subcategory}`
                      : selectedPoem.category}
                  </p>
                ) : null}
                <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/20 bg-slate-900/40 p-4 text-sm leading-relaxed text-cyan-50 sm:text-base">
                  {selectedPoem.content}
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

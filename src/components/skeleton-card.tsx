export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-9 w-24 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}

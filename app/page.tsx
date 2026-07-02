import Chat from "@/components/chat";

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* ── Header bar ── */}
      <header className="flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
              <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              <path d="M12 14v4M10 8.5 12 6l2 2.5" />
            </svg>
          </div>

          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
              AI COO
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">
              Business Operations Agent
            </p>
          </div>
        </div>
      </header>

      {/* ── Chat area ── */}
      <main className="flex-1 flex overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}

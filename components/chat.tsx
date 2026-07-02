"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

/* ───────────────────────────────────────────
   Types
   ─────────────────────────────────────────── */

interface ToolPart {
  type: string;
  toolName?: string;
  toolCallId?: string;
  args?: unknown;
  result?: unknown;
  state?: string;
  [key: string]: unknown;
}

interface TextPart {
  type: "text";
  text: string;
  [key: string]: unknown;
}

type MessagePart = TextPart | ToolPart;

/* ───────────────────────────────────────────
   Tool Call Card
   ─────────────────────────────────────────── */

function ToolCallCard({ part }: { part: ToolPart }) {
  const [expanded, setExpanded] = useState(false);

  const isComplete =
    part.state === "result" || part.result !== undefined;
  const toolRaw = (part.toolName || "") as string;
  const displayName = toolRaw
    ? toolRaw
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "Tool";

  return (
    <div className="my-2 first:mt-0 last:mb-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all text-left group"
      >
        {/* Icon — spinner or checkmark */}
        <span className="flex-shrink-0 w-5 h-5 relative">
          {!isComplete ? (
            <svg
              className="animate-spin w-5 h-5 text-indigo-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-20"
              />
              <path
                d="M12 2a10 10 0 0 1 9.95 9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-80"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>

        {/* Tool name */}
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {displayName}
        </span>

        {/* Status label */}
        <span
          className={`ml-auto text-xs font-medium ${
            !isComplete ? "text-indigo-500" : "text-emerald-500"
          }`}
        >
          {!isComplete ? "Running…" : "Done"}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded JSON body */}
      {expanded && (
        <div className="mt-1.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30 overflow-x-auto">
          <pre className="text-xs text-zinc-600 dark:text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(
              isComplete ? part.result : part.args,
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────
   Loading Dots
   ─────────────────────────────────────────── */

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-pulse-dot"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────
   Suggestion Card
   ─────────────────────────────────────────── */

const SUGGESTIONS = [
  {
    icon: "📦",
    label: "Check inventory levels",
    query: "Check inventory levels across all warehouses",
  },
  {
    icon: "📊",
    label: "Analyze sales trends",
    query: "Show me the latest sales trends and projections",
  },
  {
    icon: "💰",
    label: "Show expenses",
    query: "What are our current operating expenses?",
  },
  {
    icon: "🏭",
    label: "Evaluate suppliers",
    query: "Evaluate our top suppliers by reliability and cost",
  },
] as const;

/* ───────────────────────────────────────────
   Chat (main export)
   ─────────────────────────────────────────── */

export default function Chat() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, stop, error, regenerate } =
    useChat({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
    });

  const isStreaming =
    status === "submitted" || status === "streaming";
  const isEmpty =
    messages.length === 0 && status === "ready" && !error;

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Refocus input when not streaming ── */
  useEffect(() => {
    if (!isStreaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStreaming]);

  /* ── Submit ── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestion = (query: string) => {
    sendMessage({ text: query });
  };

  /* ── Helpers ── */

  const getTextParts = (parts: MessagePart[] | undefined): TextPart[] =>
    (parts ?? []).filter(
      (p): p is TextPart => p.type === "text",
    );

  const getToolParts = (parts: MessagePart[] | undefined): ToolPart[] =>
    (parts ?? []).filter(
      (p): p is ToolPart =>
        typeof p.type === "string" && p.type.startsWith("tool-"),
    );

  /* ──── Render ──── */

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        {isEmpty ? (
          /* ══════ EMPTY STATE ══════ */
          <div className="flex flex-col items-center justify-center min-h-full text-center px-4">
            {/* Logo icon */}
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                How can I help you today?
              </h2>
              <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Ask me anything about your business operations —
                inventory, sales, expenses, suppliers, and more.
              </p>
            </div>

            {/* Suggestion grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleSuggestion(s.query)}
                  className="flex items-center gap-2.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left group"
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ══════ MESSAGE LIST ══════ */
          <div className="space-y-6">
            {messages.map((m) => {
              const textParts = getTextParts(m.parts as MessagePart[]);
              const toolParts = getToolParts(m.parts as MessagePart[]);

              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-indigo-600 text-white shadow-sm">
                      {textParts.map((p, i) => (
                        <p
                          key={i}
                          className="text-sm leading-relaxed whitespace-pre-wrap"
                        >
                          {p.text}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              }

              /* Assistant message */
              return (
                <div key={m.id}>
                  {/* Tool call cards */}
                  {toolParts.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {toolParts.map((part, i) => (
                        <ToolCallCard
                          key={part.toolCallId ?? i}
                          part={part}
                        />
                      ))}
                    </div>
                  )}

                  {/* Text content */}
                  {textParts.length > 0 && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm">
                        {textParts.map((p, i) => (
                          <p
                            key={i}
                            className="text-sm leading-relaxed whitespace-pre-wrap"
                          >
                            {p.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Loading dots (streaming indicator) ── */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800">
                  <LoadingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="px-4 pb-2">
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <svg
                className="w-4 h-4 text-red-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-sm text-red-700 dark:text-red-300 truncate">
                {error.message ?? "Something went wrong. Please try again."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => regenerate()}
              className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Input area ── */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a business question…"
              disabled={isStreaming}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              autoComplete="off"
            />
          </div>

          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-xl px-4 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm shadow-indigo-500/10"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

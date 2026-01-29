"use client";

import { useState, useRef } from "react";

const MAX_MEMORY = 5;

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState("");
  const [why, setWhy] = useState("");
  const [now, setNow] = useState("");
  const [show, setShow] = useState(false);
  const [hints, setHints] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function decide() {
    if (loading) return;
    if (!input.trim()) return;

    setLoading(true);
    setShow(false);

    const memory = JSON.parse(
      localStorage.getItem("decisionMemory") || "[]"
    );

    const currentInput = input;
    setInput(""); // anti-spam UX

    const res = await fetch("/api/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: currentInput,
        memory,
      }),
    });

    const data = await res.json();

    if (data.ok) {
      setDecision(data.decision);
      setWhy(data.why);
      setNow(data.now);
      setHints(data.hints || []);

      const newMemory = [...memory, data.decision].slice(-MAX_MEMORY);
      localStorage.setItem(
        "decisionMemory",
        JSON.stringify(newMemory)
      );

      setTimeout(() => {
        setShow(true);
        audioRef.current?.play();
      }, 120);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white relative overflow-hidden">

      {/* ambiance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

      {/* carte décision */}
      {show && (
        <div className="max-w-xl mx-auto px-6 pt-16 transition-all">
          <div className="relative bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-white/60" />

            <p className="text-xs tracking-widest text-zinc-400 mb-2">
              DÉCISION
            </p>
            <h2 className="text-xl font-semibold mb-4">
              {decision}
            </h2>

            {why && (
              <p className="text-sm text-zinc-400 mb-4">
                {why}
              </p>
            )}

            <button className="mt-2 px-4 py-2 rounded-lg bg-white text-black font-medium">
              {now}
              {hints.length > 0 && (
  <div className="mt-3 flex gap-2 flex-wrap">
    {hints.map((hint, i) => (
      <button
        key={i}
        onClick={() => {
          setInput(hint);
          decide();
        }}
        className="px-3 py-1 text-xs rounded-full
                   bg-white/10 text-white
                   hover:bg-white/20 transition"
      >
        {hint}
      </button>
    ))}
  </div>
)}

            </button>
          </div>
        </div>
      )}

      {/* loader */}
      {loading && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-1">
          <Dot delay="0s" />
          <Dot delay="0.15s" />
          <Dot delay="0.3s" />
        </div>
      )}

      {/* input fixe */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6">
        <div className="max-w-xl mx-auto flex items-center bg-zinc-900/80 backdrop-blur-xl rounded-full px-4 py-3 border border-white/10 shadow-xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && decide()}
            placeholder="Qu’est-ce qui te bloque ?"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-zinc-500"
          />
          <button
            onClick={decide}
            disabled={loading}
            className={`ml-3 w-10 h-10 rounded-full flex items-center justify-center font-bold transition
              ${
                loading
                  ? "bg-zinc-600 cursor-not-allowed"
                  : "bg-white text-black hover:scale-105"
              }`}
          >
            →
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 text-center mt-2">
          Je décide. Tu agis.
        </p>
      </div>

      {/* son */}
      <audio ref={audioRef} src="/sounds/decision.mp3" preload="auto" />
    </main>
  );
}

/* ===== composants ===== */

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-2 h-2 bg-white rounded-full animate-pulse"
      style={{ animationDelay: delay }}
    />
  );
}

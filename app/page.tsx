"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("Hello from AudioPod. This sentence was turned into speech.");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function speak() {
    setLoading(true);
    setError(null);
    setUrl(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || `Request failed (${res.status})`);
      setUrl(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24 }}>Text to speech</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        maxLength={20000}
        style={{ width: "100%", fontSize: 16, padding: 8, boxSizing: "border-box" }}
      />
      <button
        onClick={speak}
        disabled={loading || !text.trim()}
        style={{ marginTop: 12, padding: "8px 16px", fontSize: 16 }}
      >
        {loading ? "Generating..." : "Speak"}
      </button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {url && <audio src={url} controls autoPlay style={{ display: "block", marginTop: 16, width: "100%" }} />}
      <p style={{ marginTop: 32, fontSize: 14, color: "#666" }}>
        Powered by <a href="https://audiopod.ai">AudioPod</a> ·{" "}
        <a href="https://docs.audiopod.ai">Docs</a>
      </p>
    </main>
  );
}

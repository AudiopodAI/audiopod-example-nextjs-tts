// POST /api/tts  { "text": "..." }  ->  { "url": "https://...mp3", "jobId": 123 }
//
// Text to speech with AudioPod. The API key stays on the server; the browser
// only receives a temporary download URL for the finished audio.

import AudioPod, { AudioPodError, InsufficientBalanceError } from "audiopod";
import type { TTSJob } from "audiopod";

export const runtime = "nodejs"; // the SDK uses Node APIs
export const maxDuration = 60; // seconds; a paragraph finishes well inside this

const MAX_CHARS = 20_000; // per-request limit; split longer text into parts
const VOICE_ID = Number(process.env.TTS_VOICE_ID || 368); // any id from client.voice.list()

let client: AudioPod | undefined;
function audiopod(): AudioPod {
  // Created on first request, so `next build` works without the key set.
  client ??= new AudioPod(); // reads AUDIOPOD_API_KEY
  return client;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { text?: unknown };
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > MAX_CHARS) {
    return Response.json(
      { error: `text is required (max ${MAX_CHARS.toLocaleString("en-US")} characters)` },
      { status: 400 },
    );
  }

  try {
    const api = audiopod();
    // speak() submits the job; waitForCompletion() polls until it is COMPLETED.
    // The submit response carries the id as `job_id`.
    const submitted = (await api.voice.speak({ text, voiceId: VOICE_ID })) as TTSJob & {
      job_id?: number;
    };
    const jobId = submitted.job_id ?? submitted.id;
    const job = await api.voice.waitForCompletion(jobId, 55_000);
    if (!job.output_url) {
      return Response.json({ error: `Job ${jobId} finished without audio` }, { status: 502 });
    }
    return Response.json({ url: job.output_url, jobId });
  } catch (error) {
    if (error instanceof InsufficientBalanceError) {
      return Response.json({ error: error.message }, { status: 402 });
    }
    const status = error instanceof AudioPodError ? 502 : 500;
    return Response.json({ error: (error as Error).message }, { status });
  }
}

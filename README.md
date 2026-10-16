# Text to speech in a Next.js route handler with AudioPod

A Next.js App Router route handler plus a one-page UI that turns text into natural speech, using the [AudioPod](https://audiopod.ai) Node.js SDK (`npm install audiopod`). The API key stays on the server; the browser only gets the finished audio's URL.

## Quickstart

```bash
npm install
echo "AUDIOPOD_API_KEY=ap_..." > .env.local   # create one at https://audiopod.ai/dashboard/account/api-keys
npm run dev                                    # then open http://localhost:3000 and press Speak
curl -X POST localhost:3000/api/tts -H 'Content-Type: application/json' -d '{"text":"Hello from AudioPod"}'
# -> {"url":"https://.../output.mp3?...","jobId":123}
```

The `url` is a temporary link to an MP3 of your text. The page at `/` plays it in an `<audio>` player.

## How it works

The AudioPod code is in [`app/api/tts/route.ts`](app/api/tts/route.ts):

```ts
import AudioPod, { type TTSJob } from "audiopod";

const client = new AudioPod(); // reads AUDIOPOD_API_KEY

// speak() submits the job; its response carries the id as `job_id`.
const submitted = (await client.voice.speak({ text, voiceId: 368 })) as TTSJob & { job_id?: number };
const job = await client.voice.waitForCompletion(submitted.job_id ?? submitted.id);
console.log(job.output_url); // MP3 download URL
```

- `voice.speak()` submits the job; `voice.waitForCompletion()` polls until it is `COMPLETED` and returns `output_url`.
- Set `TTS_VOICE_ID` in `.env.local` to use another voice. List the voices your key can use with `await client.voice.list()`, or browse them at [audiopod.ai/voices](https://audiopod.ai/voices). A voice you cloned works the same way.
- Up to 20,000 characters per request; split longer text into parts.
- `speak()` also takes `speed`, `language` and `audioFormat` (`"mp3"`, `"wav"`, ...).

## Pricing

The free Basic plan includes 5,000 credits, no card required. For paid plans and pay-as-you-go, see [audiopod.ai/pricing](https://audiopod.ai/pricing).

## Links

- AudioPod: https://audiopod.ai
- Docs: https://docs.audiopod.ai (text-to-speech guide: https://docs.audiopod.ai/quickstarts/text-to-speech)
- Node.js SDK: https://www.npmjs.com/package/audiopod

## License

MIT

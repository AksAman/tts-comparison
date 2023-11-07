import { type TTSServiceConfig } from "@/types/tts";
import XIVoiceActors from "./XIVoiceActors";


export const XILabsTTSConfig: TTSServiceConfig = {
  models: ["eleven_monolingual_v1"],
  title: "XI Labs TTS",
  endpoint: "/api/voice/xilabs",
  streamSupported: true,
  voiceActors: XIVoiceActors,
  outputFormats: [
    "mp3_44100",
    "pcm_16000",
    "pcm_22050",
    "pcm_24000",
    "pcm_44100",
  ]
};


export const OpenAITTSConfig: TTSServiceConfig = {
  models: ["tts-1", "tts-1-hd"],
  title: "OpenAI TTS",
  endpoint: "/api/voice/openai",
  streamSupported: true,
  voiceActors: [
    { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
    { id: "shimmer", name: "Shimmer" },
  ],
  outputFormats: [
    "opus",
    "mp3",
    "aac",
    "flac",
  ]
};
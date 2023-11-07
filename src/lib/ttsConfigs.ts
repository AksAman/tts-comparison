import { type TTSServiceConfig } from "@/types/tts";
import XIVoiceActors from "./XIVoiceActors";
import { GET as XILabsClientAPI } from "@/lib/client-tts/xilabs"
import { GET as OpenAIClientAPI } from "@/lib/client-tts/openai"

export const XILabsTTSConfig: TTSServiceConfig = {
  models: ["eleven_monolingual_v1"],
  title: "Eleven Labs",
  key: "xilabs",
  endpoint: "/api/voice/xilabs",
  streamSupported: true,
  voiceActors: XIVoiceActors,
  useClientSide: true,
  outputFormats: [
    "mp3_44100",
    "pcm_16000",
    "pcm_22050",
    "pcm_24000",
    "pcm_44100",
  ],
  defaultOutputFormat: "mp3_44100",
  clientEndpoint: XILabsClientAPI,
  costPerCharacter: 0.24 * 0.001,
  defaultActor: "21m00Tcm4TlvDq8ikWAM",
};


export const OpenAITTSConfig: TTSServiceConfig = {
  models: ["tts-1", "tts-1-hd"],
  title: "OpenAI",
  key: "openai",
  endpoint: "/api/voice/openai",
  streamSupported: true,
  useClientSide: true,
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
  ],
  defaultOutputFormat: "opus",
  clientEndpoint: OpenAIClientAPI,
  costPerCharacter: 0.015 * 0.001,
  defaultActor: "alloy",

};


const configs: TTSServiceConfig[] = [OpenAITTSConfig, XILabsTTSConfig];

export default configs;

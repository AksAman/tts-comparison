import { z } from "zod";

export const OpenAIMessageSchema = z.object({
    id: z.string().optional(),
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
    createdAt: z.coerce.date().optional(),
})

export type OpenAIMessage = z.infer<typeof OpenAIMessageSchema>

export const OpenAIRequestSchema = z.object({
    id: z.string().optional(),
    prompt: z.string().nullable(),
    messages: OpenAIMessageSchema.array(),
    llm: z.string().optional(),
    max_tokens: z.number().nullish(),
})

export const ExportMessageSchema = z.object({
    id: z.string(),
    messages: OpenAIMessageSchema.array(),
})


export const OpenAISpeechSchema = z.object({
    model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1"),
    input: z.string().min(1).max(4096),
    voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).default("alloy"),
    speed: z.number().min(0.25).max(4).default(1),
    response_format: z.enum(["mp3", "opus", "aac", "flac"]).default("opus"),
})

export type OpenAISpeech = z.infer<typeof OpenAISpeechSchema>

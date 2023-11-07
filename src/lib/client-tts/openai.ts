import { OpenAISpeechSchema } from "@/types/openai";

import { type TTSRequest } from "@/types/tts";
import { RequestSchema } from "@/types/xi";



export async function GET(apiKey: string, request: TTSRequest) {
    // const session = await getAuthSession();
    // if (!session) {
    //     return NextResponse.json({ error: "You must be logged in to use this feature" }, { status: 401 })
    // }
    const parseResult = RequestSchema.safeParse(request)
    if (!parseResult.success) {
        console.error(parseResult.error)
        return null
    }
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        method: "POST",
        body: JSON.stringify({
            input: parseResult.data.text,
            voice: parseResult.data.voice,
            model: "tts-1"
        })
    })
    return response;
    // const startMillis = performance.now();
    // return ConvertResponseToStream(response, { startMillis, serviceName: "OpenAI" })
}
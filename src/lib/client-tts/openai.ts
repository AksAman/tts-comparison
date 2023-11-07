
import { type ClientTTSRequest } from "@/types/tts";



export async function GET(request: ClientTTSRequest) {
    // const session = await getAuthSession();
    // if (!session) {
    //     return NextResponse.json({ error: "You must be logged in to use this feature" }, { status: 401 })
    // }
    const voiceId = request.voice ?? "alloy"
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${request.apiKey}`
        },
        method: "POST",
        body: JSON.stringify({
            input: request.text,
            voice: voiceId,
            model: "tts-1",
            response_format: request.outputFormat
        })
    })
    return response;
}
import { LatencyOptimizationMode, RequestSchema, type RequestType } from '@/types/xi';
import ConvertResponseToStream from "@/lib/stream";
import { type TTSRequest } from '@/types/tts';




type VoiceSettings = {
    stability: number,
    similarity_boost: number
}

const defaultXIVoiceSettings: VoiceSettings = {
    stability: 0.1,
    similarity_boost: 0.5
}



const getXILabsRequestData = (text: string, voice_settings: VoiceSettings) => {
    return {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings
    }
}

const getXIHeaders = (apiKey: string) => ({
    accept: 'audio/mpeg',
    "xi-api-key": apiKey,
    "Content-Type": 'application/json'
})

async function getXIResponse({ apiKey, voiceId, text, voice_settings, stream, latencyOptimization = LatencyOptimizationMode.MAX_OPTIMIZATION }: { apiKey: string, voiceId: string; voice_settings: VoiceSettings, text: string; stream?: boolean, latencyOptimization?: LatencyOptimizationMode }) {
    const headers = getXIHeaders(apiKey);
    const streamTag = stream ? "/stream" : "";
    if (stream) { console.log("using stream mode") } else { console.log("using non-stream mode") }
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}${streamTag}?optimize_streaming_latency=${latencyOptimization}`;
    console.log("url", url)
    const body = getXILabsRequestData(text, voice_settings);
    return fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
}



const getStream = ({ response, startMillis }: { response: Response, startMillis: number }) => {
    try {
        // start a stream to xi labs
        const ttsStream = ConvertResponseToStream(response, { startMillis, serviceName: "XILabs" })
        return ttsStream

    } catch (error) {
        let message = "Something went wrong"
        if (error instanceof Error) {
            message = error.message

        }
        console.error("Something went wrong", message)
        return null
    }
}


const getResponse = async ({ apiKey, text, stream, voice: requestVoiceID, }: { apiKey: string } & RequestType) => {
    try {
        // start a stream to xi labs
        const voiceID = requestVoiceID ?? "21m00Tcm4TlvDq8ikWAM"
        const response = await getXIResponse({ apiKey, voiceId: voiceID, voice_settings: defaultXIVoiceSettings, text, stream })
        return response

    } catch (error) {
        let message = "Something went wrong"
        if (error instanceof Error) {
            message = error.message

        }
        console.error("Something went wrong", message)
        return null
    }
}



export async function GET(apiKey: string, request: TTSRequest) {
    // const session = await getAuthSession();
    // if (!session) {
    //     return NextResponse.json({ error: "You must be logged in to use this feature" }, { status: 401 })
    // }
    const parseResult = RequestSchema.safeParse(request)
    if (!parseResult.success) {
        return null
    }

    // const startMillis = performance.now();
    const response = await getResponse({ apiKey, ...parseResult.data })
    if (!response) { return null }

    // const stream =  getStream({ response, startMillis })
    return response;
}
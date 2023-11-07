import { type ClientTTSRequest, } from '@/types/tts';
import { LatencyOptimizationMode } from '@/types/xi';




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

const createElevenLabsURL = (request: ClientTTSRequest) => {
    const streamTag = request.stream ? "/stream" : "";
    const voiceID = request.voice ?? "21m00Tcm4TlvDq8ikWAM"
    const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceID}${streamTag}`);
    url.searchParams.append("optimize_streaming_latency", LatencyOptimizationMode.MAX_OPTIMIZATION.toString());
    url.searchParams.append("output_format", request.outputFormat);
    return url.toString();
}

async function getXIResponse(request: ClientTTSRequest) {
    const headers = getXIHeaders(request.apiKey);
    if (request.stream) { console.log("using stream mode") } else { console.log("using non-stream mode") }
    const url = createElevenLabsURL(request)
    console.log("url", url)
    const body = getXILabsRequestData(request.text, defaultXIVoiceSettings);
    return fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
}



const getResponse = async (request: ClientTTSRequest) => {
    try {
        // start a stream to xi labs
        const response = await getXIResponse(request)
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



export async function GET(request: ClientTTSRequest) {
    // const startMillis = performance.now();
    const response = await getResponse(request)
    if (!response) { return null }

    // const stream =  getStream({ response, startMillis })
    return response;
}
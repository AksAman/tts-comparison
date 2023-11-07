import { LatencyOptimizationMode, RequestSchema, type RequestType } from '@/types/xi';
import { env } from "@/env.mjs";
import ConvertResponseToStream from "@/lib/stream";

import { NextResponse } from 'next/server';

const xi_headers = {
    accept: 'audio/mpeg',
    "xi-api-key": env.XI_LABS_API_KEY,
    "Content-Type": 'application/json'
}

type VoiceSettings = {
    stability: number,
    similarity_boost: number
}

const defaultXIVoiceSettings: VoiceSettings = {
    stability: 0.1,
    similarity_boost: 0.5
}



const getConfig = (): {
    default_voice_id: string,
    xilabs_config: VoiceSettings
} => {
    return {
        default_voice_id: env.XI_LABS_DEFAULT_VOICE_ID,
        xilabs_config: defaultXIVoiceSettings
    }
}



const fakeVoiceURL = "https://aiapi.mavehealth.com/files/voice_notes/64ac49bd-8f4f-4c98-967c-a407d4774ffc/vid_2lvoOPvuqk8JXfzifQq2.mp3"


const getXILabsRequestData = (text: string, voice_settings: VoiceSettings) => {
    return {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings
    }
}

async function getXIResponse({ voiceId, text, voice_settings, stream, latencyOptimization = LatencyOptimizationMode.MAX_OPTIMIZATION }: { voiceId: string; voice_settings: VoiceSettings, text: string; stream?: boolean, latencyOptimization?: LatencyOptimizationMode }) {
    const headers = xi_headers;
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

async function getFakeXIResponse({ stream }: { voiceId: string; voice_settings: VoiceSettings; text: string; stream?: boolean }) {
    if (stream) { console.log("using stream mode") } else { console.log("using non-stream mode") }
    const url: string = fakeVoiceURL;
    return fetch(url);
}


const getStream = async ({ text, stream, isFake, voice: requestVoiceID }: RequestType) => {
    try {
        // start a stream to xi labs
        const startMillis = performance.now();
        const responseGenerator = isFake ? getFakeXIResponse : getXIResponse
        const { default_voice_id, xilabs_config } = getConfig();
        const voiceID = requestVoiceID ?? default_voice_id;
        const response = await responseGenerator({ voiceId: voiceID, voice_settings: xilabs_config, text, stream })
        if (response.status !== 200 && !isFake) {
            console.error("Eleven Labs API returned an error", response.status, response.statusText)
            try {
                const jsonError: unknown = await response.json()
                console.error("Eleven Labs API returned an error", jsonError)
            } catch (error) {
                console.error("Eleven Labs API returned an error", error)
            }
            return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
        }
        const headers = response.headers;
        const status = response.status;
        const ttsStream = ConvertResponseToStream(response, { startMillis, serviceName: "XILabs" })

        return new NextResponse(ttsStream, { headers, status });

    } catch (error) {
        let message = "Something went wrong"
        if (error instanceof Error) {
            message = error.message
        }
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function GET(request: Request) {
    // const session = await getAuthSession();
    // if (!session) {
    //     return NextResponse.json({ error: "You must be logged in to use this feature" }, { status: 401 })
    // }
    const { searchParams } = new URL(request.url)
    const parseResult = RequestSchema.safeParse({
        text: searchParams.get('text'),
        stream: searchParams.get('stream'),
        isFake: searchParams.get('isFake'),
        optimization: parseInt(searchParams.get('optimization') ?? LatencyOptimizationMode.MAX_OPTIMIZATION.toString()),
        voice: searchParams.get('voice') ?? undefined,
    })
    if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error }, { status: 400 })
    }
    return getStream(parseResult.data)
}
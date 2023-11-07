import { OpenAISpeechSchema } from "@/types/openai";
import { env } from "@/env.mjs";

import { NextResponse } from 'next/server';
import ConvertResponseToStream from "@/lib/stream";

const configuration: { apiKey: string } = {
    apiKey: env.OPENAI_API_KEY,
}

export async function GET(request: Request) {
    // const session = await getAuthSession();
    // if (!session) {
    //     return NextResponse.json({ error: "You must be logged in to use this feature" }, { status: 401 })
    // }
    const { searchParams } = new URL(request.url)
    const parseResult = OpenAISpeechSchema.safeParse({
        input: searchParams.get('text'),
        model: searchParams.get('model') ?? undefined,
        voice: searchParams.get('voice') ?? undefined,
        stream: searchParams.get('stream') ?? undefined,
    })
    if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error }, { status: 400 })
    }
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${configuration.apiKey}`
        },
        method: "POST",
        body: JSON.stringify({
            input: parseResult.data.input,
            model: parseResult.data.model,
            voice: parseResult.data.voice,
            response_format: parseResult.data.response_format,
            speed: parseResult.data.speed,

        })
    })
    const headers = response.headers;
    const status = response.status;
    const startMillis = performance.now();
    const stream = ConvertResponseToStream(response, { startMillis, serviceName: "OpenAI" })

    return new NextResponse(stream, { headers, status });
}
import { NextResponse } from 'next/server';

export interface StreamCallbacksAndOptions {
    startMillis?: number;
    onStart?: () => Promise<void>;
    onCompletion?: (data: Uint8Array[]) => Promise<void>;
    onData?: (data: Uint8Array) => Promise<void>;
    serviceName?: string;
}

export default function ConvertResponseToStream(response: Response, options: StreamCallbacksAndOptions): NextResponse {
    let firstRead = true;
    const headers = response.headers;
    const status = response.status;
    const values: Uint8Array[] = [];
    const serviceName = options.serviceName ?? "TTS";
    const nextStream = new ReadableStream<Uint8Array>({
        start(controller) {
            console.log('=============== START ================');
            const reader = response.body!.getReader();
            async function read() {

                const { done, value } = await reader.read();
                if (firstRead) {
                    if (options.startMillis) {
                        console.log(`${options.startMillis} ${serviceName} first byte latency: ${(performance.now() - options.startMillis).toFixed(0)} ms`);
                    }
                    firstRead = false;
                    if (options.onStart) { await options.onStart(); }
                }
                if (done) {
                    if (options.startMillis) {
                        console.log(`${options.startMillis} ${serviceName} complete latency: ${(performance.now() - options.startMillis).toFixed(0)} ms`);
                    }
                    if (options.onCompletion) { await options.onCompletion(values); }
                    controller.close();
                    console.log('==============  END  ==================');
                    return;
                }
                // if (options.onData) { options.onData(value); }

                values.push(value);
                controller.enqueue(value);
                await read();
            }
            void read();
        },
    });
    return new NextResponse(nextStream, { headers, status });
}
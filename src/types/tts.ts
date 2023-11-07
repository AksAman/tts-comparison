

export type ClientTTSRequest = {
    apiKey: string;
    text: string;
    model?: string;
    voice?: string;
    stream: boolean;
    outputFormat: string;
}

export interface TTSServiceConfig {
    useClientSide?: boolean;
    models: string[];
    title: string;
    key: string;
    endpoint: string;
    clientEndpoint?: (request: ClientTTSRequest) => Promise<Response | null>;
    streamSupported: boolean;
    voiceActors: {
        id: string;
        name: string;
    }[];
    defaultActor: string;
    outputFormats: string[];
    defaultOutputFormat: string;
    costPerCharacter?: number;
    inactive?: boolean;
}


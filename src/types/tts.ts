

export type TTSRequest = {
    text: string;
    model?: string;
    voice?: string;
    stream: boolean;
    outputFormat?: string;
}

export interface TTSServiceConfig {
    useClientSide?: boolean;
    models: string[];
    title: string;
    key: string;
    endpoint: string;
    clientEndpoint?: (apiKey: string, request: TTSRequest) => Promise<Response | null>;
    streamSupported: boolean;
    voiceActors: {
        id: string;
        name: string;
    }[];
    outputFormats: string[];
    costPerCharacter?: number;
}


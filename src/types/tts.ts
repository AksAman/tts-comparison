export interface TTSServiceConfig {
    models: string[];
    title: string;
    endpoint: string;
    streamSupported: boolean;
    voiceActors: {
        id: string;
        name: string;
    }[];
    outputFormats: string[];
}

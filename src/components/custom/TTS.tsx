"use client";

import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import GeneralSelector from "@/components/utilities/GeneralSelector";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { type TTSServiceConfig } from "@/types/tts";
import React from "react";
import { toast } from "sonner";

interface TTSProps {
  className?: string;
  usingOpenAI?: boolean;
  text: string;
  config: TTSServiceConfig;
}

const getServerAudioURL = ({
  endpoint,
  text,
  stream,
  voiceID: _voiceID,
}: {
  endpoint: string;
  text: string;
  stream: boolean;
  voiceID?: string;
}) => {
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.append("text", text);
  url.searchParams.append("stream", stream.toString());
  if (_voiceID) {
    url.searchParams.append("voice", _voiceID);
  }
  return url.toString();
};

const getClientAudioURL = async (
  apiKey: string,
  text: string,
  config: TTSServiceConfig,
  streaming: boolean,
  voiceID?: string,
  outputFormat?: string,
) => {
  if (!config.clientEndpoint) {
    console.error("Client Endpoint not found");
    return null;
  }
  const ttsResponse = await config.clientEndpoint({
    apiKey,
    text,
    voice: voiceID ?? config.defaultActor,
    stream: streaming,
    outputFormat: outputFormat ?? config.defaultOutputFormat,
  });
  if (!ttsResponse) {
    console.error("TTS Response is null");
    toast.error(`No response from ${config.title}`);
    return null;
  }

  if (!ttsResponse.ok) {
    toast.error(`Response from ${config.title}: ${await ttsResponse.text()}`);
    if (ttsResponse.status === 401) {
      toast.error("Invalid API Key");
    }
    return null;
  }

  const blob = await ttsResponse.blob();
  return URL.createObjectURL(blob);
};

const TTS: React.FC<TTSProps> = ({ className, config, text }) => {
  const [streaming, setStreaming] = React.useState(config.streamSupported);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [voiceID, setVoiceID] = useLocalStorage<string | undefined>(
    `${config.key}-voice-id`,
    config.voiceActors[0]?.id,
  );
  const [outputFormat, setOutputFormat] = useLocalStorage<string | undefined>(
    `${config.key}-output-format`,
    config.outputFormats[0],
  );
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const [logs, setLogs] = React.useState<string[]>([]);
  const [requestedAt, setRequestedAt] = React.useState(-1);
  const [startedAt, setStartedAt] = React.useState(-1);
  const [endedAt, setEndedAt] = React.useState(-1);
  const [apiKey, setAPIKey] = useLocalStorage<string | null>(
    `${config.key}-api-key`,
    null,
  );

  const useClientSide = config.useClientSide && config.clientEndpoint;

  React.useEffect(() => {
    addLog(`Initialized ${config.title} TTS`);
    // create array of 10 numbers

    return () => {
      setLogs([]);
    };
  }, [config.title]);

  const addLog = (log: string) => {
    const time = new Date().toLocaleTimeString();
    const message = `[${time}]: ${log}`;
    setLogs((prev) => [...prev, message]);
  };

  React.useEffect(() => {
    if (requestedAt > 0 && startedAt > 0) {
      addLog(`First byte: ${(startedAt - requestedAt) / 1000}s`);
    }
  }, [requestedAt, startedAt]);

  React.useEffect(() => {
    if (startedAt > 0 && endedAt > 0) {
      addLog(`Duration: ${(endedAt - startedAt) / 1000}s`);
    }
  }, [startedAt, endedAt]);

  //   add event listener to the audio element
  React.useEffect(() => {
    const _audioRef = audioRef.current;
    const onAudioEnded = () => {
      setIsPlaying(false);
      addLog("Ended audio");
      setEndedAt(Date.now());
    };
    audioRef.current?.addEventListener("ended", onAudioEnded);

    audioRef.current?.addEventListener("loadeddata", (_) => {
      addLog("Playing audio");
      setStartedAt(Date.now());
    });
    return () => {
      _audioRef?.removeEventListener("ended", onAudioEnded);
    };
  }, [audioRef]);

  const resetLogState = () => {
    setRequestedAt(-1);
    setStartedAt(-1);
    setEndedAt(-1);
    setLogs([]);
    addLog(`Initialized ${config.title} TTS`);
  };

  const onAddAudioClicked = async () => {
    if (!audioRef.current) {
      console.error("Audio element not found");
      return;
    }

    // resetLogState();
    setRequestedAt(-1);
    setStartedAt(-1);
    setEndedAt(-1);
    if (!text) return;
    addLog("--------------------------");

    let url: string | null = null;

    if (config.useClientSide && config.clientEndpoint && apiKey) {
      url = await getClientAudioURL(apiKey, text, config, streaming, voiceID);
    } else {
      url = getServerAudioURL({
        endpoint: config.endpoint,
        text,
        stream: streaming,
        voiceID,
      });
    }

    if (!url) {
      console.error("URL is null");
      return;
    }
    // pause the audio if it's playing
    if (!audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      setIsPlaying(false);
      return;
    }

    audioRef.current.src = url;
    setRequestedAt(Date.now());
    await audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div
      className={cn(
        "flex min-h-full flex-col gap-2  rounded-md  border bg-slate-700 p-2 text-white",
        className,
      )}
    >
      {useClientSide && (
        <Input
          className="bg-gray-200 text-black"
          placeholder={`${config.title} API Key`}
          type="password"
          name="hidden"
          role="presentation"
          autoComplete="off"
          value={apiKey ?? ""}
          onChange={(v) => {
            setAPIKey(v.target.value);
          }}
        />
      )}
      <div className="flex items-center justify-between">
        <h2 className="py-2 text-center font-bold tracking-wide">
          {config.title}
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="" className=" text-sm text-gray-200">
            Actor
          </label>
          <GeneralSelector
            className=" text-black"
            items={config.voiceActors.map((v) => {
              return { id: v.id, title: v.name };
            })}
            value={voiceID}
            onValueChange={(v) => {
              setVoiceID(v);
              addLog(`Changed voice to ${v}`);
            }}
          />
        </div>
      </div>
      <audio src="" ref={audioRef}></audio>
      {/* <div className=" p-2 text-gray-300">{text}</div> */}
      <div className="flex flex-row flex-wrap items-center justify-end gap-4">
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="" className=" text-xs text-gray-200">
              Output Format
            </label>
            <GeneralSelector
              className="text-black"
              items={config.outputFormats.map((v) => {
                return { id: v, title: v };
              })}
              value={outputFormat}
              onValueChange={(v) => {
                setOutputFormat(v);
                addLog(`Changed output format to ${v}`);
              }}
            />
          </div>
        </div>
      </div>
      {config.costPerCharacter && (
        <div className="flex gap-2 text-sm text-gray-400">
          <span>
            Approximate Cost per character: ${config.costPerCharacter}
          </span>
          <span>
            Total cost: ${(config.costPerCharacter * text.length).toFixed(5)}
          </span>
        </div>
      )}
      <Button
        className={
          `mt-4 rounded-md bg-black px-4 py-2 text-white disabled:bg-gray-600` +
          (isPlaying ? "bg-red-500 hover:bg-red-400" : "")
        }
        onClick={onAddAudioClicked}
        disabled={useClientSide && !apiKey}
      >
        {!isPlaying ? "Play Audio ▶️" : "Stop Audio ⏹️"}
      </Button>
      {useClientSide && !apiKey && (
        <div className="text-sm text-red-400">API Key not set</div>
      )}
      {logs.length > 0 && (
        <div className="relative min-h-[2rem]">
          <Button
            variant={"link"}
            className="absolute right-2 top-0 h-6   text-gray-400 hover:text-gray-500"
            onClick={resetLogState}
          >
            Reset Logs
          </Button>
          <ol className="custom-scrollbar flex max-h-[200px] flex-col-reverse overflow-y-auto">
            {logs.map((log, i) => (
              <li
                key={i}
                className="list-inside list-decimal text-sm text-gray-400"
              >
                {log}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default TTS;

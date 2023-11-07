"use client";

import GeneralSelector from "@/components/utilities/GeneralSelector";
import React from "react";
import { cn } from "@/lib/utils";
import { type TTSServiceConfig } from "@/types/tts";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
interface TTSProps {
  className?: string;
  usingOpenAI?: boolean;
  text: string;
  config: TTSServiceConfig;
}
const getAudioURL = ({
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

const TTS: React.FC<TTSProps> = ({ className, config, text }) => {
  const [streaming, setStreaming] = React.useState(config.streamSupported);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [voiceID, setVoiceID] = useLocalStorage<string | undefined>(
    `${config.title}-voice-id`,
    config.voiceActors[0]?.id,
  );
  const [outputFormat, setOutputFormat] = useLocalStorage<string | undefined>(
    `${config.title}-output-format`,
    config.outputFormats[0],
  );
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const [logs, setLogs] = React.useState<string[]>([]);
  const [requestedAt, setRequestedAt] = React.useState(-1);
  const [startedAt, setStartedAt] = React.useState(-1);
  const [endedAt, setEndedAt] = React.useState(-1);

  React.useEffect(() => {
    addLog("Initialized");
    addLog(config.title);

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
    addLog("Initialized");
    addLog(config.title);
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
    const url = getAudioURL({
      endpoint: config.endpoint,
      text,
      stream: streaming,
      voiceID,
    });
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
        "flex min-h-full flex-col rounded-md  border  bg-slate-700 p-2 text-white",
        className,
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <h2 className="py-2 text-center font-bold tracking-wide">
          {config.title}
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="" className=" text-sm text-gray-200">
            Actor
          </label>
          <GeneralSelector
            className="text-black"
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
      <div className="bg-gray-600 p-2 text-gray-300">{text}</div>
      <div className="my-2 flex flex-row flex-wrap items-center justify-between gap-4">
        {config.streamSupported ? (
          <div className="flex flex-row items-center justify-center gap-2">
            <Checkbox
              className="h-6 w-6"
              id={`${config.title}-endpoint`}
              defaultChecked={streaming}
              onCheckedChange={(checked) => {
                console.log(checked);
                setStreaming(!!!checked.valueOf());
              }}
            />
            <label htmlFor={`${config.title}-endpoint`}>Streaming</label>
          </div>
        ) : (
          <div className="text-sm text-red-400">Streaming not supported</div>
        )}
        <div className="flex items-center gap-1">
          <label htmlFor="" className="w-16 text-sm text-gray-200">
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
        <Button
          variant={"link"}
          className="text-gray-400 hover:text-gray-500"
          onClick={resetLogState}
        >
          Reset Logs
        </Button>
      </div>
      <Button
        className={
          `my-2 rounded-md bg-black px-4 py-2 text-white disabled:bg-gray-600 ` +
          (isPlaying ? "bg-red-500 hover:bg-red-400" : "")
        }
        onClick={onAddAudioClicked}
      >
        {!isPlaying ? "Play Audio" : "Stop Audio"}
      </Button>
      {logs.length > 0 && (
        <ol className="flex flex-col-reverse">
          {logs.map((log, i) => (
            <li
              key={i}
              className="list-inside list-decimal text-sm text-gray-400"
            >
              {log}
            </li>
          ))}
        </ol>
      )}
      {/* {startedAt > 0 && requestedAt > 0 && (
        <p>First byte: {(startedAt - requestedAt) / 1000}s</p>
      )}
      {startedAt > 0 && endedAt > 0 && (
        <p>Duration: {(endedAt - startedAt) / 1000}s</p>
      )} */}
    </div>
  );
};

export default TTS;

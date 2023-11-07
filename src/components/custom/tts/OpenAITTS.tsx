"use client";
import { LatencyOptimizationMode } from "@/types/xi";

import GeneralSelector from "@/components/utilities/GeneralSelector";
import React from "react";
import { cn } from "@/lib/utils";
interface DemoAudioProps {
  className?: string;
  streaming?: boolean;
}

const OpenAITTS: React.FC<DemoAudioProps> = (props) => {
  const [streaming, setStreaming] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [optimization, setOptimization] =
    React.useState<LatencyOptimizationMode>(
      LatencyOptimizationMode.MAX_OPTIMIZATION,
    );
  const [logMessage, setLogMessage] = React.useState("");
  const [requestedAt, setRequestedAt] = React.useState(-1);
  const [startedAt, setStartedAt] = React.useState(-1);
  const [endedAt, setEndedAt] = React.useState(-1);

  const endpoint = "/api/voice";

  //   add event listener to the audio element
  React.useEffect(() => {
    const _audioRef = audioRef.current;
    const onAudioEnded = () => {
      setIsPlaying(false);
      setLogMessage("Ended audio");
      setEndedAt(Date.now());
    };
    audioRef.current?.addEventListener("ended", onAudioEnded);

    audioRef.current?.addEventListener("loadeddata", (_) => {
      setLogMessage("Playing audio");
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
    setLogMessage("");
  };
  const onAddAudioClicked = async () => {
    if (!audioRef.current) return;

    resetLogState();
    const text = inputRef.current?.value;
    if (!text) return;
    const url = getAudioURL(text, streaming, optimization);
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

  const getAudioURL = (
    text: string,
    stream: boolean,
    optimization: LatencyOptimizationMode,
  ) => {
    const baseURL = endpoint;
    const url = new URL(baseURL, window.location.origin);
    url.searchParams.append("text", text);
    url.searchParams.append("stream", stream.toString());
    url.searchParams.append("optimization", optimization.toString());
    return url.toString();
  };

  return (
    <div
      className={cn(
        "flex min-h-full flex-col rounded-md  border  bg-slate-800 p-2 text-white",
        props.className,
      )}
    >
      <h2 className="py-2 text-center font-bold tracking-wide">
        Using ElevenLabs
      </h2>
      <audio src="" ref={audioRef}></audio>
      <textarea
        name=""
        id=""
        cols={20}
        rows={4}
        className="my-2 rounded-sm bg-gray-600 p-2 text-white"
        placeholder="Enter your text here"
        defaultValue={"Paragraphs are the building blocks of papers."}
        ref={inputRef}
      ></textarea>
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="flex flex-row items-center justify-center gap-2">
          <input
            type="checkbox"
            className="h-6 w-6 rounded-md border-none outline-none"
            name="streaming"
            id="streaming"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
          />
          <label htmlFor="streaming">Streaming</label>
        </div>
        <button
          className={
            `my-2 rounded-md bg-black px-4 py-2 text-white disabled:bg-gray-600 ` +
            (isPlaying ? "bg-red-500" : "")
          }
          onClick={onAddAudioClicked}
        >
          {!isPlaying ? "Play Audio" : "Stop Audio"}
        </button>

        <div>
          <GeneralSelector
            className="text-black"
            items={Object.entries(LatencyOptimizationMode)
              .filter(
                ([k, v]) => typeof k === "string" && typeof v === "number",
              )
              .map(([k, v]) => {
                return { id: v.toString(), title: k };
              })}
            value={optimization.toString()}
            onValueChange={(v) => {
              const mode = parseInt(v);
              if (isNaN(mode)) return;
              setOptimization(mode);
              console.log(
                getAudioURL(inputRef.current?.value ?? "", streaming, mode),
              );
            }}
          />
        </div>
      </div>
      <p>Endpoint: {endpoint}</p>
      <button
        className={
          `my-2 rounded-md bg-black px-4 py-2 text-white disabled:bg-gray-600 ` +
          (isPlaying ? "bg-red-500" : "")
        }
        onClick={resetLogState}
      >
        Reset Logs
      </button>
      {logMessage.length > 0 && <p>{logMessage}</p>}
      {startedAt > 0 && requestedAt > 0 && (
        <p>First byte: {(startedAt - requestedAt) / 1000}s</p>
      )}
      {startedAt > 0 && endedAt > 0 && (
        <p>Duration: {(endedAt - startedAt) / 1000}s</p>
      )}
    </div>
  );
};

export default OpenAITTS;

"use client";

import TTS from "@/components/custom/TTS";
import ttsConfigs from "@/lib/ttsConfigs";
import React from "react";

export default function HomePage() {
  const [currentText, setCurrentText] = React.useState("Hello!");

  return (
    <main className="flex h-full w-full flex-row items-center justify-between  p-4">
      {/* sidebar */}
      <div className="flex h-full flex-col items-center justify-center "></div>
      <div className="bg-slate-s h-full w-full rounded-md p-3  md:mx-12">
        <h2 className="pb-2 text-center text-2xl">TTS Comparison</h2>
        <textarea
          name=""
          id=""
          cols={20}
          rows={4}
          className="my-2 w-full rounded-sm bg-gray-600 p-2 text-white"
          placeholder="Enter your text here"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
        ></textarea>
        <div className=" grid  h-[calc(100%-4rem)] gap-4  md:grid-cols-2">
          {ttsConfigs.map((config) => {
            return (
              <TTS
                key={config.key}
                className="w-full"
                text={currentText}
                config={config}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

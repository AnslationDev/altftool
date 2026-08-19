"use client";

import { useState, useRef, useEffect } from "react";
import {Mic, Square, Play} from "lucide-react";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      setError("");
      // Revoke the previous recording's object URL before replacing it,
      // otherwise every re-recording leaks the earlier blob for the rest
      // of the tab's lifetime (matches ImageUploader.jsx's pattern).
      setAudioURL((prevUrl) => {
        if (typeof prevUrl === "string" && prevUrl.startsWith("blob:")) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      //  IMPORTANT RESET
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Mic access denied or not supported");
    }
  };

  // Revoke the current recording's object URL when this component unmounts,
  // otherwise the last blob for the session is never released.
  useEffect(() => {
    return () => {
      if (typeof audioURL === "string" && audioURL.startsWith("blob:")) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Stopping the MediaRecorder does not release the underlying mic
    // tracks — without this the browser's mic-in-use indicator stays lit
    // until the whole tab closes.
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="flex items-center gap-3 flex-wrap">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 mb-2 rounded-xl bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition cursor-pointer"
          >
        <Mic size={16} />
  Record
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-3 py-2 mb -2 rounded-lg bg-red-500 text-white text-sm  font-medium hover:opacity-90 transition cursor-pointer"
          >
            <Square size={16} />
  Stop
          </button>
        )}


        {/* 🎯 Recording Indicator */}
        {isRecording && (
          <span className="text-sm font-bold text-red-500 animate-pulse">
            <Mic size={14} />
  Recording...
          </span>
        )}
      </div>

      {/* Audio Player */}
      {audioURL && (
        
        <audio controls className="w-full sm:w-auto" key={audioURL}>
          <source src={audioURL} type="audio/webm" />
        </audio>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
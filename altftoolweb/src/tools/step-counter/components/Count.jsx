"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  MapPin,
  Smartphone,
} from "lucide-react";

const Count = ({ onBack }) => {
  const [steps, setSteps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionStart, setSessionStart] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const lastStepTime = useRef(0);

  const CALORIES_PER_STEP = 0.04;
  const METERS_PER_STEP = 0.762;
  const STEP_GOAL = 10000;

  useEffect(() => {
    if (isActive && !sessionStart) {
      setSessionStart(Date.now());
    }
    if (!isActive) {
      setSessionStart(null);
    }
  }, [isActive, sessionStart]);

  useEffect(() => {
    const handleMotion = (event) => {
      if (!isActive) return;

      const acc = event.acceleration;
      const accG = event.accelerationIncludingGravity;

      let magnitude = 0;
      let threshold = 0;

      if (acc && acc.x !== null) {
        magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        threshold = 4.0;
      } else if (accG) {
        magnitude = Math.sqrt(
          accG.x * accG.x + accG.y * accG.y + accG.z * accG.z,
        );
        threshold = 15.0;
      }

      if (magnitude > threshold) {
        const now = Date.now();
        if (now - lastStepTime.current > 500) {
          setSteps((prev) => prev + 1);
          lastStepTime.current = now;
        }
      }
    };

    if (isActive) {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isActive]);

  const handleStepClick = () => {
    if (isActive) setSteps((prev) => prev + 1);
  };

  const toggleTimer = async () => {
    if (!isActive) {
      setErrorMsg("");

      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission === "granted") {
            setIsActive(true);
          } else {
            setErrorMsg("Motion permission denied. Please enable in settings.");
          }
        } catch {
          setIsActive(true);
        }
      } else {
        setIsActive(true);
      }
    } else {
      setIsActive(false);
    }
  };

  const reset = () => {
    setIsActive(false);
    setSteps(0);
    setSessionStart(null);
    setErrorMsg("");
  };
  const StatsRow = ({ calories, distance }) => {
    return (
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={22} />}
          value={calories}
          label="Kcal Burned"
          color="#f97316"
          bg="rgba(249,115,22,0.1)"
        />

        <StatCard
          icon={<MapPin size={22} />}
          value={distance}
          label="Km Distance"
          color="#6366f1"
          bg="rgba(99,102,241,0.1)"
        />
      </div>
    );
  };

  const StatCard = ({ icon, value, label, color, bg }) => {
    return (
      <div
        className="
      rounded-2xl bg-(--background) border border-gray-200 
      p-3 sm:p-4 flex flex-col items-center justify-center
      transition hover:-translate-y-1 hover:border-(--primary)
    "
        style={{ borderColor: "var(--border)" }}
      >
        {/* Icon Circle */}
        <div
          className="p-2.5 rounded-full mb-2 flex"
          style={{ backgroundColor: bg, color }}
        >
          {icon}
        </div>

        {/* Value */}
        <div
          className="font-extrabold text-(--foreground) mb-1"
          style={{ fontSize: "1.5rem" }}
        >
          {value}
        </div>

        {/* Label */}
        <div className="text-xs font-semibold uppercase text-(--muted-foreground)">
          {label}
        </div>
      </div>
    );
  };

  const calories = (steps * CALORIES_PER_STEP).toFixed(1);
  const distance = ((steps * METERS_PER_STEP) / 1000).toFixed(2);
  const progress = Math.min((steps / STEP_GOAL) * 100, 100);

  return (
    <div
      className="
      flex justify-center items-center  py-4 sm:py-8 px-3
      bg-[linear-gradient(135deg,var(--background),var(--muted))]
    "
    >
      <div className="w-full max-w-sm md:max-w-md lg:max-w-2xl space-y-4">
        {/* MAIN CARD */}
        <div
          className="
          relative w-full rounded-2xl sm:rounded-3xl bg-(--background)
          border border-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]
          backdrop-blur p-4 sm:p-6
        "
        >
          <button
            onClick={onBack}
            className=" bg-(--muted)
    mb-3 px-3 py-2 rounded-lg
    border border-gray-300 text-sm font-semibold
    hover:bg-gray-100 transition cursor-pointer
  "
          >
            ← Back
          </button>
          {/* STATUS CHIP */}
          <div className="absolute top-4 right-4">
            <div
              className={`
              flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold 
              ${isActive
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-600"
                }
            `}
            >
              {isActive ? (
                <Play size={12} fill="currentColor" />
              ) : (
                <Pause size={12} fill="currentColor" />
              )}
              {isActive ? "Active" : "Paused"}
            </div>
          </div>

          {/* GOAL */}
          <p className="uppercase tracking-widest text-xs font-semibold text-gray-500 text-center mb-1">
            Goal: {STEP_GOAL.toLocaleString()}
          </p>

          {/* CIRCLE WRAPPER */}
          <div className="relative w-50 h-50 sm:w-60 sm:h-60 mx-auto my-6">
            {/* Pulse effect */}
            {isActive && (
              <div
                className="
                absolute inset-0 rounded-full bg-blue-500/20 animate-pulse
              "
              ></div>
            )}

            {/* INTERACTIVE BUTTON */}
            <button
              onClick={handleStepClick}
              className={`
              relative z-10 w-full h-full rounded-full flex flex-col items-center justify-center
              transition-all
              ${isActive
                  ? "bg-white shadow-[inset_0_4px_20px_rgba(0,0,0,0.03),0_12px_30px_-10px_rgba(59,130,246,0.25)]"
                  : "bg-gray-100 shadow-inner"
                }
            `}
            >
              <h1
                className={`
                font-extrabold tracking-tight 
                ${isActive
                    ? "bg-linear-to-r from-gray-800 to-blue-500 bg-clip-text text-transparent"
                    : "text-gray-500"
                  }
                text-4xl sm:text-5xl
              `}
              >
                {steps.toLocaleString()}
              </h1>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                Steps Taken
              </p>
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full max-w-xs mx-auto mb-4">
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>Progress</span>
              <span className="text-blue-600">{Math.round(progress)}%</span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="
                h-full bg-[linear-gradient(90deg,#3b82f6,#60a5fa)]
                rounded-full transition-all
              "
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* MOBILE HINT OR ERROR */}
          {errorMsg ? (
            <div className="w-full p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm text-center mb-3">
              {errorMsg}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs opacity-70 mb-4">
              <Smartphone size={14} />
              Use on mobile to auto-detect walking.
            </div>
          )}

          {/* CONTROLS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={toggleTimer}
              className={`
              flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-base
              transition shadow-sm cursor-pointer
              ${isActive
                  ? "bg-gray-900 text-white"
                  : "bg-(--primary) text-(--primary-foreground)"
                }
            `}
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
              {isActive ? "Pause" : "Start"}
            </button>

            <button
              onClick={reset}
              className="
              flex items-center justify-center gap-2 py-3 rounded-xl font-semibold 
              text-base border-2 border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer
            "
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>

        {/* Stats Cards (Cal, Distance) */}
        <StatsRow calories={calories} distance={distance} />
      </div>
    </div>
  );
};

export default Count;

"use client";
import { Phone, MessageSquare, Clock, PhoneCall, Volume2, MicOff, Plus, Video, Grid } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import { DeviceFrame } from "../DeviceFrame";
import ImageViewer from "../../ui/image-viewer";

function FakeCallPreview() {
  const { callerName, callerNumber, avatar, device, theme } = useEditor();
  const isIos = device === "iphone";

  // Gradient background for the call screen
  const bgCall = "linear-gradient(to bottom, #111e29, #090f14)";

  return (
    <DeviceFrame>
      <div
        className="relative flex flex-col justify-between p-6 pb-12 font-sans select-none text-white text-center"
        style={{ background: bgCall, minHeight: 560 }}
      >
        {/* Caller Avatar Overlay / Background */}
        {avatar && (
          <div className="absolute inset-0 z-0 opacity-20 filter blur-xl">
            <ImageViewer src={avatar} alt="Background avatar" className="h-full w-full object-cover" platform="Fake Call" />
          </div>
        )}

        {/* Top Info Section */}
        <div className="relative z-10 mt-12">
          <h2 className="text-2xl font-bold leading-tight">{callerName || "Unknown Caller"}</h2>
          <p className="text-xs opacity-75 mt-1 tracking-wider uppercase text-neutral-400">
            {callerNumber || "mobile"}
          </p>
        </div>

        {/* Mid Avatar Image */}
        <div className="relative z-10 flex justify-center">
            <div className="h-28 w-28 rounded-full overflow-hidden border border-white/20 bg-neutral-800 shadow-2xl flex items-center justify-center">
            {avatar ? (
              <ImageViewer src={avatar} alt="Caller avatar" className="h-full w-full object-cover" platform="Call" />
            ) : (
              <PhoneCall className="h-10 w-10 text-neutral-400" />
            )}
          </div>
        </div>

        {/* Action Buttons depending on OS */}
        {isIos ? (
          /* iOS Call Screen Buttons */
          <div className="relative z-10 space-y-8">
            <div className="flex justify-around text-[10px] opacity-80 px-4">
              <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-90">
                <Clock className="h-5 w-5" />
                <span>Remind Me</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-90">
                <MessageSquare className="h-5 w-5" />
                <span>Message</span>
              </div>
            </div>

            {/* Answer/Decline Row */}
            <div className="flex justify-around items-center px-4">
              <div className="flex flex-col items-center gap-2">
                <button className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-700 cursor-pointer">
                  <Phone className="h-6 w-6 text-white rotate-[135deg]" />
                </button>
                <span className="text-[11px] opacity-75">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:bg-green-600 cursor-pointer">
                  <Phone className="h-6 w-6 text-white" />
                </button>
                <span className="text-[11px] opacity-75">Accept</span>
              </div>
            </div>
          </div>
        ) : (
          /* Android Call Screen Buttons */
          <div className="relative z-10 space-y-8">
            <div className="grid grid-cols-3 gap-y-6 text-[10px] text-neutral-300">
              <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                <MicOff className="h-4 w-4" />
                <span>Mute</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                <Grid className="h-4 w-4" />
                <span>Keypad</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                <Volume2 className="h-4 w-4" />
                <span>Speaker</span>
              </div>
            </div>

            <div className="flex justify-center gap-10">
              <button className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-700 cursor-pointer">
                <Phone className="h-6 w-6 text-white rotate-[135deg]" />
              </button>
              <button className="h-14 w-14 rounded-full bg-[#00639b] flex items-center justify-center shadow-lg hover:bg-opacity-90 cursor-pointer">
                <Phone className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DeviceFrame>
  );
}

export { FakeCallPreview };

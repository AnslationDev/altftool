"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import modal from "../(assets)/Modal.png"
import { Copy , X , Check} from "lucide-react";
import { createPortal } from "react-dom";

function CouponModal({ isOpen, onClose, link, couponCode}) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

const handleCopy = async () => {
  if (!couponCode) return;

  await navigator.clipboard.writeText(couponCode);
  setCopied(true);

  setTimeout(() => setCopied(false), 1500);
};

  // Progress animation + redirect
useEffect(() => {
  if (!isOpen) return;

  const resetProgress = setTimeout(() => setProgress(0), 0);

  let interval;

  // ⏳ Delay before starting progress
  const delay = setTimeout(() => {
    interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
    }, 50);
  }, 1000);

  // 🎯 Redirect + close AFTER full duration
  const totalTime = 1000 + 2500; // delay + progress time

  const redirectTimeout = setTimeout(() => {
    window.open(link, "_blank"); // ✅ SAFE here
  }, totalTime);

  return () => {
    clearTimeout(resetProgress);
    clearTimeout(delay);
    clearTimeout(redirectTimeout);
    clearInterval(interval);
  };
}, [isOpen, link, onClose]);

useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [isOpen]);

  if (!isOpen) return null;

return createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">

    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-md"
    />

    {/* MODAL */}
    <div className="relative z-10 bg-(--background) rounded-2xl  max-w-sm lg:w-[90%] sm:max-w-md px-4 p-5 sm:p-6 text-center animate-scale-in shadow-xl">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-(--muted-foreground) text-xl cursor-pointer hover:text-(--primary)"
        >
          <X size={24} />
        </button>

        {/* BAG IMAGE */}
        <div className="flex justify-center lg:mt-3">
          <div className="relative sm:w-35 sm:h-35 w-15 h-15">
            <Image
              src={modal} 
              alt="bag"
              fill
              sizes="(max-width: 640px) 60px, 140px"
              className="w-200 h-60 object-contain sm:scale-220 scale-200"
            />
          </div>
        </div>

        <h2 className=" text-lg sm:text-2xl font-bold mb-2">You’re all set!</h2>
        <p className="font-medium text-sm mb-4">
          Coupon Applied Successfully
        </p>

        {/* COUPON */}
<div className="flex justify-center mb-4">
  <div className="relative border border-dashed border-(--primary)/40 rounded-lg px-6 py-2 w-full max-w-[260px] sm:max-w-[300px] text-center">

    {/* COUPON */}
    <span className="font-bold text-(--primary) tracking-wider text-base sm:text-lg">
      {couponCode}
    </span>

    {/* ICON BUTTON */}
    <button
      onClick={handleCopy}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--primary) transition cursor-pointer"
    >
      {copied ? (
        <Check size={18} className="text-green-500" />
      ) : (
        <Copy size={18} />
      )}
    </button>

  </div>
</div>

        <p className="text-sm mb-3">
          Redirecting you to the store...
        </p>

        {/* ✅ PROGRESS BAR */}
        <div className="w-full h-2 bg-(--muted-foreground)/20 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-(--primary) transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
<div className="flex justify-center">
     <p className="text-(--muted-foreground) font-medium text-xs sm:text-sm px-2 sm:px-5 py-2 ">
          Not redirecting ?
        </p>
        {/* FALLBACK BUTTON */}
        <button
          onClick={() => window.open(link, "_blank")}
          className="bg-(--primary) text-white px-4 sm:px-5 py-2 text-sm sm:text-base rounded-full cursor-pointer hover:bg-(--primary-hover) font-semibold"
        >
          Go To Store
        </button>
        </div>
      </div>
  </div>,
  document.body
);
}

export default CouponModal;

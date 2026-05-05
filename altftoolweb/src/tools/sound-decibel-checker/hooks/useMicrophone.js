"use client";
export const useMicrophone = async (setPermission) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setPermission(true);
    return stream;
  } catch (err) {
    console.error("Microphone Permission Error:", err);
    setPermission(false);
    return null;
  }
};

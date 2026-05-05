"use client";
export default function ErrorState({ message }) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6 text-center">
      <p className="text-red-600 text-sm sm:text-base">{message}</p>
    </div>
  );
}

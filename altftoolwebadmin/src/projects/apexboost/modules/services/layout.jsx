"use client";

export default function ServicesLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}

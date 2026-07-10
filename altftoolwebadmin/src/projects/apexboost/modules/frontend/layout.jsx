"use client";

export default function FrontendLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Content */}
      <div className="mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}

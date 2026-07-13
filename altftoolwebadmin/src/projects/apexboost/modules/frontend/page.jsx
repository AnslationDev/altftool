"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, RefreshCw, Eye, ExternalLink, Hammer, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function FrontendPage() {
  const [buildStatus, setBuildStatus] = useState("idle"); // idle | building | success | error
  const [buildError, setBuildError] = useState(null);
  const [lastBuilt, setLastBuilt] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef(null);

  // On mount, check if a build already exists
  useEffect(() => {
    checkBuildStatus();
  }, []);

  const checkBuildStatus = async () => {
    try {
      const res = await fetch("/api/apexboost/build");
      const json = await res.json();
      if (json.success && json.built) {
        setLastBuilt(new Date(json.lastBuilt).toLocaleString());
        setBuildStatus("success");
      }
    } catch {
      // ignore
    }
  };

  const handleBuild = async () => {
    setBuildStatus("building");
    setBuildError(null);
    setShowPreview(false);
    try {
      const res = await fetch("/api/apexboost/build", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setBuildStatus("success");
        setLastBuilt(new Date().toLocaleString());
        setShowPreview(true);
        setPreviewKey((k) => k + 1);
      } else {
        setBuildStatus("error");
        setBuildError(json.error || "Build failed");
      }
    } catch (err) {
      setBuildStatus("error");
      setBuildError(err.message);
    }
  };

  const handleRefreshPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  const handleShowPreview = () => {
    setShowPreview(true);
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Frontend Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Build and preview your Apex Boost website
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Build button */}
          <button
            onClick={handleBuild}
            disabled={buildStatus === "building"}
            className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {buildStatus === "building" ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Building…
              </>
            ) : (
              <>
                <Hammer size={16} />
                Build & Preview
              </>
            )}
          </button>

          {/* Show Preview button – only if build exists */}
          {buildStatus === "success" && !showPreview && (
            <button
              onClick={handleShowPreview}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            >
              <Eye size={16} />
              Show Preview
            </button>
          )}

          {/* Refresh preview */}
          {showPreview && (
            <button
              onClick={handleRefreshPreview}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          )}

          {/* Open in new tab */}
          {buildStatus === "success" && (
            <a
              href="/api/apexboost/preview"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            >
              <ExternalLink size={16} />
              Open Full Screen
            </a>
          )}
        </div>
      </div>

      {/* ── Build status banners ── */}
      {buildStatus === "building" && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          <RefreshCw size={16} className="animate-spin shrink-0" />
          <span>Building frontend… this may take up to 60 seconds.</span>
        </div>
      )}

      {buildStatus === "success" && !buildError && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle size={16} className="shrink-0" />
          <span>
            Build successful!
            {lastBuilt && (
              <span className="ml-2 text-green-500">
                <Clock size={12} className="inline mr-1" />
                Last built: {lastBuilt}
              </span>
            )}
          </span>
        </div>
      )}

      {buildStatus === "error" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Build failed</p>
            {buildError && <pre className="mt-1 text-xs whitespace-pre-wrap">{buildError}</pre>}
          </div>
        </div>
      )}

      {/* ── Preview iframe ── */}
      {showPreview ? (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Browser chrome */}
          <div className="bg-gray-100 border-b px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-sm text-gray-500 border select-none">
              /api/apexboost/preview
            </div>
          </div>
          <iframe
            key={previewKey}
            ref={iframeRef}
            src="/api/apexboost/preview"
            className="w-full"
            style={{ height: "calc(100vh - 280px)", minHeight: "600px", border: "none" }}
            title="Apex Boost Preview"
          />
        </div>
      ) : (
        /* ── Empty state ── */
        <div className="bg-white rounded-xl shadow p-8">
          <div className="text-center py-14">
            <Play className="mx-auto h-16 w-16 text-gray-300 mb-5" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {buildStatus === "success"
                ? "Build ready — click Show Preview"
                : "No preview yet"}
            </h3>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
              {buildStatus === "success"
                ? "Your latest build is ready. Click \u2018Show Preview\u2019 above, or open it fullscreen in a new tab."
                : 'Click "Build & Preview" to compile your Apex Boost website. Any changes you saved through the admin will appear in the preview.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="bg-gray-50 p-4 rounded-xl border">
                <h4 className="font-medium text-gray-800 mb-1 text-sm">📄 Pages</h4>
                <p className="text-xs text-gray-500">Home, About, Services, Blog, Contact</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border">
                <h4 className="font-medium text-gray-800 mb-1 text-sm">🧩 Sections</h4>
                <p className="text-xs text-gray-500">Hero, Features, Portfolio, Testimonials</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border">
                <h4 className="font-medium text-gray-800 mb-1 text-sm">🗃️ Content</h4>
                <p className="text-xs text-gray-500">Blogs, Services, FAQ, Stats</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick links ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Manage Blogs", href: "/apexboost/blogs" },
            { label: "Manage Services", href: "/apexboost/services" },
            { label: "Manage Portfolio", href: "/apexboost/portfolio" },
            { label: "Features", href: "/apexboost/features" },
            { label: "Testimonials", href: "/apexboost/testimonials" },
            { label: "Statistics", href: "/apexboost/stats" },
            { label: "FAQ", href: "/apexboost/faq" },
            { label: "Site Settings", href: "/apexboost/settings" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              <span className="text-xs text-gray-400">→</span>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

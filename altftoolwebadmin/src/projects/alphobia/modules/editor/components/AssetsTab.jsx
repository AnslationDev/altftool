import React, { useState, useEffect } from "react";
import { uploadAsset, getFullDummyData } from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import { Loader2, UploadCloud, Copy, Check } from "lucide-react";
import ImagePreviewModal from "@/projects/alphobia/components/ImagePreviewModal";

export default function AssetsTab() {
  const [previewImg, setPreviewImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("media"); // "media" or "json"

  // Standard dummy images inventory from the client frontend
  const dummyImages = [
    { name: "Hero Main Background", url: "/HeroImg.jpeg", desc: "Main hero overlay image" },
    { name: "Digital Marketing Hero", url: "/digital-marketing-hero.png", desc: "Digital cap background" },
    { name: "Affiliate Marketing Hero", url: "/affiliated-marketing-hero.png", desc: "Affiliate cap background" },
    { name: "Advertising Programs Hero", url: "/advertisment-marketing-hero.png", desc: "Advertising cap background" },
    { name: "Corporate Meeting (Pexels)", url: "https://images.pexels.com/photos/7621381/pexels-photo-7621381.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600", desc: "Data DNA image" },
    { name: "Interface Nodes (Pexels)", url: "https://images.pexels.com/photos/34804001/pexels-photo-34804001.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600", desc: "Global Experts image" },
    { name: "Growth Strategy Chart (Pexels)", url: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", desc: "Omnichannel blog image" },
    { name: "Team Leader Ava (Unsplash)", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=750&q=80", desc: "Co-founder & CEO" },
    { name: "Team Leader Marcus (Unsplash)", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=750&q=80", desc: "Co-founder & CTO" },
    { name: "Team Leader Priya (Unsplash)", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=750&q=80", desc: "VP, Growth Services" },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await uploadAsset({
        file,
        onProgress: (p) => setUploadProgress(p),
      });

      setUploadedFiles((prev) => [
        { name: res.name, url: res.url, path: res.path, date: new Date().toLocaleTimeString() },
        ...prev,
      ]);

      emitAlert({ type: "success", message: "File uploaded successfully to Firebase Storage!" });
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to upload file." });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    emitAlert({ type: "info", message: "URL copied to clipboard!" });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const fullJsonReference = JSON.stringify(getFullDummyData(), null, 2);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Tab Navigation header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm rounded-lg">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">Assets &amp; Reference Library</h2>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setActiveSubTab("media")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                activeSubTab === "media"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-soft)] hover:bg-[var(--border)] text-[var(--foreground)]"
              }`}
            >
              Media Assets Catalog
            </button>
            <button
              onClick={() => setActiveSubTab("json")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                activeSubTab === "json"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-soft)] hover:bg-[var(--border)] text-[var(--foreground)]"
              }`}
            >
              Default Dummy JSON Reference
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === "media" ? (
        <div className="space-y-6">
          {/* Uploader Card */}
          <div className="card p-6 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] py-10 text-center space-y-4">
            <div className="p-4 bg-[var(--surface-soft)] rounded-full text-[var(--primary)]">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold">Upload new images to Firebase Storage</p>
              <p className="text-xs text-[var(--muted)] mt-1">PNG, JPG, JPEG, SVG up to 10MB</p>
            </div>
            <div>
              <label className="btn btn-primary cursor-pointer flex items-center gap-2 py-2 px-4 text-xs font-semibold">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading ({uploadProgress}%)
                  </>
                ) : (
                  "Select File"
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {uploading && (
              <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Uploaded Files list */}
          {uploadedFiles.length > 0 && (
            <div className="card p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">Recently Uploaded Files</h3>
              <div className="divide-y divide-[var(--border)]">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPreviewImg(file.url)}
                        title="Click to view full image"
                        className="h-10 w-10 bg-slate-100 rounded border border-[var(--border)] overflow-hidden shrink-0 block hover:opacity-80 transition cursor-pointer"
                      >
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      </button>
                      <div>
                        <p className="text-xs font-semibold truncate max-w-xs">{file.name}</p>
                        <p className="text-[10px] text-[var(--muted)]">Uploaded at {file.date}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(file.url, `uploaded-${idx}`)}
                      className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1 shrink-0"
                    >
                      {copiedIndex === `uploaded-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Copy URL
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Catalog */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">Default Media Asset Registry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {dummyImages.map((img, idx) => (
                <div key={idx} className="p-3 bg-[var(--surface-soft)] rounded border border-[var(--border)] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setPreviewImg(img.url)}
                      title="Click to view full image"
                      className="h-28 w-full rounded border border-[var(--border)] overflow-hidden bg-slate-100 relative block hover:opacity-85 transition cursor-pointer"
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </button>
                    <p className="text-xs font-bold text-[var(--foreground)] truncate pt-1">{img.name}</p>
                    <p className="text-[10px] text-[var(--muted)]">{img.desc}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(img.url, `default-${idx}`)}
                    className="w-full btn btn-outline py-1.5 px-3 text-xs flex items-center justify-center gap-1"
                  >
                    {copiedIndex === `default-${idx}` ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy Reference Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* JSON Reference View */
        <div className="card p-6 space-y-4 animate-slide-in">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <h3 className="text-sm font-bold text-[var(--primary)]">B2B Content Initial Schema (Read-only)</h3>
            <button
              onClick={() => copyToClipboard(fullJsonReference, "json-ref")}
              className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
            >
              {copiedIndex === "json-ref" ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy Full JSON
            </button>
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            This JSON represents the full initialized structure of the B2B frontend data. You can copy this data schema as a reference structure when connecting the dynamic Firebase fetch endpoints to the frontend.
          </p>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded text-xs overflow-auto max-h-[500px] font-mono leading-relaxed">
            {fullJsonReference}
          </pre>
        </div>
      )}
      <ImagePreviewModal src={previewImg} onClose={() => setPreviewImg(null)} />
    </div>
  );
}

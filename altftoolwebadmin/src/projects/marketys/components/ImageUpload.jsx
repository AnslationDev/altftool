"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseStorage";

export default function ImageUpload({ value, onChange, label = "Image", folder = "marketys/images" }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => {
        setUploading(false);
        setPreview(null);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setUploading(false);
        setPreview(null);
        onChange(url);
      }
    );
  };

  const handleRemove = () => {
    onChange("");
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      {/* Preview */}
      {(preview || value) && (
        <div className="relative inline-block">
          <img
            src={preview || value}
            alt=""
            className="h-28 rounded-lg border border-gray-200 object-cover shadow-sm"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          {!uploading && (
            <button type="button" onClick={handleRemove}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading... {progress}%
          </div>
          <div className="h-1.5 w-full max-w-xs rounded-full bg-gray-200">
            <div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Upload button + URL input */}
      <div className="flex gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shrink-0">
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500" />
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { useAlert } from "@/shared/ui/AlertProvider";

export default function UploadArea({ setPreview, analyzeImage }) {
  const fileInputRef = useRef(null);
  const { showAlert } = useAlert();

  const validateImage = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      showAlert("Please upload a valid JPG, PNG, or WEBP image.", "error");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert("Image size must be under 10MB.", "error");
      return false;
    }

    return true;
  };

  const processFile = (file) => {
    if (!file || !validateImage(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="px-8 sm:px-12 py-8 sm:py-12"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary hover:bg-[var(--anslation-ds-soft)] transition duration-150 ease-in-out group"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-105 transition duration-150">
          <Upload className="text-primary" size={32} />
        </div>

        <h3 className="subheading font-semibold text-lg text-foreground mb-2">
          Upload a Photo to Analyze Emotions
        </h3>

        <p className="description text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Drag and drop your image here, or browse local files. Max size 10MB.
        </p>

        <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium cursor-pointer transition shadow-sm hover:shadow active:scale-95 duration-100">
          Select Photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}

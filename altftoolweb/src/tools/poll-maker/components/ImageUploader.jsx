"use client";

import { Upload } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function ImageUploader({ index, optionImages, setOptionImages, disabled = false }) {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Revoke the previous object URL for this option before replacing it,
    // otherwise every re-upload leaks the earlier blob for the rest of the
    // tab's lifetime.
    const previousUrl = optionImages[index];
    if (typeof previousUrl === "string" && previousUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl);
    }

    const imageUrl = URL.createObjectURL(file);

    const updated = [...optionImages];
    updated[index] = imageUrl;

    setOptionImages(updated);
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      <label
        className={`flex items-center gap-2 text-sm text-blue-500 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <Upload size={16} className="text-blue-500" />
        Upload Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={disabled}
          className="hidden"
        />
      </label>

      {optionImages[index] && (
        <ManagedImage
          src={optionImages[index]}
          alt="preview"
          className="w-10 h-10 rounded object-cover border"
        />
      )}
    </div>
  );
}
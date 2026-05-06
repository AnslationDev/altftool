"use client";

import { Upload } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function ImageUploader({ index, optionImages, setOptionImages }) {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    const updated = [...optionImages];
    updated[index] = imageUrl;

    setOptionImages(updated);
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-500">
        <Upload size={16} className="text-blue-500" />
        Upload Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
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
import React, { useState } from "react";

const UploadArea = ({ onFileChange, fileInputRef }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        const fakeEvent = {
          target: {
            files: [file],
          },
        };

        onFileChange(fakeEvent);
      }}
      className={`border-2 border-dashed rounded-xl p-12 text-center bg-(--card) transition-all duration-300 cursor-pointer ${
        isDragging
          ? "border-(--primary) bg-(--search-buysmart)"
          : "border-(--border)"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        data-testid="image-cropper-file-input"
        onChange={onFileChange}
        ref={fileInputRef}
        className="hidden"
        id="file-input"
      />

      <label htmlFor="file-input" className="cursor-pointer block">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h3 className="mt-4 text-xl font-medium text-(--muted-foreground)">
          Upload an image
        </h3>

        <p className="mt-2 text-sm text-(--muted-foreground)">
          Click to browse or drag and drop your image here
        </p>

        {isDragging && (
          <p className="mt-3 text-sm font-medium text-(--primary)">
            Drop image here
          </p>
        )}

        <p className="mt-1 text-xs text-(--muted-foreground)">
          Supports JPG, PNG, GIF and other common image formats
        </p>
      </label>
    </div>
  );
};

export default UploadArea;

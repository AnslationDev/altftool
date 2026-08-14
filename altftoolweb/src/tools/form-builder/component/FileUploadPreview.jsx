import React, { useEffect, useState } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

const FileUploadPreview = ({ file }) => {
  const isImage = !!file && file.type.startsWith("image/");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Create the object URL exactly once per `file` (not on every render),
  // and revoke it on cleanup so we don't leak a blob URL each re-render.
  useEffect(() => {
    if (!isImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  if (!file) return null;

  const fileSizeKB = (file.size / 1024).toFixed(2);
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="mt-3 p-3 border border-(--border) rounded-md bg-(--muted)">
      <p className="text-sm font-medium">{file.name}</p>

      {file?.size && (
        <p className="text-xs text-(--muted-foreground)">
          Size:{" "}
          {file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`}
        </p>
      )}

      {isImage && previewUrl && (
        <ManagedImage
          src={previewUrl}
          alt="preview"
          className="mt-2 w-24 h-24 object-cover rounded-md border border-(--border)"
        />
      )}
    </div>
  );
};

export default FileUploadPreview;

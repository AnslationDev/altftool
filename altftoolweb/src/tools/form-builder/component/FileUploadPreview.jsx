import React from "react";
import ManagedImage from "@/components/ui/ManagedImage";

const FileUploadPreview = ({ file }) => {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
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

      {isImage && (
        <ManagedImage
          src={URL.createObjectURL(file)}
          alt="preview"
          className="mt-2 w-24 h-24 object-cover rounded-md border border-(--border)"
        />
      )}
    </div>
  );
};

export default FileUploadPreview;

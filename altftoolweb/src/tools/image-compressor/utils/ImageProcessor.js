export class ImageProcessor {
  static async compressImage(file, settings) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            settings.maxWidth,
            settings.maxHeight,
          );

          canvas.width = width;
          canvas.height = height;

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              const compressedImage = {
                blob,
                url: URL.createObjectURL(blob),
                size: blob.size,
                quality: settings.quality,
                width,
                height,
              };

              resolve(compressedImage);
            },
            `image/${settings.format}`,
            settings.quality / 100,
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  static calculateDimensions(
    originalWidth,
    originalHeight,
    maxWidth,
    maxHeight,
  ) {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static getCompressionRatio(originalSize, compressedSize) {
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  }
}

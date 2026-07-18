import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Factory for a direct-to-Firebase-Storage image uploader, matching the
 * upload*Image pattern every carrerbook module hand-writes (validate ->
 * resumable upload with progress -> download URL). `pathPrefix` becomes the
 * storage path prefix, e.g. "anslic/navbar/logo" ->
 * `projects/anslic/navbar/logo-<timestamp>.<ext>` (segments already include
 * the "projects/<id>" root by convention, see per-module service files).
 */
export function createImageUploader({ pathPrefix, maxSizeMB = 5 }) {
  function validate(file) {
    if (!file.type?.startsWith("image/")) {
      throw new Error("Please upload an image file.");
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Image must be ${maxSizeMB}MB or smaller.`);
    }
  }

  function upload({ file, onProgress }) {
    validate(file);
    return new Promise((resolve, reject) => {
      const ext = file.name.split(".").pop() || "png";
      const path = `projects/${pathPrefix}-${Date.now()}.${ext}`;
      const ref = storageRef(storage, path);
      const task = uploadBytesResumable(ref, file);

      task.on(
        "state_changed",
        (snap) => {
          if (onProgress) {
            onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
          }
        },
        reject,
        async () => {
          try {
            resolve({ url: await getDownloadURL(task.snapshot.ref), path });
          } catch (error) {
            reject(error);
          }
        },
      );
    });
  }

  async function remove(path) {
    if (!path) return;
    await deleteObject(storageRef(storage, path));
  }

  return { upload, remove };
}

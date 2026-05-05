"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { getFaceDescriptor, compareFaces } from "../services/faceSimilarity";
// import Alert from "@/shared/ui/Alert";
import { useAlert } from "@/shared/ui/AlertProvider";

export default function UploadArea({ mode, setPreview, analyzeImage, setResult }) {
  const fileInputRef = useRef(null);
  const {showAlert} = useAlert();

  const validateImage = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      showAlert("Upload JPG, PNG or WEBP", "error");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert("Image must be under 10MB", "error");
      return false;
    }

    return true;
  };

  const processFiles = async (files) => {

    const fileArray = Array.from(files);

    // ✅ COMPARE MODE → MUST HAVE EXACTLY 2
    if (mode === "compare") {
      if (fileArray.length !== 2) {
        showAlert("Please upload exactly TWO images to compare.", "error");
        return;
      }
    }

    const validFiles = fileArray.filter((file) => validateImage(file));
    if (validFiles.length === 0) return;

    const readers = validFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    const images = await Promise.all(readers);

    setPreview(mode === "compare" ? images : images[0]);

    // =========================
    // SINGLE MODE (UNCHANGED)
    // =========================
    if (mode === "single") {
      analyzeImage(images[0], "single");
      return;
    }

    // =========================
    // COMPARE MODE (ONLY SIMILARITY)
    // =========================

    try {
      const img1 = new Image();
      const img2 = new Image();

      img1.src = images[0];
      img2.src = images[1];

      await Promise.all([
        new Promise((res) => (img1.onload = res)),
        new Promise((res) => (img2.onload = res)),
      ]);

      const desc1 = await getFaceDescriptor(img1);
      const desc2 = await getFaceDescriptor(img2);

      if (!desc1 || !desc2) {
        setResult(null);
        showAlert("Face not detected in one of the images.", "error");
        // <Alert 
        // type="error"
        // message={"Face not detected in one of the image"}
        // onClose={false} />
        return;
      }

      const similarityData = compareFaces(desc1, desc2);

      // ✅ ONLY COMPARISON RESULT
      setResult({
        similarity: similarityData.similarity,
        samePerson: similarityData.samePerson
      });

    } catch (err) {
      console.error(err);
      setResult(null);
      showAlert("Comparison failed.", "error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  return (
    <div
      className="px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-(--border) rounded-2xl p-10 text-center cursor-pointer hover:border-(--primary) transition"
      >
        <Upload className="mx-auto mb-4 text-(--primary)" size={48} />

        <h3 className="subheading mb-2">
          {mode === "compare"
            ? "Upload Two Photos to Compare Faces"
            : "Upload a Photo to Analyze"}
        </h3>

        <p className="description mb-4">
          {mode === "compare"
            ? "Upload exactly 2 images to check similarity"
            : "Detect age, gender and face details"}
        </p>

        <button className="px-6 py-3 bg-(--primary) text-white rounded-xl font-medium cursor-pointer">
          Choose File
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={mode === "compare"}
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />
    </div>
  );
}
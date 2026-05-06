import ManagedImage from "@/components/ui/ManagedImage";
export default function OriginalPreview({ image }) {
  if (!image) return null;

  return (
    <div className="rounded-2xl bg-(--card) border border-(--border) p-6 text-center shadow-md">
      <p className="mb-4 font-semibold">Image Uploaded</p>
      <div className="rounded-xl overflow-hidden">
        <ManagedImage
          src={image}
          alt="Original"
          className="mx-auto max-h-96 object-contain"
        />
      </div>
    </div>
  );
}
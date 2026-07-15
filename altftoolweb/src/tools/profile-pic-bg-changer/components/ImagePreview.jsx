import ManagedImage from "@/components/ui/ManagedImage";

export default function ImagePreview({ image, label }) {
  if (!image) return null;

  return (
    <div className="rounded-2xl bg-(--surface) border border-(--border) p-6 text-center shadow-md flex-1 max-w-md">
      <p className="mb-4 font-semibold text-sm text-(--muted-foreground) uppercase tracking-wide">{label}</p>
      <div className="rounded-xl overflow-hidden mx-auto w-48 h-48">
        <ManagedImage
          src={image}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

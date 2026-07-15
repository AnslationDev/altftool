import dynamic from "next/dynamic";

const PassportMakerMain = dynamic(() => import("./pages/main"), {
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-(--primary) border-t-transparent animate-spin" />
        <p className="text-sm text-(--muted-foreground)">Loading Passport Photo Maker...</p>
      </div>
    </div>
  ),
});

export default function Entry() {
  return <PassportMakerMain />;
}

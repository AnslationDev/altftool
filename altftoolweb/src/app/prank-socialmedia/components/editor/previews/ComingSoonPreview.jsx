import Link from "next/link";
import { Construction } from "lucide-react";
import { Button } from "../../ui/button";
function ComingSoonPreview({ name }) {
  return <div className="glass mx-auto flex w-[420px] max-w-full flex-col items-center rounded-3xl p-10 text-center shadow-glow">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"><Construction className="h-6 w-6" /></div>
      <h3 className="mt-4 text-xl font-semibold">{name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">This generator is being polished. The shared editor framework, state and export pipeline are already wired up — the realistic preview lands next.</p>
      <Button asChild className="mt-5 rounded-xl"><Link href="/templates">Try a ready template</Link></Button>
    </div>;
}
export {
  ComingSoonPreview
};

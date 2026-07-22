import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary-foreground/90 text-primary",
        secondary: "border-border bg-foreground/[0.04] text-muted-foreground",
        outline: "border-foreground/15 text-foreground/80",
        success: "border-transparent bg-emerald-500/15 text-emerald-700",
        warning: "border-transparent bg-amber-500/15 text-amber-700",
        info: "border-transparent bg-sky-500/15 text-sky-700",
        gradient: "border-transparent bg-brand-gradient text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

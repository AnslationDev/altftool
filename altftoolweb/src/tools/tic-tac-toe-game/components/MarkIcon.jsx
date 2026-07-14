import { Circle, X } from "lucide-react";

export default function MarkIcon({ mark, className = "" }) {
  if (mark === "X") return <X className={className} aria-hidden="true" />;
  if (mark === "O") return <Circle className={className} aria-hidden="true" />;
  return null;
}

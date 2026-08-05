import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="festival-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.href || item.label} className="festival-breadcrumb-item">
          {index > 0 ? <ChevronRight size={13} /> : null}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

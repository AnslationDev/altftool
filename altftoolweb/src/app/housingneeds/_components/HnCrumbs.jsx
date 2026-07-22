import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Breadcrumb trail for the Housing Needs surface, e.g.
 * Business Ops › Housing Needs › Roofing. The last item is the current page
 * (no link). `trail` is an array of { label, href? }.
 */
export default function HnCrumbs({ trail }) {
  return (
    <nav className="bizops-crumbs" aria-label="Breadcrumb">
      {trail.map((item, index) => (
        <span key={item.label} className="bizops-crumb-item">
          {index > 0 && (
            <ChevronRight
              className="bizops-crumb-sep"
              size={13}
              strokeWidth={2.4}
              aria-hidden="true"
            />
          )}
          {item.href ? (
            <Link href={item.href} className="bizops-crumb">
              {item.label}
            </Link>
          ) : (
            <span className="bizops-crumb bizops-crumb--current" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

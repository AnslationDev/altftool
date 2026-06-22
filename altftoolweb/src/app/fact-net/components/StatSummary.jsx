import { Archive, CalendarDays, FolderTree, Link2 } from "lucide-react";
import { formatCount } from "../data/factNetData";

const iconMap = {
  archive: Archive,
  calendar: CalendarDays,
  folder: FolderTree,
  link: Link2,
};

export default function StatSummary({ items }) {
  return (
    <div className="fn-stat-grid">
      {items.map((item) => {
        const Icon = iconMap[item.icon] || Archive;
        return (
          <div key={item.label} className="fn-stat">
            <span className="fn-stat-icon">
              <Icon className="fn-icon" />
            </span>
            <div className="fn-stat-value">
              {typeof item.value === "number" ? formatCount(item.value) : item.value}
            </div>
            <div className="fn-stat-label">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

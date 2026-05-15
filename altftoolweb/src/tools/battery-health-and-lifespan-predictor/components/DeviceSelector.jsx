import { Smartphone, Laptop, Headphones, Battery, Bike, Car, Home, Plug, Shield } from "lucide-react";

const iconMap = {
  phone: Smartphone,
  laptop: Laptop,
  earbuds: Headphones,
  powerbank: Battery,
  "ev-scooter": Bike,
  "ev-car": Car,
  inverter: Home,
  ups: Plug,
};

export default function DeviceSelector({ category, device, onChange }) {
  const data = {
    consumer: ["phone", "laptop", "earbuds", "powerbank"],
    mobility: ["ev-scooter", "ev-car"],
    home: ["inverter", "ups"],
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {Object.keys(data).map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat, data[cat][0])}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-[transform,box-shadow,background-color] duration-200 flex items-center gap-1 ${
              category === cat
                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30 scale-105"
                : "bg-transparent text-[var(--secondary-foreground)] border border-white/20 hover:border-white/40 hover:bg-white/5"
            }`}
          >
            <Shield className="w-4 h-4" />
            {cat}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {data[category].map((d) => {
          const Icon = iconMap[d] || Battery;
          return (
            <button
              key={d}
              onClick={() => onChange(category, d)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-[transform,box-shadow,background-color] duration-200 flex items-center gap-1.5 ${
                device === d
                  ? "bg-[var(--primary)]/90 text-white shadow-md shadow-[var(--primary)]/30 scale-105"
                  : "bg-transparent text-[var(--secondary-foreground)] border border-white/20 hover:border-white/40 hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
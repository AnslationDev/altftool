"use client";

import {
  Link,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  User,
  MapPin,
  Calendar,
  MessageCircle,
  FileText,
} from "lucide-react";

const QR_TYPES = [
  { id: "TEXT", icon: FileText, label: "Text" },
  { id: "URL", icon: Link, label: "URL" },
  { id: "EMAIL", icon: Mail, label: "Email" },
  { id: "PHONE", icon: Phone, label: "Phone" },
  { id: "SMS", icon: MessageSquare, label: "SMS" },
  { id: "WHATSAPP", icon: MessageCircle, label: "WhatsApp" },
  { id: "WIFI", icon: Wifi, label: "Wi-Fi" },
  { id: "VCARD", icon: User, label: "Contact" },
  { id: "LOCATION", icon: MapPin, label: "Location" },
  { id: "CALENDAR", icon: Calendar, label: "Event" },
];

export default function TypeSelector({ activeType, onTypeChange }) {
  return (
    <div className="flex bg-(--card) p-1.5 rounded-2xl shadow-sm border border-(--border) overflow-x-auto no-scrollbar">
      {QR_TYPES.map((type) => {
        const IconComp = type.icon;
        const isActive = activeType === type.id;
        return (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex-1 whitespace-nowrap ${
              isActive
                ? "bg-(--primary) text-white"
                : "text-(--muted-foreground) hover:bg-(--background)"
            }`}
            aria-pressed={isActive}
            title={type.label}
          >
            <IconComp size={14} />
            <span className="hidden sm:inline">{type.label}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";

export default function AdminAvatar({ admin, size = "md" }) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-12 h-12 text-sm",
  };

  const radiusClasses = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
  };

  const initials = admin.fullName
    ? admin.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : admin.firstName
    ? `${admin.firstName[0]}${admin.lastName?.[0] ?? ""}`.toUpperCase()
    : admin.email?.[0]?.toUpperCase() ?? "A";

  // photoURL is a Firestore Storage path — render as <img src> directly.
  // If the image fails to load (broken path, missing file, permissions),
  // fall back to initials avatar via onError.
  if (admin.photoURL && !imgError) {
    return (
      <img
        src={admin.photoURL}
        alt={initials}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} ${radiusClasses[size]} object-cover border border-gray-200 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${radiusClasses[size]} bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0`}
    >
      {initials}
    </div>
  );
}
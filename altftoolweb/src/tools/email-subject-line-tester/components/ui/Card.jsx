"use client";

export default function Card({ className = "", children, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-(--card-border) bg-(--card)/80 backdrop-blur-xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_rgba(0,0,0,0.35)] ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

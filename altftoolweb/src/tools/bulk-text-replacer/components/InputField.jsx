"use client";

export default function InputField({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
        w-full
        px-4 py-3
        rounded-xl
        border border-(--border)
        bg-(--card)
        text-(--foreground)
        placeholder:text-(--muted-foreground)
        outline-none
        focus:ring-2 focus:ring-(--primary)
        focus:border-(--primary)
        transition
      "
    />
  );
}

"use client";

export default function TextArea({
  value,
  onChange,
  placeholder,
  readOnly = false,
}) {
  return (
    <textarea
      rows={6}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`
        w-full p-4 rounded-2xl
        border border-(--border)
        bg-(--background)
        text-(--foreground)
        placeholder:text-(--muted-foreground)
        outline-none
        resize-none
        transition-all duration-200
        ${readOnly
          ? "bg-(--muted) cursor-not-allowed"
          : "focus:ring-2 focus:ring-(--primary) focus:border-(--primary)"
        }
      `}
    />
  );
}

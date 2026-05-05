export function Input({ error, as = "input", className = "", ...props }) {
    const Component = as; // "input" | "textarea"

    return (
        <Component
            {...props}
            className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition resize-none ${error
                    ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                    : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
                } ${className}`}
        />
    );
}
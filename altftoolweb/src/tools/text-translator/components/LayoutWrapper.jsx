export default function LayoutWrapper({ children }) {
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) p-6 transition-colors">
      {children}
    </div>
  );
}

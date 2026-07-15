export default function GameBackground({ variant = "classic" }) {
  const palettes = {
    classic: ["#14B8A6", "#22D3EE", "#8B5CF6"],
    neon: ["#22D3EE", "#A855F7", "#14B8A6"],
    gold: ["#F59E0B", "#EF4444", "#14B8A6"],
  };
  const colors = palettes[variant] || palettes.classic;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-(--background)" />
      <div
        className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ background: colors[0] }}
      />
      <div
        className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ background: colors[1], animationDelay: "1.2s" }}
      />
      <div
        className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-15 animate-pulse"
        style={{ background: colors[2], animationDelay: "2.4s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

export default function AngerTypeCard({ angerType }) {

  const Icon = angerType.icon;

  return (
    <div className="bg-(--card) rounded-2xl p-6 mb-6 border-2 border-(--border) text-center">
      
      <h3 className="subheading font-bold text-(--foreground) mb-4">
         Your Anger Type
      </h3>

      <div className="flex items-center justify-center gap-2 text-2xl font-semibold mb-3">
        {Icon && <Icon size={26} className="text-(--primary) mt-0" />}
        <span className="text-(--foreground)">
          {angerType.type}
        </span>
      </div>

      <p className="text-(--muted-foreground) max-w-xl mx-auto">
        {angerType.description}
      </p>

    </div>
  );
}
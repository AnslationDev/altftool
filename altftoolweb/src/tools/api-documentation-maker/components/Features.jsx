import {
  Code2,
  FileCode2,
  ListTree,
  MonitorSmartphone,
  PencilLine,
  Sparkles,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Generate API Documentation Instantly",
    description:
      "Create clean and structured API documentation in seconds from your endpoints and parameters.",
  },
  {
    icon: ListTree,
    title: "Organized Endpoint Structure",
    description:
      "Automatically format routes, request methods, headers, query parameters, and response examples.",
  },
  {
    icon: Code2,
    title: "Developer-Friendly Format",
    description:
      "Produce readable and professional documentation suitable for teams, clients, and public APIs.",
  },
  {
    icon: FileCode2,
    title: "Code Examples Included",
    description:
      "Add sample requests and responses to help developers understand how to integrate your API quickly.",
  },
  {
    icon: PencilLine,
    title: "Easy Editing & Export",
    description:
      "Edit documentation easily and export it for sharing, publishing, or internal use.",
  },
  {
    icon: MonitorSmartphone,
    title: "Fully Responsive Interface",
    description:
      "Create and manage API documentation seamlessly across desktop, tablet, and mobile devices.",
  },
];

const Features = () => {
  return (
    <section className="w-full py-14 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs font-semibold text-(--primary) mb-4">
            <Sparkles size={13} /> Why This Tool
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our API Documentation Maker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Build clear, professional API documentation to simplify integration and development
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="
                bg-(--card)
                rounded-2xl
                shadow-md
                border border-(--border)
                p-6 sm:p-8
                flex flex-col
                hover:shadow-xl
                hover:border-(--primary)/40
                hover:-translate-y-2
                transition-all duration-300
              "
            >
              <span className="w-11 h-11 rounded-xl bg-(--primary)/10 text-(--primary) flex items-center justify-center mb-4">
                <Icon size={20} />
              </span>

              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3">
                {title}
              </h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

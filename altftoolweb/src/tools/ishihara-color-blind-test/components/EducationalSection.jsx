import { BookOpen, Eye, Info, Lightbulb } from "lucide-react";

export default function EducationalSection() {
  const sections = [
    {
      title: "What is Color Blindness?",
      icon: Eye,
      content: "Color vision deficiency (CVD) is the decreased ability to see color or differences in color. It affects approximately 1 in 12 men and 1 in 200 women worldwide."
    },
    {
      title: "Common Types",
      icon: Info,
      content: "Protanopia (red-blind), Deuteranopia (green-blind), and Tritanopia (blue-blind) are the most common. Achromatopsia is the rare total inability to see color."
    },
    {
      title: "The Ishihara Test",
      icon: BookOpen,
      content: "Invented by Dr. Shinobu Ishihara in 1917, this test uses 'pseudoisochromatic' plates to identify red-green color deficiencies."
    },
    {
      title: "UX Design Tips",
      icon: Lightbulb,
      content: "Always use more than just color to convey information. Add icons, patterns, or text labels to ensure accessibility for all users."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
      {sections.map((section, index) => (
        <div key={index} className="bg-(--card) p-6 rounded-3xl border border-(--border) shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <section.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">{section.title}</h3>
          </div>
          <p className="text-(--secondary-foreground) text-sm leading-relaxed">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
}

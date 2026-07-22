import { Card, CardContent } from "@mui/material";
import {
  Edit3,
  FileDown,
  GitMerge,
  PlusSquare,
  Sparkles
} from "lucide-react";
const HowItWorks = () => {
  const steps = [
    {
      title: "Add Flowchart Nodes",
      description: "Choose flowchart shapes like Start, Process, Decision, or End from the toolbar and drag them onto the canvas.",
      icon: <PlusSquare className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-100"
    },
    {
      title: "Connect the Nodes",
      description: "Link nodes together by dragging connection handles to define the logical flow between steps.",
      icon: <GitMerge className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-100"
    },
    {
      title: "Edit & Customize",
      description: "Double-click nodes to edit text, adjust styles, and rearrange elements to match your workflow.",
      icon: <Edit3 className="h-6 w-6 text-purple-600" />,
      bg: "bg-purple-100"
    },
    {
      title: "Export or Save",
      description: "Save your flowchart as JSON for later edits or export it as a PNG image to share or download.",
      icon: <FileDown className="h-6 w-6 text-green-600" />,
      bg: "bg-green-100"
    }
  ];
  return <div className="w-full px-4 md:px-10 py-12">
      {
    /* Section Title */
  }
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 text-(--foreground)">
          <Sparkles className="h-7 w-7 text-indigo-600" />
          How It Works
        </h2>
        <p className="text-(--foreground) mt-4 max-w-2xl mx-auto text-base md:text-lg">
        Followed step to create flowcharts and diagrams.
        </p>
      </div>

      {
    /* Steps Grid */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => <Card
    key={index}
    className="hover:shadow-xl transition-transform duration-300 transform rounded-xl"
  >
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <div
    className={`w-14 h-14 rounded-full flex items-center justify-center ${step.bg}`}
  >
                {step.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                {step.description}
              </p>
            </CardContent>
          </Card>)}
      </div>
    </div>;
};
export default HowItWorks;

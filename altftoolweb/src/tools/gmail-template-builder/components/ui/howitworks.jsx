import React from "react";
import { Card, CardContent } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import HttpIcon from "@mui/icons-material/Http";
import CodeIcon from "@mui/icons-material/Code";
import SendIcon from "@mui/icons-material/Send";
import { Download, Edit3, Eye, LayoutTemplate, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
  {
    title: "Choose Email Template",
    description:
      "Select a pre-designed email template or start from a blank layout to design your email.",
    icon: <LayoutTemplate className="h-6 w-6 text-indigo-600" />,
    bg: "bg-indigo-100",
  },
  {
    title: "Customize Content & Design",
    description:
      "Edit text, images, buttons, colors, and fonts using the visual editor to match your brand.",
    icon: <Edit3 className="h-6 w-6 text-purple-600" />,
    bg: "bg-purple-100",
  },
  {
    title: "Preview Email Layout",
    description:
      "Preview your email across desktop and mobile views to ensure a perfect look everywhere.",
    icon: <Eye className="h-6 w-6 text-pink-600" />,
    bg: "bg-pink-100",
  },
  {
    title: "Export or Use Template",
    description:
      "Download the email HTML or copy the template to use with your email marketing platform.",
    icon: <Download className="h-6 w-6 text-green-600" />,
    bg: "bg-green-100",
  },
];


  return (
    <div className="w-full px-4 md:px-10 py-12 ">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 text-foreground">
          <Sparkles className="h-7 w-7 text-indigo-600" />
          How It Works
        </h2>
        <p className="text-foreground mt-4 max-w-2xl mx-auto text-base md:text-lg">
          Test APIs quickly and efficiently in just a few simple steps
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <Card
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
              <p className="text-gray-600 text-sm md:text-base">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
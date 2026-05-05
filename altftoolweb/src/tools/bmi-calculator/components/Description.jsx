import React from 'react';
import { MousePointer2, Calculator, BarChart3, Droplet, Flame, Download } from 'lucide-react';

export default function Description() {
  const steps = [
    {
      title: "Enter Measurements",
      desc: "Input your height, weight, age, and gender. Easily toggle between CM/FT and KG/LBS for your convenience.",
      icon: <MousePointer2 className="w-6 h-6" />,
    },
    {
      title: "Smart BMI Analysis",
      desc: "The system instantly calculates your BMI and identifies your health category using WHO standards.",
      icon: <Calculator className="w-6 h-6" />,
    },
    {
      title: "Weight Targets",
      desc: "Receive a personalized Ideal Weight Range based on your height to help you set realistic fitness goals.",
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      title: "Hydration Guide",
      desc: "Get an automated daily water intake recommendation tailored to your body weight for optimal health.",
      icon: <Droplet className="w-6 h-6" />,
    },
    {
      title: "Calorie Breakdown",
      desc: "Discover your BMR and the specific daily calories required for weight loss, maintenance, or muscle gain.",
      icon: <Flame className="w-6 h-6" />,
    },
    {
      title: "Export Full Report",
      desc: "Save all your health insights instantly. Download a comprehensive text report to track your progress offline.",
      icon: <Download className="w-6 h-6" />,
    }
  ];

  return (
    <div className="py-12 bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 relative">
          <h2 className="text-2xl font-black tracking-widest uppercase text-[var(--foreground)]">
            How It Works?
          </h2>
          <div className="w-16 h-1.5 bg-[var(--primary)] mx-auto mt-4 rounded-full shadow-[0_0_10px_var(--primary)]"></div>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group rounded-3xl p-8 border transition-all duration-500 hover:-translate-y-2"
              style={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                boxShadow: '0 10px 30px -15px rgba(0,0,0,0.1)'
              }}
            >
              {/* Icon Container */}
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500"
                style={{ 
                    backgroundColor: 'var(--muted)', 
                    color: 'var(--primary)' 
                }}
              >
                {step.icon}
              </div>

              {/* Number and Heading */}
              <div className="flex items-center gap-3 mb-4">
                
                <h3 className="text-lg font-bold text-[var(--foreground)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                  {step.title}
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed font-medium text-[var(--muted-foreground)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
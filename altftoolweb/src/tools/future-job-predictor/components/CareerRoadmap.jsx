"use client";
import React from "react";
import { BookOpen, Award, Clock, ArrowRight, ShieldAlert } from "lucide-react";

export default function CareerRoadmap({ activeCareer }) {
  const milestones = [
    { period: "Months 1-3", task: "Fundamentals & Certifications", desc: `Focus on acquiring key missing skills: ${activeCareer.missingSkills.join(", ")}. Enroll in online bootcamps.` },
    { period: "Months 4-6", task: "Practical Sandbox Projects", desc: "Build a portfolio showing 3 projects applying model weights, pipelines, or cloud blueprints." },
    { period: "Year 1", task: "Associate Placement / Internships", desc: "Transition into hybrid or contract roles to gain commercial experience." },
    { period: "Year 3", task: "Mid-Senior Autonomy", desc: "Acquire secondary specialized skillsets and take on team lead roles." },
  ];

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
      
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Career Path & Certification Roadmap
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Follow these structured milestones to successfully transition into the <strong>{activeCareer.name}</strong> field.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Requirements & Training */}
        <div className="space-y-4">
          
          {/* Missing Skills Warning */}
          <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Skill Gap Warning
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We identified these critical skill gaps in your profile:
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {activeCareer.missingSkills.map((sk) => (
                <span key={sk} className="px-2.5 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-md">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended training programs */}
          <div className="bg-secondary/40 border border-border/60 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Target Certifications
            </h4>
            <ul className="space-y-2">
              {activeCareer.recommendedCourses.map((c, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Estimated commitment */}
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-4 rounded-xl">
            <Clock className="w-7 h-7 text-primary" />
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Estimated Learning Time</span>
              <span className="text-sm font-black text-foreground">
                {activeCareer.learningDifficulty === "High" ? "12 - 18 Months" : activeCareer.learningDifficulty === "Medium" ? "6 - 9 Months" : "3 - 5 Months"} ({activeCareer.learningDifficulty} Difficulty)
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Timeline Steps */}
        <div className="space-y-4 relative pl-4 border-l border-border/80 ml-2">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative space-y-1">
              {/* Timeline dot */}
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
              
              <span className="text-[10px] text-primary font-extrabold uppercase">{m.period}</span>
              <h5 className="text-xs font-bold text-foreground">{m.task}</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

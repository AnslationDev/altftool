"use client";

import { Shield, Cpu, Activity, Users } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="mt-16 space-y-10">
      <div className="text-center">
        <h2 className="subheading font-bold text-2xl text-foreground mb-2">
          How AI Emotion Detection Works
        </h2>
        <p className="description text-sm text-muted-foreground max-w-xl mx-auto">
          Learn how our client-side neural network analyzes micro-expressions to determine human emotions in real-time.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          icon={<Cpu className="text-primary" size={24} />}
          title="In-Browser Neural Net"
          text="Powered by TensorFlow.js and light Convolutional Neural Networks (CNN) executing directly inside your browser tab using WebGL acceleration."
        />

        <Card
          icon={<Shield className="text-primary" size={24} />}
          title="100% Private & Secure"
          text="Your camera stream and photos never leave your device. All calculations are executed locally; no images are ever sent to an external server."
        />

        <Card
          icon={<Activity className="text-primary" size={24} />}
          title="Facial Landmarks"
          text="The AI locates 68 distinctive spatial landmarks on the jaw, eyes, brows, nose, and mouth to recognize fine contractions of facial muscles."
        />

        <Card
          icon={<Users className="text-primary" size={24} />}
          title="Multi-Face Analytics"
          text="Capable of detecting and highlighting multiple people in a single capture, generating individual emotion matrices for each person."
        />
      </div>
    </div>
  );
}

function Card({ icon, title, text }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow hover:-translate-y-1 transition duration-200">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-base text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageSquare, Send } from "lucide-react";
// import { toast } from "@/hooks/use-toast";

/* Solid Card — visible in light & dark */
const Card = ({ children, className = "" }) => (
  <div
    className={`
      rounded-xl
      bg-(--card)
      shadow-lg
      ${className}
    `}
  >
    {children}
  </div>
);

export default function Contact() {
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const router = useRouter();

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast({
      title: "Message sent",
      description: "We’ll get back to you shortly.",
    });

    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) flex flex-col">
      <main className="flex-grow py-12">
        <section className="flex justify-center px-8 md:px-14 lg:px-20">
        <div className="container mx-auto px-4 lg:px-8 space-y-12 max-w-7xl">
          {/* Hero */}
          <div className="text-center space-y-4 ">
            <h1 className="text-5xl font-bold text-(--primary)">
              Contact Us
            </h1>
            <p className="text-lg text-(--muted-foreground)">
              Questions, feedback, or suggestions — send them through.
            </p>
          </div>

          {/* Intro */}
          <Card className="p-8">
            <p className="text-(--muted-foreground) leading-relaxed">
              We read every message. Whether it’s a bug report, feature request,
              or general feedback — it helps improve AltF Tools.
               Our goal is to keep communication simple, transparent, and helpful
              for every user.
            </p>



          </Card>

          {/* Highlights */}
          <div className="grid md:grid-cols-3 gap-6">
            <Highlight
              icon={Mail}
              title="Email Support"
              text="Reach us directly via email for any queries."
            />
            <Highlight
              icon={MessageSquare}
              title="Product Feedback"
              text="Your feedback directly influences future tools."
            />
            <Highlight
              icon={Send}
              title="Fast Response"
              text="Most messages are answered within 24–48 hours."
            />
          </div>

          {/* Content */}
          <Card className="p-8 space-y-8">
            <Section title="1. Send a Message">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-md border border-border bg-(--background) px-4 py-2"
                />

                <input
                  type="email"
                  placeholder="Your email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-md border border-border bg-(--background) px-4 py-2"
                />

                <textarea
                  placeholder="Your message"
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full min-h-[140px] rounded-md border border-border bg-(--background) px-4 py-2"
                />

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-md bg-(--primary) px-4 py-2 font-medium text-(--primary-foreground)"
                >
                  Send Message
                </button>
              </form>
            </Section>

            <Section title="2. Contact Information">
              <p>
                Email: <strong>altftool@gmail.com</strong>
              </p>
              <p>
                Website: <strong>www.altftool.com</strong>
              </p>
            </Section>

            <Section title="3. Response Time">
              <p>
                We typically respond within 24–48 hours. Urgent matters should
                be clearly mentioned in the message.
              </p>
            </Section>
          </Card>
        </div>
        </section>
      </main>
    </div>
  );
}

/* Reusable blocks */

const Highlight = ({ icon: Icon, title, text }) => (
  <Card className="p-6 text-center space-y-4">
    <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6 text-(--primary)" />
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-sm text-(--muted-foreground)">{text}</p>
  </Card>
);

const Section = ({ title, children }) => (
  <div className="space-y-3 ">
    <h3 className="text-2xl font-semibold">{title}</h3>
    <div className="text-(--muted-foreground) leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

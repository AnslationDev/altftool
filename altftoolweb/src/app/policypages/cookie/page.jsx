"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cookie, Sliders, BarChart3 } from "lucide-react";

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

export default function CookiePolicy() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      router.push(`/categories/all?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) flex flex-col">
      <main className="flex-grow py-12">
        <Section className="flex justify-center px-8 md:px-14 lg:px-20">
        <div className="container mx-auto px-4 lg:px-8 space-y-12 max-w-7xl">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-(--primary)">
              Cookie Policy
            </h1>
            <p className="text-lg text-(--muted-foreground)">
              Effective Date: <span className="font-medium">24th Dec 2025</span>
            </p>
          </div>

          {/* Intro */}
          <Card className="p-8">
            <p className="text-(--muted-foreground) leading-relaxed">
              This Cookie Policy explains how <strong>AltF Tools</strong> uses
              cookies and similar technologies across our website, tools, and
              related services.
              Cookies also help us keep the platform reliable, secure, and
              consistent across different devices and browsers.
            </p>
         
          </Card>

          {/* Highlights */}
          <div className="grid md:grid-cols-3 gap-6">
            <Highlight
              icon={Cookie}
              title="Essential Cookies"
              text="Required for security, navigation, and core functionality."
            />
            <Highlight
              icon={BarChart3}
              title="Analytics"
              text="Help us understand usage and improve performance."
            />
            <Highlight
              icon={Sliders}
              title="Your Control"
              text="Manage or disable cookies through browser settings."
            />
          </div>

          {/* Policy Content */}
          <Card className="p-8 space-y-8">
            <Section title="1. What Are Cookies?">
              <p>
                Cookies are small text files stored on your device when you
                visit a website. They help remember preferences, improve
                performance, and enhance usability.
              </p>
              <p>
             They do not typically contain personal information but may be linked
             to data you voluntarily provide, such as preferences or settings.
             </p>
            </Section>
     

            <Section title="2. Types of Cookies We Use">
              <p><strong>Essential Cookies</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Core site functionality</li>
                <li>Security and fraud prevention</li>
                <li>Access to tools and services</li>
              </ul>

              <p className="mt-4"><strong>Performance & Analytics Cookies</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Pages visited and time spent</li>
                <li>Error tracking and performance metrics</li>
              </ul>

              <p className="mt-4"><strong>Functional Cookies</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Language preferences</li>
                <li>Saved tool settings</li>
              </ul>

              <p className="mt-4"><strong>Advertising Cookies</strong></p>
              <p>
                Used to deliver relevant ads and measure effectiveness.
                Third-party providers may place these cookies.
              </p>
            </Section>


            <Section title="3. Third-Party Cookies">
              <p>
                Some cookies are set by third-party services such as analytics
                and advertising partners. Their usage is governed by their own
                privacy policies.
              </p>
              <p>
               We encourage users to review the privacy and cookie policies of
               third-party services to understand how their data is handled.
              </p>
            </Section>
       

            <Section title="4. How We Use Cookies">
              <ul className="list-disc pl-5 space-y-2">
                <li>Ensure platform stability</li>
                <li>Analyze traffic and usage</li>
                <li>Improve tools and content</li>
                <li>Enhance user experience</li>
                <li>Detect suspicious activity and prevent abuse</li>
                <li>Maintain consistent performance across updates</li>

              </ul>
            </Section>
       

            <Section title="5. Managing Cookies">
              <p>
                You can control or disable cookies via browser settings.
                Disabling cookies may limit access to certain features.
              </p>
              <p>
               Instructions for managing cookies can usually be found in your
              browser’s help or settings section.
              </p>
            </Section>
          

            <Section title="6. Consent">
              <p>
                Where required, consent is obtained before placing non-essential
                cookies. Consent can be withdrawn at any time.
              </p>
              <p>
               By continuing to use our website after accepting cookies,
                you agree to the use of technologies described in this policy.
              </p>

            </Section>
            

            <Section title="7. Policy Updates">
              <p>
                This Cookie Policy may be updated periodically. Changes take
                effect immediately upon posting.
              </p>
              <p className="text-sm text-(--muted-foreground)">
               We recommend reviewing this page periodically to stay informed
              about how cookies are used.
              </p>

            </Section>
        

            <Section title="8. Contact">
              <p>Email: <strong>altftool@gmail.com</strong></p>
              <p>Website: <strong>www.altftool.com</strong></p>
            </Section>
          </Card>
        </div>
        </Section>
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
  <div className="space-y-3">
    <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
    <div className="text-(--muted-foreground) leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ShieldAlert, FileWarning } from "lucide-react";

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

export default function Disclaimer() {
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
      <main className="flex-grow px-4 py-12">
        <section className="flex justify-center px-8 md:px-14 lg:px-20">
        <div className="container mx-auto px-4 lg:px-8 space-y-12 max-w-7xl">
          {/* Hero */}
          <div className="text-center space-y-4 ">
            <h1 className="text-5xl font-bold text-(--primary)">
              Disclaimer
            </h1>
            <p className="text-lg text-(--muted-foreground)">
              Effective Date: <span className="font-medium">24th Dec 2025</span>
            </p>
          </div>

          {/* Intro */}
          <Card className="p-8">
            <p className="text-(--muted-foreground) leading-relaxed">
              The tools, content, and information provided by{" "}
              <strong>AltF Tools</strong> are for general informational and
              educational purposes only. By using the platform, you agree to
              this Disclaimer.
               This Disclaimer applies to all tools, pages, content, and services
              provided through the AltF Tools website and related platforms.
            </p>
          </Card>

          {/* Highlights */}
          <div className="grid md:grid-cols-3 gap-6">
            <Highlight
              icon={ShieldAlert}
              title="No Professional Advice"
              text="Nothing here replaces legal, financial, medical, or technical advice."
            />
            <Highlight
              icon={FileWarning}
              title="Use at Your Own Risk"
              text="All tools and content are provided as-is."
            />
            <Highlight
              icon={AlertTriangle}
              title="Limited Liability"
              text="We are not responsible for damages or losses."
            />
          </div>

          {/* Content */}
          <Card className="p-8 space-y-8">
            <Section title="1. No Professional Advice">
              <p>
                Content on this platform does not constitute legal, financial,
                medical, business, or technical advice. Always consult a
                qualified professional before acting on any information.
              </p>
              <p>
             Information provided should not be relied upon as a substitute
              for professional consultation tailored to your specific situation.
             </p>
            </Section>
  

            <Section title="2. Use of Microtools">
              <p>
                All microtools are provided on an “as-is” and “as-available”
                basis. We make no guarantees regarding accuracy, reliability,
                availability, or suitability.
              </p>
              <p>
                Any reliance on tool output is entirely at your own risk.
              </p>
            </Section>
       

            <Section title="3. Blog & Educational Content">
              <p>
                Blog posts and educational materials are informational only.
                We do not guarantee correctness or completeness, and we are
                not liable for actions taken based on this content.
              </p>
              <p>
              Content is shared to explain concepts, workflows, and ideas
               based on general experience and research.
              </p>
            </Section>
        

            <Section title="4. External Links">
              <p>
                The platform may link to third-party websites or services. We
                do not control or endorse them and are not responsible for
                their content, policies, or practices.
              </p>
              <p>
             Accessing third-party links is done at your own discretion and risk.
             </p>
            </Section>
      

            <Section title="5. Advertising & Affiliates">
              <p>
                AltF Tools may display advertisements or affiliate links. We
                may earn commissions at no additional cost to users. We do not
                guarantee third-party products or services.
              </p>
            </Section>


            <Section title="6. Limitation of Liability">
              <p>
                To the fullest extent permitted by law, AltF Tools shall not be
                liable for any direct, indirect, incidental, consequential, or
                special damages arising from use of the platform.
              </p>
              <p>
                This limitation applies even if AltF Tools has been advised
                  of the possibility of such damages.
              </p>
            </Section>
 

            <Section title="7. No Guarantees">
              <ul className="list-disc pl-5 space-y-2">
                <li>Accuracy or correctness of results</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Availability of third-party APIs or services</li>
              </ul>
              
            </Section>


            <Section title="8. Policy Updates">
              <p>
                This Disclaimer may be updated at any time. Updates take effect
                immediately upon publication.
              </p>
              <p >
                 Continued use of the platform after updates constitutes
                  acceptance of the revised Disclaimer.
              </p>
            </Section>
         

            <Section title="9. Contact">
              <p>Email: <strong>altftool@gmail.com</strong></p>
              <p>Website: <strong>www.altftool.com</strong></p>
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
  <div className="space-y-3">
    <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
    <div className="text-(--muted-foreground) leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);


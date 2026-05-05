"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Shield, Gavel } from "lucide-react";

/* Solid Card — visible in light & dark */
const Card = ({ children, className = "" }) => (
  <div
    className={`
      rounded-xl
      bg-(--card)
      ${className}
    `}
  >
    {children}
  </div>
);

export default function TermsAndConditions() {
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
        <section className="flex justify-center px-8 md:px-14 lg:px-20">
        <div className="container max-w-7xl mx-auto space-y-12 px-4 lg:px-8">
          {/* Hero */}
          <div className="text-center space-y-4 ">
            <h1 className="text-5xl font-bold text-(--primary)">
              Terms & Conditions
            </h1>
            <p className="text-lg text-(--muted-foreground)">
              Effective Date: <span className="font-medium">24th Dec 2025</span>
            </p>
          </div>

          {/* Intro */}
          <Card className="p-8">
            <p className="text-(--muted-foreground) leading-relaxed">
              Welcome to <strong>AltF Tools</strong>. These Terms & Conditions
              govern your access to and use of our website, microtools, and
              related services. By using the platform, you agree to these Terms.
            </p>
          </Card>

          {/* Highlights */}
          <div className="grid md:grid-cols-3 gap-6">
            <Highlight
              icon={Shield}
              title="Eligibility"
              text="Users must meet age and legal requirements."
            />
            <Highlight
              icon={FileText}
              title="Acceptable Use"
              text="Services must be used lawfully and responsibly."
            />
            <Highlight
              icon={Gavel}
              title="Legal Protection"
              text="Clear limits on warranties and liability."
            />
          </div>

          {/* Terms Content */}
          <Card className="p-8 space-y-8">
            <Section title="1. Eligibility">
              <ul className="list-disc pl-5 space-y-2">
                <li>You are at least 13 years old</li>
                <li>You have legal capacity to accept these Terms</li>
                <li>You comply with applicable laws and regulations</li>
              </ul>
              
            </Section>
        

            <Section title="2. Use of Services">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe intellectual property rights</li>
                <li>Disrupt or interfere with platform functionality</li>
                <li>Attempt unauthorized access to systems</li>
                <li>Upload malware, spam, or harmful content</li>
              </ul>
            </Section>
             

            <Section title="3. Microtools Usage">
              <p>
                All microtools are provided on an “as-is” and “as-available”
                basis. We do not guarantee accuracy, reliability, or suitability
                for any purpose.
              </p>
              <p>Use of tools is entirely at your own risk.</p>
              <p>
               Tool outputs are generated automatically and may vary based on input,
               system updates, or third-party dependencies.
              </p>
             <p>
              Results should not be relied upon as professional, legal, financial, or
              technical advice.
             </p>

            </Section>
             

            <Section title="4. Intellectual Property">
              <p>
                All content, tools, designs, and software are owned by
                AltF Tools or its licensors and protected by intellectual
                property laws.
              </p>
              <p>
                You may not copy, modify, distribute, or commercially exploit
                any part of the Services without written permission.
              </p>
              <p>
                All trademarks, logos, and brand elements displayed on the platform remain
                the exclusive property of AltF Tools.
              </p>

            </Section>
              

            <Section title="5. User-Generated Content">
              <p>
                By submitting content, you grant AltF Tools a non-exclusive,
                royalty-free license to use and display it. We reserve the right
                to remove content at our discretion.
              </p>
              <p>
               You are solely responsible for ensuring that submitted content does not
               violate any third-party rights or applicable laws.
              </p>

            </Section>
              

            <Section title="6. Third-Party Services">
              <p>
                We do not control or endorse third-party websites or services
                and are not responsible for their content or practices.
              </p>
              <p>
                Accessing third-party services is done at your own discretion and risk.
              </p>

            </Section>
          

            <Section title="7. Advertising & Affiliates">
              <p>
                The platform may display advertisements or affiliate links. We
                may earn commissions at no additional cost to users.
              </p>
              <p>
                Some links may be affiliate-based, meaning we may earn a commission without
                additional cost to you.
               </p>

            </Section>
            

            <Section title="8. Disclaimer of Warranties">
              <p>
                Services are provided “as-is” and “as-available” without
                warranties of any kind, express or implied.
              </p>
              <p>
               We make no guarantees regarding availability, accuracy, or uninterrupted
               operation of the Services.
              </p>

            </Section>
             

            <Section title="9. Limitation of Liability">
              <p>
                To the fullest extent permitted by law, AltF Tools shall not be
                liable for any damages arising from use or inability to use the
                Services.
              </p>
              <p>
               This limitation applies even if we have been advised of the possibility of
               such damages.
              </p>

            </Section>
             

            <Section title="10. Indemnification">
              <p>
                You agree to indemnify and hold harmless AltF Tools from any
                claims arising from your use of the Services or violation of
                these Terms.
              </p>
              <p>
               This obligation survives termination of these Terms.
              </p>

            </Section>
    

            <Section title="11. Termination">
              <p>
                We may suspend or terminate access at any time without notice
                for violations or harmful conduct.
              </p>
              <p>
               Termination does not affect provisions that by nature should survive,
               including intellectual property and liability clauses.
              </p>

            </Section>
             

            <Section title="12. Governing Law">
              <p>
                These Terms are governed by the laws of
                <strong> India</strong>.
              </p>
              <p>
              Courts located in India shall have exclusive jurisdiction over disputes.
              </p>

            </Section>
            

            <Section title="13. Changes to These Terms">
              <p>
                Continued use of the platform after updates constitutes
                acceptance of the revised Terms.
              </p>
              <p>
              Updated versions will be posted on this page with a revised effective date.
             </p>

            </Section>
            

            <Section title="14. Contact">
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
    <h3 className="text-2xl font-semibold">{title}</h3>
    <div className="text-(--muted-foreground) leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

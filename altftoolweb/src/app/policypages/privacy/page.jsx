"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, FileText, Lock } from "lucide-react";

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

export default function PrivacyPolicy() {
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
        <div className="container px-4 lg:px-8  max-w-7xl mx-auto space-y-12">
          {/* Hero */}
          <div className="text-center space-y-4 ">
            <h1 className="text-5xl font-bold text-(--primary)">
              Privacy Policy
            </h1>
            <p className="text-lg text-(--muted-foreground)">
              Effective Date: <span className="font-medium">24th Dec 2025</span>
            </p>
          </div>

          {/* Intro */}
          <Card className="p-8">
            <p className="text-(--muted-foreground) leading-relaxed">
              At <strong>AltF Tools</strong>, protecting user privacy is a core
              principle. This Privacy Policy explains how information is
              collected, used, and safeguarded across our platform.
            </p>
            <p className="mt-3 text-sm text-(--muted-foreground)">
            This policy applies to all visitors, users, and interactions across
            AltF Tools, including web pages, tools, blogs, and related services.
             </p>

          </Card>

          {/* Highlights */}
          <div className="grid md:grid-cols-3 gap-6">
            <Highlight
              icon={Shield}
              title="Privacy Focused"
              text="We collect only what’s necessary to operate the platform."
            />
            <Highlight
              icon={Lock}
              title="Secure by Design"
              text="Reasonable safeguards protect user information."
            />
            <Highlight
              icon={FileText}
              title="Transparency"
              text="Clear explanation of how data is handled."
            />
          </div>

          {/* Policy Content */}
          <Card className="p-8 space-y-8">
            <Section title="1. Information We Collect">
              <p>
                <strong>Personal Information:</strong> Name, email address, and
                information voluntarily submitted via forms or contact
                channels.
              </p>
              <p>
                <strong>Non-Personal Information:</strong> IP address, browser
                type, device data, usage metrics, and referral sources.
              </p>
              <p>
                <strong>Cookies:</strong> Used to enhance functionality,
                analyze traffic, improve tools, and support advertising.
              </p>
              <p className="text-sm text-(--muted-foreground)">
  We avoid collecting sensitive personal data unless it is absolutely
  necessary for a specific feature and clearly disclosed in advance.
</p>

            </Section>
      

            <Section title="2. How We Use Information">
              <ul className="list-disc pl-5 space-y-2">
                <li>Operate and improve tools and services</li>
                <li>Respond to inquiries and support requests</li>
                <li>Analyze usage and performance</li>
                <li>Display advertisements and promotions</li>
                <li>Comply with legal obligations</li>
                <li>Maintain security and prevent abuse or misuse</li>
<li>Improve user experience and interface usability</li>

              </ul>
              <p className="text-sm text-(--muted-foreground)">
  We do not use personal data for automated decision-making or profiling
  that produces legal or significant effects.
</p>

            </Section>
       

            <Section title="3. Microtools & Data Processing">
              <p>
                User input is processed only to generate results. We do not
                store sensitive data such as passwords or financial information
                unless explicitly stated for a specific tool.
              </p>
              <p>
                Some tools may rely on third-party APIs. Their data handling is
                governed by their own privacy policies.
              </p>
              <p>
  Data entered into tools is typically processed in real time and
  discarded immediately after the result is generated.
</p>
<p className="text-sm text-(--muted-foreground)">
  Where temporary processing is required, data is handled securely
  and retained only for the minimum duration necessary.
</p>
            </Section>
           

            <Section title="4. Blogs & User Content">
              <p>
                Blog content is informational only. Any personal information
                shared publicly is done at the user’s discretion.
              </p>
              <p>
  Users are advised not to share sensitive or confidential information
  in public comments or community interactions.
</p>
            </Section>
          

            <Section title="5. Advertising & Third Parties">
              <p>
                Third-party advertisers may use cookies or similar technologies.
                We do not control their data practices.
              </p>
              <p>
              Third-party services may collect information independently in
              accordance with their own privacy policies and terms.
               </p>

               <p className="text-sm text-(--muted-foreground)">
                 AltF Tools encourages users to review third-party privacy policies
                 before interacting with external content.
                </p>

            </Section>
           

            <Section title="6. Data Sharing">
              <p>
                We do not sell personal data. Information may be shared only:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>With trusted service providers</li>
                <li>To comply with legal requirements</li>
                <li>To protect users and platform integrity</li>
                <li>During business transfers or acquisitions</li>
              </ul>
            </Section>
            <p className="text-sm text-(--muted-foreground)">
                All service providers are required to follow appropriate data
                 protection and confidentiality obligations.
             </p>

    

            <Section title="7. Data Security">
              <p>
                Reasonable technical and organizational measures are applied,
                but no system can guarantee absolute security.
              </p>
              <p>
              We regularly review security practices and update safeguards
              to reflect industry standards and evolving risks.
              </p>

            </Section>
           

            <Section title="8. Children’s Privacy">
              <p>
                Services are not intended for children under 13. Any such data
                will be removed if identified.
              </p>
              <p className="text-sm text-(--muted-foreground)">
                Parents or guardians who believe a child has provided personal data
                 may contact us for prompt removal.
              </p>

            </Section>
        

            <Section title="9. Policy Updates">
              <p>
                This Privacy Policy may be updated at any time. Continued use of
                the platform constitutes acceptance of the revised policy.
              </p>
              <p className="text-sm text-(--muted-foreground)">
                  We recommend reviewing this policy periodically to stay informed
                 about how your information is protected.
              </p>

            </Section>
          

            <Section title="10. Contact">
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

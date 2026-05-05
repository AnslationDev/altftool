"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, ShieldCheck, DollarSign,BadgeCheck } from "lucide-react";

 
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

export default function AffiliateDisclosure() {
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
        <div className="container mx-auto px-4 lg:px-8 space-y-12 max-w-7xl">
          {/* Hero */}
          <div className="text-center space-y-4 ">
            <h1 className="text-4xl md:text-5xl font-bold text-(--primary)">
              Affiliate Disclosure
            </h1>
            <p className="text-lg text-(--muted-foreground)">
              Effective Date:{" "}
              <span className="font-medium">24th Dec 2025</span>
            </p>
          </div>
   

          {/* Intro */}
          <Card className="p-8 text-center">
            <p className="max-w-2xl mx-auto text-(--muted-foreground) leading-relaxed">
              At <strong>AltF Tools</strong>, transparency and trust matter.
              This Affiliate Disclosure explains how affiliate links and
              partnerships are used across our platform.
            </p>
            
          </Card>

          {/* Highlights */}
          <div className="grid md:grid-cols-3 gap-6">
            <Highlight
              icon={Link2}
              title="Affiliate Links"
              text="Some links may earn us a commission at no extra cost to you."
            />
            <Highlight
              icon={ShieldCheck}
              title="Editorial Integrity"
              text="Partnerships never influence tools, reviews, or opinions."
            />
            <Highlight
              icon={DollarSign}
              title="No Extra Cost"
              text="You pay the same price whether you use an affiliate link or not."
            />
          </div>

          {/* Policy */}
          <Card className="p-8 space-y-8">
            <Section title="1. Affiliate Relationships">
              <p>
                AltF Tools participates in affiliate marketing programs.
                Some links may earn us a commission at no additional cost.
              </p>
               <p>
             These relationships help support ongoing development,
             infrastructure maintenance, and feature improvements.
              </p>
            </Section>
           

            <Section title="2. Purpose of Affiliate Links">
              <ul className="list-disc pl-5 space-y-2">
                <li>Maintain and improve the platform</li>
                <li>Publish free microtools</li>
                <li>Cover hosting and development costs</li>
                 <li>Ensure long-term sustainability of the project</li>
                 <li>Support performance and security upgrades</li>
              </ul>
            </Section>
          

            <Section title="3. Editorial Integrity">
              <p>Affiliate partnerships do not influence:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Tool functionality</li>
                <li>Content accuracy</li>
                <li>Reviews or recommendations</li>
              </ul>
               <p>
    All tools and content are created based on real use cases
    and internal quality standards, independent of any partnership.
  </p>
            </Section>
   

            <Section title="4. Third-Party Websites">
              <p>
                Affiliate links may redirect to third-party websites.
                We do not control their content or policies.
              </p>
               <p>
                  Users are encouraged to review the privacy policies,
                   terms, and practices of any external site they visit.
                </p>
            </Section>
         

            <Section title="5. No Additional Cost">
              <p>
                Clicking affiliate links does not increase the price you pay.
              </p>
              <p>
                 In some cases, affiliate links may even provide special
                  discounts or benefits directly from the provider.
              </p>
            </Section>
       

            <Section title="6. Compliance">
              <p>
                This policy complies with FTC guidelines and advertising laws.
              </p>
              <p>
                  We continuously review our disclosures to ensure they remain
                 accurate, clear, and legally compliant.
              </p>
            </Section>
         

            <Section title="7. Policy Updates">
              <p>
                We may update this policy at any time with immediate effect.
              </p>
               <p>
                 Any changes will be reflected on this page along with
                 an updated effective date.
               </p>
            </Section>
          

            <Section title="8. Contact">
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
      <Icon className="w-6 h-6 text-(--primary)" /> </div> 
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

   

  

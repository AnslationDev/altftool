"use client";

import Image from "next/image";
import { Check, Loader2 } from "lucide-react";

export default function NewsletterSection({
  email,
  setEmail,
}) {

  const handleSubmit = () => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email");
    return;
  }

  alert("Newsletter feature coming soon!🚀 ");
};
  return (
    <section className="section bg-(--background) relative overflow-hidden mb-15">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xl:gap-14 items-center bg-(--flashsale-salelocator) p-2 py-5  rounded-3xl ">
        {/* LEFT IMAGE  */}
        <div className="relative order-2 lg:order-1">
          <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[520px] xl:h-[550px]">
            <Image
              src="/sale-locator/news-letter/newsletter-girlimg.png"
              alt="Deal Alerts"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-contain object-left"
            />
          </div>
        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="order-1 lg:order-2 lg:pr-4 xl:pr-8">
          {/* Heading */}
          <div className="mb-6">
            <h2 className="section-title text-left! leading-[1.15] mb-3 relative">
              Never Miss
              <br />
              The Best Deals Near You
              {/* svg image */}
                <Image
              src="/sale-locator/news-letter/svg.png"
              alt="svg-highlight"
              width={80} height={80}             
              className="absolute top-3 right-18  [@media(min-width:425)]:right-31  md:top-5 [@media(min-width:768)]:right-23  [@media(min-width:1440)]:right-5
               lg:top-5 lg:right-6 w-12 sm:w-12 md:w-16 lg:w-26 pointer-events-none"
            />
            </h2>
                  
             <p className="text-(--muted-foreground) font-medium text-base md:text-xl font-secondary">
              Enter Your Email Below For Daily Updates
            </p>
          </div>

          {/* Success */}
       
            <>
              {/* Input */}
              <div className="max-w-[560px]">
                <div
                  className={`h-[55px] rounded-full border bg-(--background) px-6 flex items-center transition-all
                   border-gray-300 focus-within:ring-1 focus-within:ring-(--primary)`}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                     
                    }}
                   onKeyDown={(e) => {
                     if (e.key === "Enter") {
                       handleSubmit();
                       setEmail("")
                     }
                   }}
                    placeholder="Enter your email for deal alerts"
                    className="w-full bg-transparent outline-none text-sm md:text-base text-(--foreground) placeholder:text-(--muted-foreground) font-secondary"
                  />
                </div>
               
              </div>

              {/* Benefits */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-6">
                {["Weekly curated deals", "No spam, unsubscribe anytime"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#2F66E8] flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      </div>

                      <span className="text-sm md:text-base text-(--foreground) font-medium font-secondary">
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {/* Button */}
              <div className="mt-7">
                <button
                  onClick={() =>{ handleSubmit(); setEmail("")}} 
                               
                  className=" h-[50px] px-8 md:px-10 rounded-full bg-[#2F66E8] text-white text-sm md:text-lg font-secondary hover:opacity-95 transition cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
                >
                 Get Deal Alerts
                </button>
              </div>
            </>
         
        </div>
      </div>
    </section>
  );
}

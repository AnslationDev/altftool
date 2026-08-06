"use client";

import Image from "next/image";
import { Check } from "lucide-react";

export default function NewsletterSection() {
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
                width={80}
                height={80}
                className="absolute top-3 right-18  [@media(min-width:425)]:right-31  md:top-5 [@media(min-width:768)]:right-23  [@media(min-width:1440)]:right-5
               lg:top-5 lg:right-6 w-12 sm:w-12 md:w-16 lg:w-26 pointer-events-none"
              />
            </h2>

            <p className="text-(--muted-foreground) font-medium text-base md:text-xl font-secondary">
              Deal alerts are not accepting sign-ups yet
            </p>
          </div>

          <div className="max-w-xl">
            <div
              className={`min-h-14 rounded-full border bg-(--card) px-6 flex items-center transition-all
                 border-(--border) focus-within:ring-2 focus-within:ring-(--primary)/20 focus-within:border-(--primary)`}
            >
              <input
                aria-label="Deal-alert email sign-ups are coming soon"
                type="email"
                value=""
                readOnly
                disabled
                placeholder="Email sign-ups coming soon"
                className="w-full bg-transparent outline-none text-sm md:text-base text-(--foreground) placeholder:text-(--muted-foreground) font-secondary"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-6">
            {[
              "Email collection is not active",
              "Deal alerts are coming soon",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-(--primary) flex items-center justify-center shrink-0">
                  <Check
                    className="h-4 w-4 text-(--primary-foreground)"
                    strokeWidth={3}
                  />
                </div>

                <span className="text-sm md:text-base text-(--foreground) font-medium font-secondary">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <button
              type="button"
              disabled
              className="min-h-12 px-8 md:px-10 rounded-full bg-(--primary) text-(--primary-foreground) text-sm md:text-lg font-secondary transition inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Deal Alerts Coming Soon
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

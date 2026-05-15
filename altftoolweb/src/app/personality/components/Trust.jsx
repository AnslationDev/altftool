"use client";

import {
  Users,
  BarChart3,
  ShieldCheck,
  Globe,
  Sparkles,
  Lock,
} from "lucide-react";

const stats = [
  {
    value: "500K+",
    label: "Tests Completed",
    icon: Users,
  },
  {
    value: "98%",
    label: "User Satisfaction",
    icon: ShieldCheck,
  },
  {
    value: "100%",
    label: "Data Privacy",
    icon: Lock,
  },
  {
    value: "150+",
    label: "Countries",
    icon: Globe,
  },
];

export default function Trust() {
  return (
    <section className="section">
      <div className="">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="section-title max-w-[700px] mx-auto mb-4">
            Trusted, Secure & Loved Worldwide
          </h2>

          <p className="section-subtitle max-w-[580px] mx-auto">
            Join thousands of users who trust our platform for accurate
            insights and meaningful personal growth.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;

            return (
              <div
                key={i}
                className="
                  group
                  rounded-[24px]
                  border border-(--border)
                 bg-(--background)
                  p-5 sm:p-6 lg:p-8
                  flex flex-col items-center text-center
                  transition-all duration-300
                  shadow-[0px_8px_30px_0px_#00000008]
                  hover:shadow-[0px_18px_40px_0px_rgba(0,0,0,0.08)]
                  hover:-translate-y-1
                  
                "
              >
                {/* Icon */}
                <div
                  className="
                    w-14 h-14 sm:w-17 sm:h-17
                    rounded-full
                    flex items-center justify-center
                    mb-5 lg:mb-8
                    bg-(--primary)/10
                    text-(--primary)
                    transition-transform duration-300
                    group-hover:scale-110
                  "
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />
                </div>

                {/* Value */}
                <span
                  className="
                    text-(--foreground)
                    font-bold
                    text-[22px] sm:text-[26px] lg:text-[32px]
                    leading-none
                    mb-2 sm:mb-3
                  "
                >
                  {stat.value}
                </span>

                {/* Label */}
                <span
                  className="
                    text-(--muted-foreground)
                    font-semibold
                    text-[10px] sm:text-[14px] lg:text-[15px]
                    leading-[22px]
                  "
                >
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-10 md:mt-14 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 w-full max-w-[600px]">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-(--border)" />

            <div
              className="
                w-9 h-9
                rounded-full
                border-2 border-(--primary)
                bg-(--muted)
                flex items-center justify-center
                text-(--primary)
              "
            >
              <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>

            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-(--border)" />
          </div>

          <p className="text-center text-(--muted-foreground) text-[14px] sm:text-[15px] leading-[24px] max-w-[500px]">
            Your data is safe with us. We never share your information and
            follow industry-leading security practices.
          </p>
        </div>
      </div>
    </section>
  );
}
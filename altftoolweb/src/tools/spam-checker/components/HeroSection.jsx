"use client";
import Image from "next/image";
import illustration from "../assets/Emails-bro.png";
// import illustration from "../assets/Email";

export default function HeroSection() {
  return (
    <section
      className="
        relative min-h-[90vh] flex flex-col overflow-hidden rounded-2xl
        bg-linear-to-b 
        from-(--background) to-(--muted)
        text-(--foreground)
      "
    >
      {/* ===== HERO CONTENT ===== */}
      <div
        className="
          flex flex-col md:flex-row items-center justify-between flex-1
          px-4 sm:px-6 mt-8 md:px-10 md:mt-10
        "
      >
        {/* LEFT SIDE - TEXT */}
        <div className="max-w-xl text-center md:text-left">
          <h2
            className="
              text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4
              text-(--primary)
            "
          >
            Detect Spam Before You Send It
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-(--foreground)/80">
            Instantly analyze your email&apos;s content and make sure it lands
            in the inbox, not the spam folder.
          </p>

          <a
            href="#check-spam"
            className="
              inline-block mt-6
              bg-(--primary) text-(--primary-foreground)
              hover:bg-blue-700 dark:hover:bg-blue-600
              px-6 py-3 rounded-md text-lg
              shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--primary)
              transition-all duration-200
              transform hover:scale-105 active:scale-95
            "
          >
            Start Checking
          </a>
        </div>

        {/* RIGHT SIDE - ILLUSTRATION */}
        <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center relative">
          <div
            className="
              absolute inset-0 
              bg-linear-to-br 
              from-(--background)/60 to-(--muted)/40
              rounded-xl blur-sm
            "
          ></div>

          <Image
            src={illustration}
            alt="spam detection illustration"
            className="relative w-50 sm:w-62.5 md:w-75 lg:w-105 drop-shadow-lg animate-float"
          />
        </div>
      </div>
    </section>
  );
}

import React from "react";

const Hero = () => {
  return (
    <section className="w-full pb-16 bg-(--background) border-b border-(--border)">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT TEXT BLOCK */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-(--foreground) leading-tight">
              <span className="block mb-2">YouTube Video</span>
              <span className="block">Information Viewer</span>
            </h1>

            <p className="text-lg md:text-xl text-(--muted-foreground) max-w-2xl leading-relaxed">
              Discover detailed information about any YouTube video. Get
              insights into video metadata, thumbnails, and more with our clean
              interface.
            </p>

            {/* Feature Pills */}
            {/* <div className="flex flex-wrap gap-4">
              {[
                { icon: "🎥", label: "Video Analysis" },
                { icon: "📊", label: "Detailed Metadata" },
                { icon: "🚀", label: "Lightning Fast" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-3 px-5 py-3 bg-(--background) rounded-full shadow-md border border-(--border) hover:shadow-lg transition-shadow duration-300"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-semibold text-(--foreground)">
                    {item.label}
                  </span>
                </div>
              ))}
            </div> */}
          </div>

          {/* RIGHT PREVIEW MOCKUP */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Background Blobs (use primary color variables) */}
              <div className="absolute -top-6 -right-6 w-64 h-64 bg-(--primary) rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-(--primary) rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

              {/* MOCKUP CARD */}
              <div
                className={`
                  relative bg-(--background) rounded-2xl shadow-xl
                  border border-(--border) overflow-hidden
                `}
              >
                {/* Fake Title Bar */}
                <div className="p-4 bg-(--muted) border-b border-(--border)">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                {/* Fake Video Preview */}
                <div className="p-6">
                  <div
                    className={`
                      aspect-video rounded-lg mb-4
                      bg-linear-to-br from-(--primary) to-(--primary-foreground)
                      flex items-center justify-center
                    `}
                  >
                    <div className="text-(--card-foreground) text-5xl font-bold">
                      ▶
                    </div>
                  </div>

                  {/* Placeholder Text Lines */}
                  <div className="space-y-3">
                    <div className="h-4 bg-(--muted) rounded w-full"></div>
                    <div className="h-4 bg-(--muted) rounded w-5/6"></div>
                    <div className="h-4 bg-(--muted) rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

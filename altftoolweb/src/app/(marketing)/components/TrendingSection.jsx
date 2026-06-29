import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  TrendingUp,
  UsersRound,
} from "lucide-react";

const trendingTools = [
  {
    title: "Image Compressor",
    tag: "Image Tools",
    href: "/tools/all/image-compressor",
    image: "/images/featured4.png",
    description: "Compress images instantly and reduce file size efficiently.",
    rating: "4.9",
    reviews: "12.4K",
    growth: "24%",
    users: "12M+",
  },
  {
    title: "QR Generator",
    tag: "Web Tools",
    href: "/tools/all/qr-generator",
    image: "/images/featured3.png",
    description: "Generate QR codes instantly for links, text, and data.",
    rating: "4.8",
    reviews: "8.7K",
    growth: "15%",
    users: "9M+",
  },
  {
    title: "Color Palette from Image",
    tag: "Design Tools",
    href: "/tools/all/color-palette-from-image",
    image: "/images/featured5.png",
    description: "Extract a practical color palette from uploaded images.",
    rating: "4.7",
    reviews: "7.3K",
    growth: "12%",
    users: "7M+",
  },
  {
    title: "PDF to Image Converter",
    tag: "PDF Tools",
    href: "/tools/all/pdf-to-image-converter",
    image: "/images/featured1.png",
    description: "Convert PDF pages into PNG, JPG, or WebP images in your browser.",
    rating: "4.8",
    reviews: "5.1K",
    growth: "9%",
    users: "5M+",
  },
];

export default function TrendingSection() {
  return (
    <section className="section home-trending-section">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="home-kicker">
            <TrendingUp className="h-4 w-4 text-[#ef4444]" />
            Trending now
          </p>
          <h2 className="section-title">Top tools trending this week</h2>
        </div>
        <Link href="/tools/all" className="home-reference-link">
          View all trending
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {trendingTools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="home-trending-card group"
            >
              <span className="relative block">
                <span className="home-tool-preview home-tool-preview-image">
                  <Image
                    src={tool.image}
                    alt={`${tool.title} preview`}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_45%,rgba(255,255,255,0.55)_100%)]" />
                </span>
              </span>

              <span className="home-trending-content">
                <span className="home-trending-title-row">
                  <span className="home-trending-title">
                  {tool.title}
                  </span>
                  <span className="home-trending-tag">
                    {tool.tag}
                  </span>
                </span>

                <span className="home-trending-description">
                  {tool.description}
                </span>

                <span className="home-trending-rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="ml-1 text-xs font-bold text-[var(--muted-foreground)]">
                    {tool.rating} ({tool.reviews})
                  </span>
                </span>

                <span className="home-trending-meta">
                  <span className="inline-flex items-center gap-1 text-[#10b981]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {tool.growth} this week
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--muted-foreground)]">
                    {tool.users} users
                    <UsersRound className="h-3.5 w-3.5" />
                  </span>
                </span>
              </span>
            </Link>
        ))}
      </div>
    </section>
  );
}

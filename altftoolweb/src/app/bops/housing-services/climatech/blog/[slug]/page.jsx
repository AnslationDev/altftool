import { blogArticles } from "../../data/blogData";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

const CONTACT_URL = "/policypages/contact";

export async function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  const path = `/bops/housing-services/climatech/blog/${slug}`;

  if (!article) {
    return createPageMetadata({
      title: "ClimaTech guide not found",
      path,
      noindex: true,
      follow: false,
    });
  }

  return createPageMetadata({
    title: article.seoTitle,
    description: article.metaDesc,
    path,
    image: article.image,
    type: "article",
    noindex: true,
    follow: true,
    pageType: "business-ops-preview",
  });
}

export default async function BlogPage({ params }) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  // Get related blogs (excluding current)
  const relatedBlogs = blogArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  // List of all services for sidebar
  const relatedServices = [
    { title: "AC Repair", href: "/hvac#services" },
    { title: "Heating Installation", href: "/hvac#services" },
    { title: "Air Duct Cleaning", href: "/hvac#services" },
    { title: "HVAC Maintenance", href: "/hvac#services" },
    { title: "Smart Thermostat Setup", href: "/hvac#services" },
    { title: "Emergency HVAC Service", href: "/hvac#services" },
  ];

  return (
    <main className="bg-[#F7F3EB] min-h-screen text-[#1a1a1a] overflow-x-hidden font-sans">
      <Header />

      {/* Hero Banner Section */}
      <section
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-cover bg-center overflow-hidden border-b border-[#D4C9B5]/40"
        style={{ backgroundImage: `url(${article.image})` }}
      >
        {/* Glassmorphism/Overlay */}
        <div className="absolute inset-0 bg-[#F7F3EB]/60 backdrop-blur-lg" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 text-[#1a1a1a]">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-[#C5D2E8]/20 rounded-full border border-[#C5D2E8]/40 text-[#5a6f8a] mb-6">
            {article.category}
          </span>
          <h1 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium mb-8 leading-tight text-[#1a1a1a]">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#555]">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#5a6f8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {article.publishDate}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#5a6f8a]/40" />
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#5a6f8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {article.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Main Featured Image */}
          <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl mb-16 border border-[#D4C9B5]/40">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-start">
            {/* Left: Article Body */}
            <div className="lg:col-span-2 space-y-12">
              {/* Introduction */}
              <div className="prose prose-lg max-w-none text-[#555] leading-relaxed space-y-6">
                <p className="text-xl text-[#1a1a1a] font-light leading-relaxed first-letter:text-5xl first-letter:font-serif-display first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-[#5a6f8a]">
                  {article.introduction}
                </p>
              </div>

              {/* What is it section */}
              <div className="border-t border-[#D4C9B5]/40 pt-10">
                <h2 className="font-serif-display text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-6">
                  What is {article.category === "Maintenance" || article.category === "Smart Tech" ? "this service" : article.category}?
                </h2>
                <p className="text-[#555] leading-relaxed text-lg">
                  {article.whatIsIt}
                </p>
              </div>

              {/* Why it is important */}
              <div className="border-t border-[#D4C9B5]/40 pt-10">
                <h2 className="font-serif-display text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-6">
                  Why Professional {article.category} Matters
                </h2>
                <p className="text-[#555] leading-relaxed text-lg">
                  {article.whyImportant}
                </p>
              </div>

              {/* Common Problems & Warning Signs */}
              <div className="grid md:grid-cols-2 gap-8 border-t border-[#D4C9B5]/40 pt-10">
                <div>
                  <h3 className="font-serif-display text-xl md:text-2xl font-medium text-[#1a1a1a] mb-5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Common Problems
                  </h3>
                  <ul className="space-y-4">
                    {article.commonProblems.map((prob, idx) => (
                      <li key={idx} className="bg-[#EFE6D6]/50 border border-[#D4C9B5]/20 rounded-xl p-5">
                        <strong className="block text-[#1a1a1a] font-medium mb-1">{prob.title}</strong>
                        <span className="text-[#555] text-sm leading-relaxed block">{prob.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-serif-display text-xl md:text-2xl font-medium text-[#1a1a1a] mb-5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Key Warning Signs
                  </h3>
                  <ul className="space-y-4">
                    {article.warningSigns.map((sign, idx) => (
                      <li key={idx} className="bg-[#EFE6D6]/50 border border-[#D4C9B5]/20 rounded-xl p-5">
                        <strong className="block text-[#1a1a1a] font-medium mb-1">{sign.title}</strong>
                        <span className="text-[#555] text-sm leading-relaxed block">{sign.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Benefits */}
              <div className="border-t border-[#D4C9B5]/40 pt-10">
                <h2 className="font-serif-display text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-6">
                  Key Benefits of Timely Service
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {article.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-[#1a1a1a] font-medium mb-1">{benefit.title}</h4>
                        <p className="text-[#555] text-sm leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Process */}
              <div className="border-t border-[#D4C9B5]/40 pt-10">
                <h2 className="font-serif-display text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-8">
                  Our Professional Process
                </h2>
                <div className="relative border-l-2 border-[#D4C9B5]/40 ml-4 pl-8 space-y-10">
                  {article.process.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-semibold">
                        {step.step}
                      </span>
                      <h4 className="text-lg font-medium text-[#1a1a1a] mb-2">{step.title}</h4>
                      <p className="text-[#555] leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DIY Maintenance Tips */}
              <div className="border-t border-[#D4C9B5]/40 pt-10">
                <h2 className="font-serif-display text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-6">
                  Pro-Tips & Preventative Care
                </h2>
                <div className="bg-[#EFE6D6] border border-[#D4C9B5]/60 rounded-2xl p-8 space-y-6">
                  {article.maintenanceTips.map((tip, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-lg bg-[#C5D2E8]/40 border border-[#C5D2E8]/60 flex items-center justify-center flex-shrink-0 text-[#1a1a1a]">
                        🛠️
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-[#1a1a1a] mb-1">{tip.title}</h4>
                        <p className="text-[#555] text-sm leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div className="border-t border-[#D4C9B5]/40 pt-10">
                <h2 className="font-serif-display text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {article.faqs.map((faq, idx) => (
                    <div key={idx} className="bg-[#EFE6D6]/40 border border-[#D4C9B5]/30 rounded-xl p-6">
                      <h4 className="text-base font-semibold text-[#1a1a1a] mb-2 flex items-start gap-2">
                        <span className="text-[#5a6f8a] font-bold">Q:</span>
                        {faq.question}
                      </h4>
                      <p className="text-[#555] text-sm leading-relaxed pl-5">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <div className="border-t border-[#D4C9B5]/40 pt-10">
                <h2 className="font-serif-display text-2xl font-medium text-[#1a1a1a] mb-4">
                  Conclusion
                </h2>
                <p className="text-[#555] leading-relaxed text-lg italic">
                  {article.conclusion}
                </p>
              </div>
            </div>

            {/* Right: Sidebar */}
            <aside className="space-y-8 lg:sticky lg:top-28">
              {/* Call-to-Action Card */}
              <div className="bg-[#EFE6D6] border border-[#D4C9B5]/60 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5D2E8]/20 rounded-full blur-2xl" />
                <h3 className="font-serif-display text-xl font-medium mb-4 relative z-10 text-[#1a1a1a]">
                  Ready to book your service?
                </h3>
                <p className="text-[#555] text-sm leading-relaxed mb-6 relative z-10">
                  Experience premium comfort control today. Get fast assistance from our certified technicians.
                </p>
                <div className="space-y-3 relative z-10">
                  <Link
                    href="/hvac#contact"
                    className="block text-center bg-[#1a1a1a] hover:bg-[#333] text-white py-3 px-6 rounded-full font-semibold text-sm transition-colors duration-300"
                  >
                    Book Appointment
                  </Link>
                  <a
                    href={CONTACT_URL}
                    className="block text-center border border-[#1a1a1a]/40 hover:border-[#1a1a1a] text-[#1a1a1a] py-3 px-6 rounded-full font-semibold text-sm transition-colors duration-300"
                  >
                    Contact us
                  </a>
                </div>
              </div>

              {/* Our Services Sidebar list */}
              <div className="bg-[#EFE6D6] border border-[#D4C9B5]/40 rounded-2xl p-8">
                <h3 className="font-serif-display text-lg font-medium text-[#1a1a1a] mb-6 pb-2 border-b border-[#D4C9B5]/40">
                  Our Services
                </h3>
                <ul className="space-y-3">
                  {relatedServices.map((service, idx) => (
                    <li key={idx}>
                      <Link
                        href={service.href}
                        className="flex items-center justify-between group py-2 text-sm text-[#555] hover:text-[#1a1a1a] font-medium transition-colors"
                      >
                        {service.title}
                        <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section
        className="relative py-20 lg:py-28 bg-cover bg-center overflow-hidden border-t border-[#D4C9B5]/40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1757219525975-03b5984bc6e8?auto=format&fit=crop&w=1800&q=82')",
        }}
      >
        {/* Soft glassmorphism overlay */}
        <div className="absolute inset-0 bg-[#F7F3EB]/95 backdrop-blur-md" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5D2E8]/15 via-transparent to-[#A8BCD6]/15" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 text-[#1a1a1a]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5D2E8]/20 border border-[#C5D2E8]/40 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#5a6f8a] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5a6f8a]">
              Need Professional Service?
            </span>
          </div>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6 leading-tight">
            Get Premium Solutions Today
          </h2>
          <p className="text-lg text-[#555] max-w-xl mx-auto mb-10 leading-relaxed">
            Contact our experienced team for reliable, affordable, and high-quality solutions tailored to your needs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/hvac#contact"
              className="bg-[#1a1a1a] hover:bg-[#333] text-white px-8 py-4 rounded-full font-semibold transition-transform duration-300 hover:-translate-y-0.5 inline-block text-sm"
            >
              Book Service
            </Link>
            <a
              href={CONTACT_URL}
              className="border border-[#1a1a1a]/40 hover:border-[#1a1a1a] text-[#1a1a1a] px-8 py-4 rounded-full font-semibold transition-transform duration-300 hover:-translate-y-0.5 inline-block text-sm"
            >
              Contact us
            </a>
          </div>
        </div>
      </section>

      {/* Related Blogs Section */}
      <section className="py-20 bg-[#F7F3EB] border-t border-[#D4C9B5]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest block mb-3">
              Explore More
            </span>
            <h2 className="font-serif-display text-3xl md:text-4xl font-medium text-[#1a1a1a]">
              Related Articles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedBlogs.map((blog) => (
              <article
                key={blog.slug}
                className="group flex flex-col bg-[#EFE6D6] border border-[#D4C9B5]/40 rounded-xl overflow-hidden hover:border-[#A8BCD6] transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-[#5a6f8a] uppercase tracking-wider mb-2 block">
                    {blog.category}
                  </span>
                  <h3 className="font-serif-display text-lg font-medium text-[#1a1a1a] mb-4 line-clamp-2 hover:text-[#5a6f8a] transition-colors duration-200">
                    <Link href={`/hvac/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h3>
                  <div className="mt-auto pt-4 border-t border-[#D4C9B5]/20 flex items-center justify-between text-xs text-[#555]/80">
                    <span>{blog.publishDate}</span>
                    <span className="font-semibold uppercase tracking-wider text-[#1a1a1a] group-hover:text-[#5a6f8a] transition-colors duration-200">
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

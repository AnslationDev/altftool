"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

const categories = [
    "Online Therapy",
    "Car Selling",
    "TV Services",
    "VPN",
    "CRM",
    "VOIP",
    "Web Hosting",
    "Home Warranty",
    "Insurance",
    "Loans",
    "Credit Cards",
    "Investing",
    "E-commerce",
];

const cards = {
    "Online Therapy": [
        {
            name: "BetterHelp",
            logo: "data:image/png;base64,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",
            reviews: "9,411 Reviews",
            points: [
                "5M+ users helped",
                "Live chat & video sessions",
                "24/7 therapist messaging",
            ],
        },
        {
            name: "ReGain",
            logo: "data:image/png;base64,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",
            reviews: "355 Reviews",
            points: [
                "Couples counseling",
                "Video & phone sessions",
                "3-way therapy support",
            ],
        },
        {
            name: "Faithful Counseling",
            logo: "data:image/jpeg;base64,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",
            reviews: "38 Reviews",
            points: [
                "Christian-based therapy",
                "Licensed professionals",
                "Flexible communication",
            ],
        }, {
            name: "NordVPN",
            logo: "/top11/expert-recom/nordVpn.png",
            reviews: "12,000 Reviews",
            points: [
                "Military-grade encryption",
                "Fast global servers",
                "No-logs policy",
            ],
        },
        {
            name: "ExpressVPN",
            logo: "/top11/top10.png",
            reviews: "9,000 Reviews",
            points: [
                "High-speed streaming",
                "Trusted privacy",
                "Wide server network",
            ],
        }, {
            name: "NordVPN",
            logo: "/top11/expert-recom/nordVpn.png",
            reviews: "12,000 Reviews",
            points: [
                "Military-grade encryption",
                "Fast global servers",
                "No-logs policy",
            ],
        },
        {
            name: "ExpressVPN",
            logo: "/top11/top10.png",
            reviews: "9,000 Reviews",
            points: [
                "High-speed streaming",
                "Trusted privacy",
                "Wide server network",
            ],
        },
         {
            name: "ExpressVPN",
            logo: "/top11/top10.png",
            reviews: "9,000 Reviews",
            points: [
                "High-speed streaming",
                "Trusted privacy",
                "Wide server network",
            ],
        },
    ],
    VPN: [
        {
            name: "NordVPN",
            logo: "/top11/expert-recom/nordVpn.png",
            reviews: "12,000 Reviews",
            points: [
                "Military-grade encryption",
                "Fast global servers",
                "No-logs policy",
            ],
        },
        {
            name: "ExpressVPN",
            logo: "/top11/top10.png",
            reviews: "9,000 Reviews",
            points: [
                "High-speed streaming",
                "Trusted privacy",
                "Wide server network",
            ],
        },
    ],
};

export default function CategorySection() {
    const [active, setActive] = useState(categories[0]);

    return (
        <section className="section ">
         <div className="section-container">
            {/* Header */}
            <div className="section-header mb-10">
                <h2 className="section-title">Browse top tools by category</h2>
                <p className="section-subtitle">
                    Discover top rated services, compare features and find the best option.
                </p>
            </div>

            {/* CATEGORY TABS */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-10">

                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActive(cat)}
                        className={`
              px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-300
              
              ${active === cat
                                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md"
                                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--card-hover-bg)]"
                            }
            `}
                    >
                        {cat}
                    </button>
                ))}

            </div>

            {/* CARDS GRID */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                {(cards[active] || []).map((item, i) => (
                    <div
                        key={i}
                        className="
              rounded-2xl p-5 flex flex-col
              bg-[var(--card)]
              border border-[var(--border)]
              transition-all duration-300
              hover:shadow-lg hover:-translate-y-1
            "
                    >

                        {/* LOGO */}
                        <div className="flex justify-center mb-5">
                            <ManagedImage
                                src={item.logo}
                                alt={item.name}
                                className="h-10 object-contain"
                            />
                        </div>

                        {/* NAME */}
                        <h3 className="text-base font-semibold text-[var(--card-foreground)] mb-1">
                            {item.name}
                        </h3>

                        {/* REVIEWS */}
                        <p className="text-xs text-[var(--muted-foreground)] mb-4">
                            {item.reviews} ⭐ Trustpilot
                        </p>

                        {/* FEATURES */}
                        <ul className="space-y-2 mb-6 flex-1">
                            {item.points.map((point, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                                >
                                    <span className="text-green-500 mt-1">✔</span>
                                    {point}
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <div className="flex items-center gap-2 mt-auto">

                            {/* PRIMARY */}
                            <button className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
                                Visit
                                <ArrowUpRight className="w-4 h-4" />
                            </button>

                            {/* SECONDARY */}
                            <button className="btn-secondary px-3 py-2.5 text-md">
                                Details
                            </button>

                        </div>

                    </div>
                ))}

            </div>
            </div>

        </section>
    );
}

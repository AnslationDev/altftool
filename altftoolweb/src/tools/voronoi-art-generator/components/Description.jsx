const howItWorks = [
    {
        title: "Choose a Pattern",
        description:
            "Start by selecting from presets, then fine-tune points, borders, and style for your design.",
    },
    {
        title: "Customize Style",
        description:
            "Adjust color schemes, opacity, border controls, gradient background, and detail density.",
    },
    {
        title: "Export & Share",
        description:
            "Download your artwork as PNG, JPG, or WebP, or copy CSS for quick web integration.",
    },
];

const features = [
    {
        title: "Preset Library",
        description:
            "Use curated presets as a starting point for minimal, bold, pastel, and high-energy looks.",
    },
    {
        title: "Full Color Control",
        description:
            "Switch palettes instantly and control stroke borders, background, and cell opacity.",
    },
    {
        title: "Smart Detail Tuning",
        description:
            "Dial point count, pixel size, and border width to balance quality and performance.",
    },
    {
        title: "Live Animation",
        description:
            "Turn on motion and speed controls to generate animated generative-art compositions.",
    },
    {
        title: "Reusable Output",
        description:
            "Export assets for thumbnails, wallpapers, social cards, UI backgrounds, and mockups.",
    },
    {
        title: "Fast Workflow",
        description:
            "Randomize, preview, and iterate quickly without leaving the page or opening extra tools.",
    },
];

function SectionCards({ title, subtitle, items }) {
    return (
        <section className="voronoi-section">
            <div className="voronoi-section-head">
                <h2 className="voronoi-section-title">{title}</h2>
                <p className="voronoi-section-subtitle">{subtitle}</p>
            </div>

            <div className="voronoi-feature-grid">
                {items.map((item) => (
                    <article key={item.title} className="voronoi-feature-card">
                        <h3 className="voronoi-feature-title">{item.title}</h3>
                        <p className="voronoi-feature-text">{item.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Description() {
    return (
        <div className="voronoi-description">
            <SectionCards
                title="How It Works ?"
                subtitle="Create impressive geometric art in just a few simple steps"
                items={howItWorks}
            />
            <SectionCards
                title="Why Use Our Voronoi Generator?"
                subtitle="Built for creators who want speed, control, and high-quality output"
                items={features}
            />
        </div>
    );
}

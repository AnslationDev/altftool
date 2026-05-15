const howItWorks = [
    { title: "Choose Composition", description: "Pick a preset or start from a blank phi composition and select visible overlays." },
    { title: "Tune Visual System", description: "Adjust tile count, stroke style, colors, opacity, and rotation for your target use case." },
    { title: "Export & Reuse", description: "Download high-quality PNG or save and import JSON configurations for repeatable workflows." },
];

const features = [
    { title: "Golden Spiral", description: "Draw mathematically consistent quarter-arc spiral segments from Fibonacci-derived tiles." },
    { title: "Fibonacci Grid", description: "Visualize proportional blocks to place focal content in naturally balanced regions." },
    { title: "Phi & Thirds Guides", description: "Overlay both golden ratio and rule-of-thirds lines to compare composition strategies." },
    { title: "Diagonal Framework", description: "Add diagonal tension guides for dynamic framing and visual direction." },
    { title: "Style Controls", description: "Use gradient background, dashed line styles, stroke weight, and opacity for varied aesthetics." },
    { title: "Animation Ready", description: "Animate rotational framing live for motion mockups and creative direction references." },
];

function SectionCards({ title, subtitle, items }) {
    return (
        <section className="golden-section">
            <div className="golden-section-head">
                <h2 className="golden-section-title">{title}</h2>
                <p className="golden-section-subtitle">{subtitle}</p>
            </div>
            <div className="golden-feature-grid">
                {items.map((item) => (
                    <article key={item.title} className="golden-feature-card">
                        <h3 className="golden-feature-title">{item.title}</h3>
                        <p className="golden-feature-text">{item.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Description() {
    return (
        <div className="golden-description">
            <SectionCards title="How It Works" subtitle="Generate golden-ratio compositions in a few focused steps" items={howItWorks} />
            <SectionCards title="Why Use Golden Ratio Visualizer?" subtitle="Designed for designers, photographers, and visual storytellers" items={features} />
        </div>
    );
}

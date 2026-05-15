const howItWorks = [
    {
        title: "Pick Fractal Type",
        description: "Choose Mandelbrot, Julia, Burning Ship, or Tricorn and start from optimized defaults.",
    },
    {
        title: "Tune Parameters",
        description: "Adjust iterations, escape radius, complex coordinates, and palette settings for unique visuals.",
    },
    {
        title: "Export Output",
        description: "Download high-quality PNG images or save and import JSON configurations for reproducible results.",
    },
];

const features = [
    {
        title: "Interactive Zoom & Pan",
        description: "Use click zoom, right-click zoom out, and drag pan for smooth navigation across the fractal space.",
    },
    {
        title: "Multiple Fractal Engines",
        description: "Switch between four fractal formulas with optimized defaults for instant visual comparison.",
    },
    {
        title: "Advanced Coloring",
        description: "Control gradients, smooth coloring, hue shift animation, and palette intensity.",
    },
    {
        title: "Precision Controls",
        description: "Edit center coordinates, zoom factor, max iterations, and Julia constants with numeric accuracy.",
    },
    {
        title: "Configuration Portability",
        description: "Export and import complete settings in JSON for saved experiments and team sharing.",
    },
    {
        title: "Production Export",
        description: "Render publication-ready PNG outputs from the current viewport state.",
    },
];

function SectionCards({ title, subtitle, items }) {
    return (
        <section className="fractal-section">
            <div className="fractal-section-head">
                <h2 className="fractal-section-title">{title}</h2>
                <p className="fractal-section-subtitle">{subtitle}</p>
            </div>

            <div className="fractal-feature-grid">
                {items.map((item) => (
                    <article key={item.title} className="fractal-feature-card">
                        <h3 className="fractal-feature-title">{item.title}</h3>
                        <p className="fractal-feature-text">{item.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Description() {
    return (
        <div className="fractal-description">
            <SectionCards
                title="How It Works"
                subtitle="Generate complex fractal artwork in a few focused steps"
                items={howItWorks}
            />
            <SectionCards
                title="Why Use Fractal Explorer?"
                subtitle="Built for creators, developers, and visual experimentation workflows"
                items={features}
            />
        </div>
    );
}

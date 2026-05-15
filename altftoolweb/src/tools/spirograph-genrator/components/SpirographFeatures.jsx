"use client";

export default function SpirographFeatures() {
    const features = [
        { icon: "🎯", title: "20+ Curated Presets", desc: "Instant access to Classic Flower, Geometric Star, Complex Mandala and more ready-to-use designs." },
        { icon: "🎨", title: "Full Color Control", desc: "Custom stroke colors, background selection, and multi-color line effects with palette quick-picks." },
        { icon: "🔄", title: "Dual Pattern Modes", desc: "Switch between Hypotrochoid (inside) and Epitrochoid (outside) circle drawing modes." },
        { icon: "📐", title: "Precise Parameters", desc: "Fine-tune radius, pen distance, smoothness, line width and hole percentage with exact inputs." },
        { icon: "🎬", title: "Live Animation", desc: "Watch patterns animate with play/pause control and adjustable speed from slow to turbo." },
        { icon: "📥", title: "Multi-Format Export", desc: "Download your spirograph artwork as PNG, JPG or SVG files for any use case." }
    ];

    return (
        <section className="features-section">
            <div className="section-heading">
                <h2>Why Use Our Spirograph Generator?</h2>
                <p>Create mesmerizing geometric art with professional-grade features</p>
            </div>
            <div className="features-grid">
                {features.map((feat, i) => (
                    <div key={i} className="feature-card">
                        <div className="feature-icon">{feat.icon}</div>
                        <h3>{feat.title}</h3>
                        <p>{feat.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
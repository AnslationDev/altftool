"use client";

export default function SpirographHowItWorks() {
    const steps = [
        {
            num: "1",
            title: "Choose a Pattern",
            desc: "Start by selecting from 20+ presets or customize parameters like radius, loops, and pen distance to create your unique spirograph."
        },
        {
            num: "2",
            title: "Customize Style",
            desc: "Pick colors, adjust line width, enable multi-line effects, and toggle between hypotrochoid and epitrochoid modes."
        },
        {
            num: "3",
            title: "Export & Share",
            desc: "Download your creation as PNG, JPG, or SVG. Use animation mode to watch patterns come alive before exporting."
        }
    ];

    return (
        <section className="how-it-works">
            <div className="section-heading">
                <h2>How It Works ?</h2>
                <p>Create stunning spirograph patterns in just a few simple steps</p>
            </div>
            <div className="steps-grid">
                {steps.map((step, i) => (
                    <div key={i} className="step-card">
                        <div className="step-number">{step.num}</div>
                        <h3>{step.title}</h3>
                        <p>{step.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

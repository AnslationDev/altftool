import React from "react";
import { 
    Activity, 
    Zap, 
    Brain, 
    Target, 
    BarChart3, 
    Smartphone 
} from "lucide-react";

const Features = () => {
    const features = [
        {
            icon: Brain,
            title: "Dynamic Scoring",
            description:
                "Your Productivity Score is calculated in real-time based on your sleep, work focus, energy, and mood.",
        },
        {
            icon: Target,
            title: "Habit Integration",
            description:
                "Track your daily habits and see how completing them directly boosts your overall life performance score.",
        },
        {
            icon: Zap,
            title: "Deep Work Timer",
            description:
                "Use the customizable focus timer to block out distractions and log dedicated productive sessions.",
        },
        {
            icon: Activity,
            title: "Energy & Vibe Check",
            description:
                "Monitor your energy levels and mood throughout the day to find your peak performance windows.",
        },
        {
            icon: BarChart3,
            title: "Performance Analytics",
            description:
                "Visualize your progress with weekly and monthly trend charts to understand your long-term growth.",
        },
        {
            icon: Smartphone,
            title: "Mobile Optimized",
            description:
                "Manage your productivity on the go with a fully responsive dashboard designed for all devices.",
        },
    ];

    return (
        <section className="py-20 px-4 bg-(--background)">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-[900] text-(--foreground) mb-6 tracking-tighter">
                        Why Use <span className="text-blue-500">Life Productivity</span> Score?
                    </h2>
                    <p className="text-lg text-(--foreground) max-w-2xl mx-auto leading-relaxed opacity-60">
                        A scientific approach to measuring and improving your daily routine, energy, and mental focus.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="
                                bg-(--card)
                                rounded-[32px]
                                border border-white/5
                                p-8
                                flex flex-col
                                hover:border-blue-500/20
                                hover:-translate-y-2
                                transition-all duration-500
                                group
                            "
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-black text-(--foreground) mb-3 uppercase tracking-widest">
                                {feature.title}
                            </h3>

                            <p className="text-sm text-(--foreground) leading-relaxed opacity-50">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
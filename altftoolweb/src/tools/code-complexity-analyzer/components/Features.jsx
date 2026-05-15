"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Code, Zap, Smartphone, Cpu,
    Gauge, TrendingUp, Sparkles, Shield
} from "lucide-react";
import Card from "./ui/Card";

const Features = () => {
    const features = [
        {
            title: "Smart Code Complexity Analysis",
            description:
                "Calculate the exact complexity of code based on cyclomatic complexity, cognitive load, and maintenance projections.",
            icon: Code,
            color: "blue"
        },
        {
            title: "Real-Time Code Complexity Analysis",
            description:
                "Get your code complexity results instantly with our high-speed calculation engine. No waiting, just immediate code complexity clarity.",
            icon: Zap,
            color: "amber"
        },
        {
            title: "Fully Responsive Code Complexity Analysis",
            description:
                "Optimized for every device. Access your code complexity data seamlessly on desktop, tablet, or mobile screens.",
            icon: Smartphone,
            color: "purple"
        },
        {
            title: "Premium Code Complexity Analysis",
            description:
                "A clean, distraction-free interface built with modern aesthetics to make complex code complexity analysis simple.",
            icon: Sparkles,
            color: "indigo"
        },
        {
            title: "Privacy First Code Complexity Analysis",
            description:
                "Your data never leaves your device. All calculations are performed locally in your browser for total security.",
            icon: Shield,
            color: "emerald"
        },
        {
            title: "Lightweight & Efficient Code Complexity Analysis",
            description:
                "No heavy backend or database required. Experience lightning-fast performance with our zero-latency frontend.",
            icon: Cpu,
            color: "rose"
        },
    ];

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    return (
        <section className="py-20 px-4 bg-(--background) relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-5 dark:opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-(--primary) rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
            </div>

            <div className="mx-auto max-w-7xl relative z-10">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--primary)/10 text-(--primary) text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-(--primary)/20">
                        <Gauge className="w-3.5 h-3.5" />
                        Powerful Features
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-(--foreground) mb-6 tracking-tight">
                        Built for <span className="text-(--primary)">Precision</span> & <span className="text-(--primary)">Simplicity</span>
                    </h2>
                    <p className="text-lg text-(--secondary) max-w-2xl mx-auto font-medium leading-relaxed">
                        Experience the most comprehensive code complexity analysis tool designed for modern developers and programmers.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {features.map((feature, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card
                                variant="glass"
                                hover={true}
                                className="h-full flex flex-col items-start p-8 group border-white/10"
                            >
                                <div className={`p-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-(--primary) mb-6 transition-all duration-300 group-hover:scale-110`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-xl font-black text-(--foreground) mb-4 tracking-tight group-hover:text-(--primary) transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-sm text-(--secondary) leading-relaxed font-semibold">
                                    {feature.description}
                                </p>

                                <div className="mt-auto pt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-(--primary) opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                                    Learn More <TrendingUp className="w-3 h-3" />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;

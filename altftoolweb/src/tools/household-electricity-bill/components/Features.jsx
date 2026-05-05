"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const Features = () => {
    const { theme } = useTheme();

    const features = [
        {
            title: "Accurate Household Electricity Bill",
            description:
                "Calculate the exact electricity bill for your household based on the appliances you use.",
        },
        {
            title: "Instant Results",
            description:
                "Get your electricity bill calculated immediately with real-time processing. No delays, just quick and accurate output.",
        },
        {
            title: "Fully Responsive",
            description:
                "Optimized for desktop, tablet, and mobile devices. Enjoy a seamless experience on any screen size.",
        },
        {
            title: "Clean & Simple Interface",
            description:
                "Minimal, distraction-free design that makes calculating your electricity bill easy and user-friendly.",
        },
        {
            title: "Privacy Focused",
            description:
                "Your electricity bill data stays in your browser. No data storage, no tracking — complete privacy guaranteed.",
        },
        {
            title: "No Backend Required",
            description:
                "Runs entirely on the frontend using JavaScript. No servers, no APIs — lightweight and efficient.",
        },
    ];

    // Animation variants for header
    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    // Animation variants for feature cards
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    return (
        <section className="py-8 sm:py-10 px-4 bg-(--background) transition-colors duration-300">
            <div className="mx-auto max-w-6xl">
                {/* Header with animation */}
                <motion.div
                    className="text-center mb-12 sm:mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.2 } },
                    }}
                >
                    <motion.h2
                        className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4"
                        variants={headerVariants}
                    >
                        Why Choose Our Household Electricity Bill?
                    </motion.h2>
                    <motion.p
                        className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed"
                        variants={headerVariants}
                    >
                        Simple, fast, and accurate household electricity bill calculation for everyone
                    </motion.p>
                </motion.div>

                {/* Grid with staggered animations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="
                bg-(--card)
                rounded-2xl
                shadow-md
                border border-(--border)
                p-6 sm:p-8
                flex flex-col
                hover:shadow-xl
                hover:-translate-y-2
                transition-all duration-300
              "
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={cardVariants}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3">
                                {feature.title}
                            </h3>

                            <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw, Lightbulb } from 'lucide-react';
import Card from './ui/Card';

const QUOTES = [
    { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
    { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.", author: "A. P. J. Abdul Kalam" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "You miss 100% of the shots you don’t take.", author: "Wayne Gretzky" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Hard work beats talent when talent doesn’t work hard.", author: "Tim Notke" },
    { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },

    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Excellence is a continuous process and not an accident.", author: "A. P. J. Abdul Kalam" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
    { text: "Your time is limited, don’t waste it living someone else’s life.", author: "Steve Jobs" },
    { text: "Small aim is a crime.", author: "A. P. J. Abdul Kalam" },
    { text: "If you want to shine like a sun, first burn like a sun.", author: "A. P. J. Abdul Kalam" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
    { text: "Don’t limit your challenges. Challenge your limits.", author: "Unknown" },

    { text: "Work hard in silence, let success make the noise.", author: "Frank Ocean" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "Success is the sum of small efforts repeated daily.", author: "Robert Collier" },
    { text: "The harder you work for something, the greater you’ll feel when you achieve it.", author: "Unknown" },
    { text: "Dream is not that which you see while sleeping, it is something that does not let you sleep.", author: "A. P. J. Abdul Kalam" },
    { text: "Without hard work, nothing grows but weeds.", author: "Gordon B. Hinckley" },
    { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "There is no substitute for hard work.", author: "Thomas Edison" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },

    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "Happiness depends upon ourselves.", author: "Aristotle" },
    { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
    { text: "An ounce of practice is worth more than tons of preaching.", author: "Mahatma Gandhi" },
    { text: "You become what you believe.", author: "Oprah Winfrey" },
    { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Positive anything is better than negative nothing.", author: "Elbert Hubbard" },
    { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },

    { text: "A leader is one who knows the way, goes the way, and shows the way.", author: "John C. Maxwell" },
    { text: "Leadership is not about being in charge. It is about taking care of those in your charge.", author: "Simon Sinek" },
    { text: "You must be the master of your own destiny.", author: "Napoleon Hill" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is not about how much money you make, it’s about the difference you make in people’s lives.", author: "Michelle Obama" }
];

const QuoteCard = () => {
    const [index, setIndex] = useState(0);
    const quote = QUOTES[index];

    const refresh = () => {
        setIndex((prev) => (prev + 1) % QUOTES.length);
    };

    return (
        <Card variant="gradient" className="overflow-hidden border-none">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-(--primary)/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 py-2">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-(--primary)/20 text-(--primary)">
                                <Lightbulb size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-(--primary)">Daily Catalyst</span>
                        </div>

                        <div className="relative">
                            <motion.p
                                key={quote.text}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xl sm:text-2xl font-black leading-tight text-(--foreground) italic tracking-tight"
                            >
                                &quot;{quote.text}&quot;
                            </motion.p>
                        </div>

                        <motion.p
                            key={quote.author}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xs font-bold mt-4 text-(--secondary) opacity-60 flex items-center gap-2"
                        >
                            <span className="w-4 h-px bg-(--secondary) opacity-30" />
                            {quote.author}
                        </motion.p>
                    </div>

                    <motion.button
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                        onClick={refresh}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-(--secondary) hover:text-(--foreground) hover:bg-white/10 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} />
                    </motion.button>
                </div>
            </div>
        </Card>
    );
};

export default QuoteCard;

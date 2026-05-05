import { Landmark, CodeXml, GraduationCap, TrendingUp, BookOpen, Video } from "lucide-react";
export const categories = [
    
    {
        title: "Govt & Competitive Exams",
        desc: "UPSC, SSC, Banking & more",
        icon: <Landmark size={28} />,
    },
    {
        title: "Tech & Coding",
        desc: "Software, Data & Cloud",
        icon: <CodeXml />,
    },
    {
        title: "Skills & Career Growth",
        desc: "Business, Design & Marketing",
        icon: <TrendingUp size={28} />,
        active: true,
    },
    {
        title: "Higher Education",
        desc: "Degrees & Certifications",
        icon: <GraduationCap size={28} />,
    },
    {
        title: "School & Foundation",
        desc: "K-12 & Olympiads",
        icon: <BookOpen size={28} />,
    },
    {
        title: "Course Creation",
        desc: "Teaching & Monetization",
        icon: <Video size={28} />,
    },
];

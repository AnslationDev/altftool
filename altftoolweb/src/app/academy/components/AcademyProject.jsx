"use client";

import { useEffect, useMemo, useState } from "react";
import Hero from "./Hero";
import FeaturedAcademies from "../components/FeaturedAcademies";
import ExplorePlatform from "../components/ExplorePlatform";
import Feedback from "../components/Feedback";
import LearningPlatform from "./LearningPlatform";
import AcademyResults from "./AcademyResults";
import FaqSection from "./FAQs";
import "../styles/academy.css";
import { getAcademyList } from "../service/academyService";

export default function AcademyProject() {
  const [activeCategory, setActiveCategory] = useState("Skills & Career Growth");
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAcademyList();
      setAcademies(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory === "All") return academies;

    return academies.filter(
      (a) =>
        a.category?.toLowerCase().trim() ===
        activeCategory.toLowerCase().trim()
    );
  }, [activeCategory, academies]);

  const featured = academies.slice(0, 6);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="">
        <Hero loading={loading} />
        <FeaturedAcademies items={featured} loading={loading} />
        <LearningPlatform loading={loading} />
        <ExplorePlatform
          loading={loading}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <AcademyResults
          loading={loading}
          items={filtered}
          activeCategory={activeCategory}
        />

        <Feedback />
         
         <FaqSection />
   
    
     
      </div>
    </main>
  );
}

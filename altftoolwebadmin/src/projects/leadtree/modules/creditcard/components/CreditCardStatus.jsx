"use client";

import { useState, useEffect } from "react";
import { FileText, Eye, MessageCircle, Heart, Edit3, CreditCard } from "lucide-react";

import { fetchAllCards } from "../credit-card-services/CreditCardService";

export default function CreditCardStatus() {
  const [stats, setStats] = useState({
    totalPostedCards: 0,
    publishedCards: 0,
    draftCards: 0,
   
  });

  useEffect(() => {
    (async () => {
      try {
        const cards = await fetchAllCards();

        let publishedCards = 0, draftCards = 0;
       

        cards.forEach((data) => {
          if (data.status === "published") publishedCards++;
          if (data.status === "draft") draftCards++;
        
        });

        setStats({
        totalPostedCards: cards.length,
          publishedCards,
          draftCards,
         
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    })();
  }, []);

  const statsData = [
    { title: "Total Card Posted",     value: stats.totalPostedCards,     icon: <CreditCard      className="w-8 h-8 text-blue-500"   /> },
    { title: "Published Cards", value: stats.publishedCards, icon: <Eye           className="w-8 h-8 text-green-500"  /> },
    { title: "Drafted Cards",     value: stats.draftCards,     icon: <Edit3         className="w-8 h-8 text-yellow-500" /> },

  ];

  return (
    <div className="p-6 md:p-10 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-center hover:shadow-xl transition"
          >
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h2 className="text-2xl font-bold text-gray-800">{stat.value.toLocaleString()}</h2>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { FileText, Eye, MessageCircle, Heart, Edit3, Video } from "lucide-react";

import { fetchAllVideos } from "../expert-video-services/ExpertVideoService";

export default function ExpertVideoStatus() {
  const [stats, setStats] = useState({
    totalUploadedVideos: 0,
    publishedVideos: 0,
    draftVideos: 0,
   
  });

  useEffect(() => {
    (async () => {
      try {
        const videos = await fetchAllVideos();

        let publishedVideos = 0, draftVideos = 0;


        videos.forEach((data) => {
          if (data.status === "published") publishedVideos++;
          if (data.status === "draft") draftVideos++;
          
        });

        setStats({
          totalUploadedVideos: videos.length,
          publishedVideos,
          draftVideos,
          
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    })();
  }, []);

  const statsData = [
    { title: "Total Uploaded Videos",     value: stats.totalUploadedVideos,     icon: <Video      className="w-8 h-8 text-blue-500"   /> },
    { title: "Published Videos", value: stats.publishedVideos, icon: <Eye           className="w-8 h-8 text-green-500"  /> },
    { title: "Draft Videos",     value: stats.draftVideos,     icon: <Edit3         className="w-8 h-8 text-yellow-500" /> },
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
"use client";

import { useState, useEffect } from "react";
import { FileText, Eye, MessageCircle, Heart, Edit3 } from "lucide-react";
import { fetchAllBlogs } from "../services/blogsService";

export default function BlogStat() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const blogs = await fetchAllBlogs();

        let publishedPosts = 0, draftPosts = 0;
        let totalViews = 0, totalLikes = 0, totalComments = 0;

        blogs.forEach((data) => {
          if (data.status === "published") publishedPosts++;
          if (data.status === "draft") draftPosts++;
          totalViews    += data.views         || 0;
          totalLikes    += data.likesCount    || 0;
          totalComments += data.commentsCount || 0;
        });

        setStats({
          totalPosts: blogs.length,
          publishedPosts,
          draftPosts,
          totalViews,
          totalLikes,
          totalComments,
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    })();
  }, []);

  const statsData = [
  { title: "Total Posts",     value: stats.totalPosts,     icon: <FileText      className="w-8 h-8 text-blue-500"   /> },
  { title: "Published Posts", value: stats.publishedPosts, icon: <Eye           className="w-8 h-8 text-green-500"  /> },
  { title: "Draft Posts",     value: stats.draftPosts,     icon: <Edit3         className="w-8 h-8 text-yellow-500" /> },
  { title: "Total Views",     value: stats.totalViews,     icon: <Eye           className="w-8 h-8 text-indigo-500" /> },
  { title: "Total Likes",     value: stats.totalLikes,     icon: <Heart         className="w-8 h-8 text-red-500"    /> },
  { title: "Total Comments",  value: stats.totalComments,  icon: <MessageCircle className="w-8 h-8 text-purple-500" /> },
];

  return (
    <div className="p-6 md:p-10 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 ">
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
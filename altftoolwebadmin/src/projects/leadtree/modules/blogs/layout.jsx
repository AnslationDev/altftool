"use client";

import LeadTreeBlogTopBar from "./components/LeadTreeBlogTopBar";



export default function BlogsLayout({ children }) {

  return (

    <div className="min-h-screen bg-gray-50">

      {/* Top Navigation */}

 <LeadTreeBlogTopBar/>

      {/* Page Content */}

      <div className="mx-auto px-6 py-6">

        {children}

      </div>

    </div>

  );

}
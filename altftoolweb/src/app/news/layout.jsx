"use client";

import Sidebar from "./components/sections/Sidebar";
import Ads from "./components/sections/Ads";


export default function NewsLayout({ children }) {
  return (
    <div className="w-full mt-5 px-4 md:px-6 mb-10">
      <div className="grid w-full grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px] gap-6">
        {/* Sidebar — STICKY */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </aside>

        {/* Feed */}
        <main className="min-w-0">
          <div className="mx-auto w-full max-w-3xl">
            {/* <Feeds newsData={newsData} /> */}
            {children}
          </div>
        </main>

        {/* Ads — STICKY */}
        <aside className="hidden xl:block">
          <div className="sticky top-6">
            <Ads />
          </div>
        </aside>
      </div>
    </div>
  );
}

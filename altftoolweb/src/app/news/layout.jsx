"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/sections/Sidebar";
import Ads from "./components/sections/Ads";

export default function NewsLayout({ children }) {
  const pathname = usePathname();
  const isNewsHome = pathname === "/news";

  return (
    <>
      <Navbar />

      <div className="w-full px-5 md:px-8 mb-12">
        <div className={`grid w-full grid-cols-1 gap-8 ${!isNewsHome ? "lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]" : "mx-auto max-w-[1500px]"}`}>
          {!isNewsHome && (
            <aside className="hidden lg:block">
              <div className="sticky top-6">
                <Sidebar />
              </div>
            </aside>
          )}

          <main className="min-w-0">
            <div className={`mx-auto w-full ${!isNewsHome ? "max-w-3xl" : ""}`}>
              {children}
            </div>
          </main>

          {!isNewsHome && (
            <aside className="hidden xl:block">
              <div className="sticky top-6">
                <Ads />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* <Footer /> */}
    </>
  );
}

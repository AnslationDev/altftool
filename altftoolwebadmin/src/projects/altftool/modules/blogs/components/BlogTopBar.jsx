"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, PlusCircle, ShieldCheck, Tag, WandSparkles } from "lucide-react";

import CategoryModal from "./CategoryModal";

export default function BlogTopBar(){

  const pathname = usePathname();
  const [showCategoryModal,setShowCategoryModal] = useState(false);

  const menuItems = [
    // { name:"Overview",icon:LayoutDashboard,href:"/altftool/blogs" },
    { name:"All Blogs",icon:FileText,href:"/altftool/blogs/view-blogs" },
    { name:"Analytics",icon:BarChart3,href:"/altftool/blogs/analytics" },
    { name:"Quality",icon:ShieldCheck,href:"/altftool/blogs/quality" },
    { name:"Bulk Refresh",icon:WandSparkles,href:"/altftool/blogs/bulk-refresh" },
    { name:"Add New Blog",icon:PlusCircle,href:"/altftool/blogs/add-blogs" }
  ];

  return(

    <>

    <header className="w-full bg-white border-b shadow-sm">

      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 px-4 py-4">

        {/* Title */}
        <Link href="/altftool/blogs" className="flex items-center gap-2">
          
          <span className="text-lg font-bold text-gray-900">
            Blogs
          </span>
        </Link>

        {/* Navigation */}

        <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1 py-2 md:px-4">

          {menuItems.map(item=>{

            const Icon = item.icon;

            const isActive =
              item.href === "/altftool/blogs"
                ? pathname === "/altftool/blogs"
                : pathname.startsWith(item.href);

            return(

              <Link
                key={item.name}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
                ${
                  isActive
                    ? "bg-(--primary) text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >

                <Icon size={18}/>
                {item.name}

              </Link>

            );

          })}

        </nav>

        {/* Add Category */}

        <button
          onClick={()=>setShowCategoryModal(true)}
          className="ml-auto flex shrink-0 items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
        >
          <Tag size={16}/>
          Add Category
        </button>

      </div>

    </header>

    {showCategoryModal && (

      <CategoryModal
        onClose={()=>setShowCategoryModal(false)}
      />

    )}

    </>

  );

}

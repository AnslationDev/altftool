"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Tag } from "lucide-react";

import CategoryModal from "../components/LeadTreeCateogryModal";

export default function LeadTreeBlogTopBar(){

  const pathname = usePathname();
  const [showCategoryModal,setShowCategoryModal] = useState(false);
  const [route, setRoute] = useState("overview");

  const menuItems = [
    // { name:"Overview",icon:LayoutDashboard,href:"/altftool/blogs" },
    { name:"All Blogs",icon:FileText,href:"/leadtree/blogs/view-blogs" },
    { name:"Add New Blog",icon:PlusCircle,href:"/leadtree/blogs/add-blogs" }
  ];

  return(

    <>

    <header className="w-full bg-white border-b shadow-sm">

      <div className="max-w-7xl mx-auto flex items-center gap-6 px-6 py-4">

        {/* Title */}
        <Link href="/leadtree/blogs" className="flex items-center gap-2">
          
          <span className="text-lg font-bold text-gray-900">
            Blogs
          </span>
        </Link>

        {/* Navigation */}

        <nav className="flex items-center gap-4 px-6 py-3">

          {menuItems.map(item=>{

            const Icon = item.icon;

            const isActive =
              item.href === "/leadtree/blogs"
                ? pathname === "/leadtree/blogs"
                : pathname.startsWith(item.href);

            return(

              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
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
          className="ml-auto flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
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
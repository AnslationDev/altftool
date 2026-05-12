"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Tag,
  LucideCreditCard,
  Video,
  User2Icon,
  PlusIcon,
} from "lucide-react";
import AddOurTeamModal from "./AddOurTeamModal";
import { useState } from "react";


export default function OurTeamTopBar() {
  const pathname = usePathname();


  const [route, setRoute] = useState("overview");

  const menuItems = [
    // { name:"Overview",icon:LayoutDashboard,href:"/altftool/blogs" },
    {
      name: "All Listed Members",
      icon: User2Icon,
      href: "/leadtree/ourteams/view-team",
    },
  ];

  return (
    <>
      <header className="w-full bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-6 px-6 py-4 justify-between">
          {/* Title */}

          {/* Navigation */}

          <nav className="flex items-center gap-4 py-3">
            <Link
              href="/leadtree/ourteams"
              className="flex items-center gap-2 text-lg font-bold text-gray-900"
            >
              Team Members
            </Link>

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/leadtree/ourteams"
                  ? pathname === "/leadtree/ourteams"
                  : pathname.startsWith(item.href);

              return (
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
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}

           
          </nav>



          {/* Add Category */}

          {/* <div className="flex justify-center gap-5 items-center  ">
            <button
            //   onClick={() => setShowCategoryModal(true)}
              className="ml-auto flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
            >
              <Tag size={16} />
              Add Team Members
            </button>

          </div> */}
        </div>
      </header>
      {/* 
      {showCategoryModal && (

        <VideoModalCateogry
          onClose={() => setShowCategoryModal(false)}
        />

      )} */}
    </>
  );
}

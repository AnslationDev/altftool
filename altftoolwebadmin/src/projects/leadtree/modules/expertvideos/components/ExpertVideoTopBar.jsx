"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Tag, LucideCreditCard, Video } from "lucide-react";
// import CreditCardCateogryModal from "./CreditCardCateogryModal";
// import CreditCardBenefitModal from "./CreditCardBenefitModal";

// import CategoryModal from "../components/LeadTreeCateogryModal";

export default function ExpertVideoTopBar() {

  const pathname = usePathname();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCardBenefitModal, setCardBenefitModal] = useState(false)
  const [route, setRoute] = useState("overview");

  const menuItems = [
    // { name:"Overview",icon:LayoutDashboard,href:"/altftool/blogs" },
    { name: "Videos", icon: Video, href: "/leadtree/expert-videos" },
    { name: "Add New Videos", icon: PlusCircle, href: "/leadtree/expert-videos/add-video" }
  ];

  return (

    <>

      <header className="w-full bg-white border-b shadow-sm">

        <div className="max-w-7xl mx-auto flex items-center gap-6 px-6 py-4 justify-between">

          {/* Title */}


          {/* Navigation */}

          <nav className="flex items-center gap-4 py-3">
            <Link href="/leadtree/expert-videos" className="flex items-center gap-2 text-lg font-bold text-gray-900">

              Expert Videos

            </Link>
            {menuItems.map(item => {

              const Icon = item.icon;

              const isActive =
                item.href === "/leadtree/expert-videos"
                  ? pathname === "/leadtree/expert-videos"
                  : pathname.startsWith(item.href);

              return (

                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
                ${isActive
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

          <div className="flex justify-center gap-5 items-center  ">
            <button
            //   onClick={() => setShowCategoryModal(true)}
              className="ml-auto flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
            >
              <Tag size={16} />
              Add Video Cateogry
            </button>

          </div>




        </div>

      </header>

      {showCategoryModal && (

        <CreditCardCateogryModal
          onClose={() => setShowCategoryModal(false)}
        />

      )}


    </>

  );

}

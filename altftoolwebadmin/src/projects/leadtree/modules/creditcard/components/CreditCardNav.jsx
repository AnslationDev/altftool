"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function CreditCardNav({
  tabs = ["All Cards", "Drafted Cards", "Published Cards"],
  onTabChange,
  onSearch
}) {

  const [activeTab,setActiveTab] = useState(tabs[0]);
  const [search,setSearch] = useState("");

  const handleTabClick = (tab) => {

    setActiveTab(tab);

    if(onTabChange){
      onTabChange(tab);
    }

  };

  const handleSearch = (e) => {

    const value = e.target.value;

    setSearch(value);

    if(onSearch){
      onSearch(value);
    }

  };

  return (

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      {/* Tabs */}

      <div className="flex flex-wrap gap-2">

        {tabs.map((tab)=>(
          <button
            key={tab}
            onClick={()=>handleTabClick(tab)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition cursor-pointer
            ${
              activeTab === tab
                ? "bg-(--primary) text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}

      </div>

      {/* Search */}

      <div className="relative w-full md:w-72">

        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          placeholder="Search Cards..."
          value={search}
          onChange={handleSearch}
          className="w-full border pl-9 pr-3 py-2 rounded"
        />

      </div>

    </div>

  );

}
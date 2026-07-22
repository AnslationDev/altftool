import { User, Briefcase, GraduationCap, Code, Award } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const Tabs = ({ activeTab, setActiveTab }) => {

  const containerRef = useRef(null);
const [sliderStyle, setSliderStyle] = useState({});


  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Award },
  ];

  useEffect(() => {

  const activeIndex = tabs.findIndex(
    (t) => t.id === activeTab
  );

  const container = containerRef.current;

  if (!container) return;

  const activeButton = container.children[activeIndex + 1];

  if (!activeButton) return;

  setSliderStyle({
    width: `${activeButton.offsetWidth}px`,
    left: `${activeButton.offsetLeft}px`,
  });

}, [activeTab]);

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
  <div  ref ={containerRef} className="relative flex bg-(--card) rounded-xl shadow-sm min-w-max">

    {/* Sliding Indicator FIXED */}
   <div
  className="
    absolute
    top-1
    bottom-1
    rounded-lg
    bg-(--primary)
    transition-all
    duration-300
  "
  style={sliderStyle}
/>

   {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${
            activeTab === tab.id
              ? "text-white"
              : "text-(--foreground) hover:text-(--primary)"
          }
        `}
 >
        <tab.icon
          className={`w-4 h-4 transition-all ${
            activeTab === tab.id ? "scale-110" : ""
          }`}
        />
        <span className="text-xs sm:text-sm">
          {tab.label}
        </span>
      </button>
    ))}

      </div>
    </div>
  );

};

export default Tabs;

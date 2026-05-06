"use client";
import { useState } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

const apps = [
  { title: "WhatsApp", image: "https://img.icons8.com/color/240/whatsapp.png", link: "https://www.whatsapp.com/download" },
  { title: "Instagram", image: "https://img.icons8.com/color/240/instagram-new.png", link: "https://www.instagram.com/download/" },
  { title: "Spotify", image: "https://img.icons8.com/color/240/spotify.png", link: "https://www.spotify.com/download/other/" },
  { title: "Telegram", image: "https://img.icons8.com/color/240/telegram-app.png", link: "https://desktop.telegram.org/" },
  { title: "Netflix", image: "https://img.icons8.com/color/240/netflix.png", link: "https://help.netflix.com/en/node/23931" },
  { title: "Facebook", image: "https://img.icons8.com/color/240/facebook-new.png", link: "https://www.facebook.com/mobile/" },
  { title: "Zoom", image: "https://img.icons8.com/color/240/zoom.png", link: "https://zoom.us/download" },
  { title: "Discord", image: "https://img.icons8.com/color/240/discord-logo.png", link: "https://discord.com/download" },
  { title: "Notion", image: "https://img.icons8.com/color/240/notion.png", link: "https://www.notion.so/desktop" },
  { title: "Figma", image: "https://img.icons8.com/color/240/figma.png", link: "https://www.figma.com/downloads/" },
  { title: "Canva", image: "https://img.icons8.com/color/240/canva.png", link: "https://www.canva.com/download/" },
  { title: "Dropbox", image: "https://img.icons8.com/color/240/dropbox.png", link: "https://www.dropbox.com/install" },
  { title: "Google Drive", image: "https://img.icons8.com/color/240/google-drive.png", link: "https://www.google.com/drive/download/" },
  { title: "Chrome", image: "https://img.icons8.com/color/240/chrome.png", link: "https://www.google.com/chrome/" },
  { title: "Pinterest", image: "https://img.icons8.com/color/240/pinterest.png", link: "https://www.pinterest.com/about/browser-button/" },
  { title: "Adobe Photoshop", image: "https://img.icons8.com/color/240/adobe-photoshop.png", link: "https://www.adobe.com/products/photoshop.html" },
  { title: "VS Code", image: "https://img.icons8.com/color/240/visual-studio-code-2019.png", link: "https://code.visualstudio.com/download" },
  { title: "Firefox", image: "https://img.icons8.com/color/240/firefox.png", link: "https://www.mozilla.org/firefox/download/" },
  { title: "TikTok", image: "https://img.icons8.com/color/240/tiktok.png", link: "https://www.tiktok.com/download" },
  { title: "LinkedIn", image: "https://img.icons8.com/color/240/linkedin.png", link: "https://www.linkedin.com/mobile/" },
];

const sidebarMap = {
  "Best selling": "WhatsApp",
  "Best rated": "Spotify",
  "Most popular": "Instagram",
  "New and rising": "Telegram",
  "Top free": "Facebook",
  "Top paid": "Zoom",
  "Deals": "Discord",
  "Apps": "Notion",
  "Games": "Figma",
  "Productivity": "Canva",
  "Entertainment": "Netflix",
  "Education": "Notion",
  "Social": "Instagram",
  "Communication": "WhatsApp",
  "Photo & Video": "Instagram",
  "Music": "Spotify",
  "Developer Tools": "Figma",
  "Design": "Canva",
  "Finance": "Spotify",
  "Lifestyle": "Instagram",
  "Free": "WhatsApp",
  "Paid": "Canva",
  "★5": "Spotify",
  "★4 & up": "Instagram",
  "Android": "WhatsApp",
  "iOS": "Zoom",
  "Web": "Discord",
  "Last 7 days": "Telegram",
  "Last 30 days": "Discord",
  "Adobe": "Adobe Photoshop",
  "Microsoft": "VS Code",
  "Figma": "Figma",
  "Dropbox": "Dropbox",
  "Everyone": "WhatsApp",
  "12+": "Instagram",
  "16+": "Spotify",
  "Offline": "Spotify",
  "Cloud sync": "Notion",
  "Multi-language": "Discord",
  "Customizable": "Figma",
  "Dark mode": "Discord",
};

const sections = [
  { title: "Charts", items: ["Best selling", "Best rated", "Most popular", "New and rising", "Top free", "Top paid", "Deals"] },
  { title: "Departments", items: ["Apps", "Games", "Productivity", "Entertainment", "Education", "Social"] },
  { title: "Categories", items: ["Communication", "Photo & Video", "Music", "Developer Tools", "Design", "Finance", "Lifestyle"] },
  { title: "Price", items: ["Free", "Paid"] },
  { title: "Ratings", items: ["★5", "★4 & up"] },
  { title: "Device", items: ["Android", "iOS", "Web"] },
  { title: "Release Date", items: ["Last 7 days", "Last 30 days"] },
  { title: "Developer", items: ["Adobe", "Microsoft", "Figma", "Dropbox"] },
  { title: "Age", items: ["Everyone", "12+", "16+"] },
  { title: "Features", items: ["Offline", "Cloud sync", "Multi-language", "Customizable", "Dark mode"] },
];



export default function SidebarApp() {
  const [openSection, setOpenSection] = useState(null);


  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 section scrollbar-hidden animate-slide-up">

      {/* Mobile Sidebar */}
      <div className="lg:hidden w-full overflow-x-auto scrollbar-none itmes-center">
        <div className="flex gap-3 min-w-max   text-center">
          {sections.map((sec, i) => (
            <SidebarSection
              key={i}
              {...sec}
              open={openSection === i}
              toggle={() => setOpenSection(openSection === i ? null : i)}
              horizontal
            />
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 space-y-6">
        <h2 className="text-xl font-semibold">Refine results</h2>
        {sections.map((sec, i) => (
          <SidebarSection
            key={i}
            {...sec}
            open={openSection === i}
            toggle={() => setOpenSection(openSection === i ? null : i)}
          />
        ))}
      </div>

      {/* Apps */}
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
          Top free apps
        </h1>

        {/* Mobile */}
        <div className="lg:hidden overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-2">
            {apps.map((app, i) => (
              <a key={i} href={app.link} target="_blank" rel="noopener noreferrer"
                className="w-36 p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl shrink-0 flex flex-col items-center">
                <ManagedImage src={app.image} className="w-full h-24 object-contain mb-2" />
                <h3 className="text-xs text-center text-(--secondary-foreground) hover:text-(--foreground)">{app.title}</h3>
              </a>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-4  ">
          {apps.map((app, i) => (
            <a key={i} href={app.link} target="_blank" rel="noopener noreferrer "
              className="p-4 animate-slide-left bg-[var(--card)] border border-[var(--border)] rounded-xl hover:shadow-lg hover:bg-[var(--card-hover)] transition flex flex-col items-center hover:text-(--foreground) ">
              <ManagedImage src={app.image} className="w-full h-32 object-contain mb-3" />
              <h3 className="text-sm text-center text-(--secondary-foreground) ">{app.title}</h3>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ title, items, open, toggle, horizontal }) {
  return (
    <div className={horizontal ? "min-w-[180px]" : ""}>
      <button onClick={toggle}
        className="w-full animate-slide-right bg-[var(--card)] border border-[var(--border)] p-3 rounded-md text-center font-medium whitespace-nowrap cursor-pointer  text-(--secondary-foreground) hover:text-(--foreground) transition-colors">
        {title}
      </button>

      {open && (
        <div className="mt-3 space-y-2 text-sm pl-2 ">
          {items.map((item, i) => {
            const app = apps.find(a => a.title === sidebarMap[item]);
            return (
              <a key={i} href={app?.link || "#"} target="_blank" rel="noopener noreferrer"
                className="block hover:text-blue-600 whitespace-nowrap">
                {item}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

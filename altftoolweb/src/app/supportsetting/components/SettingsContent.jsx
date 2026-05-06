"use client";

import { AlertCircle, ExternalLink, Menu } from "lucide-react";
import { settingsData } from "../data/settingData";
import { useState } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

const SettingsContent = ({ activeId, onOpenSidebar }) => {
  const setting = settingsData.find((s) => s.id === activeId);

  const [imageState, setImageState] = useState({
    src: "",
    loaded: false,
    error: false,
  });

  if (!setting) return null;
  const imageLoaded =
    imageState.src === setting.imageUrl && imageState.loaded;
  const imageError =
    imageState.src === setting.imageUrl && imageState.error;

  const handleRedirect = () => {
    const isWindows = navigator.userAgent.includes("Windows");

    if (setting.redirectUrl.startsWith("ms-settings:")) {
      if (isWindows) {
        window.location.assign(setting.redirectUrl);
      } else {
        alert("This settings page can only be opened on Windows devices.");
      }
    } else {
      window.open(setting.redirectUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-(--background) text-(--foreground)">
      <div className="p-4 sm:p-8 max-w-5xl ">

        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden my-5">
          <button
            onClick={onOpenSidebar}
            className="
              inline-flex items-center gap-2 px-4 py-2.5
              bg-(--card)
              hover:bg-(--muted)
              text-(--foreground)
              border border-(--border)
              rounded-lg font-medium
              transition active:scale-95 cursor-pointer 
            "
          >
            <Menu className="h-4 w-4" />
            Explore Settings
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="text-xs font-medium tracking-widest text-(--muted-foreground) uppercase mb-4">
          Settings &gt; {setting.title}
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-(--foreground) mb-4">
          {setting.heading}
        </h1>

        {/* Description */}
        <p className="text-base text-(--muted-foreground) leading-relaxed mb-6">
          {setting.description}
        </p>

        {/* Details */}
        {setting.details && (
          <>
            <h2 className="text-xs font-semibold tracking-widest text-(--muted-foreground) uppercase mb-3">
              Details
            </h2>

            <hr className="border-(--border) mb-4" />

            <ul className="space-y-2 mb-6">
              {setting.details.map((detail, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-(--muted-foreground)"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-(--primary)" />
                  {detail}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Important Section */}
        {/* {setting.important && (
          <div
            className="
              bg-(--card)
              border border-(--border)
              rounded-lg p-4 flex gap-3 mb-8
            "
          >
            <AlertCircle className="h-5 w-5 text-(--primary) mt-0.5 shrink-0" />

            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-(--primary)">
                Important
              </span>

              <p className="text-sm text-(--muted-foreground) mt-1">
                {setting.important}
              </p>
            </div>
          </div>
        )} */}

         {setting.important && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3 mb-8">

            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />

            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-amber-900">
                Important
              </span>

              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                {setting.important}
              </p>
            </div>

          </div>
        )}

        {/* Redirect Button */}
        <div className="mb-8">
          <button
            onClick={handleRedirect}
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-(--primary)
              text-(--primary-foreground)
              rounded-lg font-medium
              shadow-sm
              hover:opacity-90
              hover:shadow-md
              transition active:scale-95
              focus:ring-2 focus:ring-(--primary) cursor-pointer
            "
          >
            Go to {setting.title} Settings
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* Image Section */}
        {setting.imageUrl && (
          <div
            className="
              mb-8 rounded-lg overflow-hidden
              border border-(--border)
              bg-(--card)
              shadow-sm
            "
          >
            {!imageLoaded && (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-pulse text-center">
                  <div className="h-12 w-12 rounded-full bg-(--muted) mx-auto mb-2" />
                  <p className="text-sm text-(--muted-foreground)">
                    Loading image...
                  </p>
                </div>
              </div>
            )}

            {imageError && (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="text-center text-(--muted-foreground)">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  Failed to load image
                </div>
              </div>
            )}

            <ManagedImage
              key={setting.imageUrl}
              src={setting.imageUrl}
              alt={setting.imageAlt}
              className={`
                w-full object-contain max-h-96
                transition-opacity duration-300
                ${imageLoaded ? "opacity-100" : "opacity-0"}
              `}
              onLoad={() =>
                setImageState({
                  src: setting.imageUrl,
                  loaded: true,
                  error: false,
                })
              }
              onError={() => {
                setImageState({
                  src: setting.imageUrl,
                  loaded: true,
                  error: true,
                });
              }}
            />

            {imageLoaded && (
              <div className="px-4 py-2 border-t border-(--border)">
                <p className="text-xs text-(--muted-foreground)">
                  {setting.imageAlt}
                </p>
              </div>
            )}
          </div>
        )}

        {/* After Image Section */}
        {setting.afterImageContent && (
          <div className="mb-12">

            <hr className="border-(--border) mb-6" />

            <h2 className="text-xl font-semibold mb-4">
              {setting.afterImageContent.heading}
            </h2>

            {setting.afterImageContent.paragraphs?.map((para, i) => (
              <p key={i} className="text-(--muted-foreground) mb-4">
                {para}
              </p>
            ))}

            {setting.afterImageContent.steps && (
              <>
                <h3 className="text-sm font-semibold tracking-widest uppercase text-(--muted-foreground) mb-3">
                  Steps
                </h3>

                <ol className="list-decimal pl-5 space-y-2 text-sm text-(--muted-foreground) marker:text-(--primary) marker:text-lg">
                  {setting.afterImageContent.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsContent;

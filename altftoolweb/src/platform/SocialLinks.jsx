import {
  FaFacebookF,
  FaInstagram,
  FaThreads,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import clsx from "clsx";

const SOCIAL_CONFIG = {
  // gmail: {
  //   label: "Email",
  //   href: "mailto:altftool@gmail.com",
  //   icon: Mail,
  // },
  facebook: {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61586134133885",
    icon: FaFacebookF,
  },
  instagram: {
    label: "Instagram",
    href: "https://www.instagram.com/altftools/",
    icon: FaInstagram,
  },
  threads: {
    label: "Threads",
    href: "https://www.threads.com/@altftools",
    icon: FaThreads,
  },
  x: {
    label: "X (Twitter)",
    href: "https://x.com/altftool17279",
    icon: FaXTwitter,
  },
  // medium: {
  //   label: "Medium",
  //   href: "https://medium.com/@altftool",
  //   icon: Globe,
  // },
  Youtube: {
    label: "Youtube",
    href: "https://www.youtube.com/@AltFTool",
    icon: FaYoutube,
  },
};

export default function SocialLinks({
  platforms = Object.keys(SOCIAL_CONFIG),
  className,
  iconClassName = "w-4 h-4",
  variant = "dark",
}) {
  const colorStyles = [
    "border-[#1877F2]/15 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:shadow-[0_10px_22px_rgba(24,119,242,0.24)]",
    "border-[#E4405F]/15 bg-gradient-to-br from-[#F58529]/10 via-[#DD2A7B]/10 to-[#8134AF]/10 text-[#DD2A7B] hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white hover:shadow-[0_10px_22px_rgba(221,42,123,0.24)]",
    "border-[#6C4DF6]/15 bg-[#6C4DF6]/10 text-[#6C4DF6] hover:bg-[#6C4DF6] hover:text-white hover:shadow-[0_10px_22px_rgba(108,77,246,0.24)]",
    "border-[#111827]/15 bg-[#111827]/10 text-[#111827] hover:bg-[#111827] hover:text-white hover:shadow-[0_10px_22px_rgba(17,24,39,0.2)]",
    "border-[#FF0000]/15 bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white hover:shadow-[0_10px_22px_rgba(255,0,0,0.22)]",
  ];

  return (
    <div className={clsx("flex gap-3", className)}>
      {platforms.map((key, index) => {
        const { label, href, icon: Icon } = SOCIAL_CONFIG[key];
        const isColorful = variant === "colorful";

        return (
          <a
            key={key}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={label}
            title={label} // native tooltip replacement
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-xl border transition duration-200 active:scale-95 sm:h-10 sm:w-10",
              isColorful
                ? colorStyles[index % colorStyles.length]
                : "border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
            )}
          >
            <Icon className={clsx(iconClassName, isColorful ? "" : "text-white")} />
          </a>
        );
      })}
    </div>
  );
}

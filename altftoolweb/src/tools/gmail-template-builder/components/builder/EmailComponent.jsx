import React from "react";
import { Facebook, Twitter, Linkedin, Instagram, X } from "lucide-react";

const SocialIcons = { Facebook, Twitter, Linkedin, Instagram };

const EmailComponent = ({
  component,
  isSelected,
  onClick,
  isDragOverAbove,
  isDragOverBelow,
}) => {
  const { type, style, content, text, src, alt, href, links } = component;

  // Utility function defined inline for self-contained logic
  const convertStyleVars = (styleString) => {
    if (typeof styleString !== "string") return styleString;
    return styleString
      .replace(/var\(--text-primary\)/g, "inherit")
      .replace(/var\(--text-secondary\)/g, "inherit");
  };

  const cleanStyle = { ...style };

  let buttonPaddingStyles = {};
  if (type === "button") {
    buttonPaddingStyles = {
      paddingTop: cleanStyle.paddingTop,
      paddingBottom: cleanStyle.paddingBottom,
      paddingLeft: cleanStyle.paddingLeft,
      paddingRight: cleanStyle.paddingRight,
    };
    delete cleanStyle.paddingTop;
    delete cleanStyle.paddingBottom;
    delete cleanStyle.paddingLeft;
    delete cleanStyle.paddingRight;
  }

  // Determine content to render
  let componentContent;

  switch (type) {
    case "text":
    case "header":
    case "footer":
    case "signature":
      componentContent = (
        <div
          // We use dangerouslySetInnerHTML to allow HTML content in the editor
          dangerouslySetInnerHTML={{
            __html: content.replace(/\n/g, "<br />"),
          }}
          className="w-full"
          style={{
            ...cleanStyle,
            backgroundColor: cleanStyle.backgroundColor || "transparent",
            color: convertStyleVars(cleanStyle.color || "inherit"),
            padding: `${style.paddingTop || "10px"} ${
              style.paddingRight || "20px"
            } ${style.paddingBottom || "10px"} ${style.paddingLeft || "20px"}`,
            fontSize: cleanStyle.fontSize,
            lineHeight: cleanStyle.lineHeight,
            textAlign: cleanStyle.textAlign,
            fontWeight: cleanStyle.fontWeight,
            fontStyle: cleanStyle.fontStyle,
            wordBreak: "break-word",
          }}
        />
      );
      break;

    case "image":
    case "logo": {
      const ImageElement = (
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: cleanStyle.maxWidth || "100%",
            width: cleanStyle.width || "100%",
            height: cleanStyle.height || "auto",
            display: "block",
            margin: "0 auto",
            borderRadius: cleanStyle.borderRadius || "0px",
          }}
        />
      );

      // If it's a logo and has a link, wrap it in an anchor tag
      const LinkedImage =
        type === "logo" && href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.preventDefault()}
          >
            {ImageElement}
          </a>
        ) : (
          ImageElement
        );

      componentContent = (
        <div
          className="w-full"
          style={{
            textAlign: cleanStyle.textAlign || "center",
            padding: `${style.paddingTop || "10px"} ${
              style.paddingRight || "20px"
            } ${style.paddingBottom || "10px"} ${style.paddingLeft || "20px"}`,
          }}
        >
          {LinkedImage}
        </div>
      );
      break;
    }

    case "button":
      componentContent = (
        <div
          className="w-full"
          style={{
            textAlign: cleanStyle.textAlign || "center",
            padding: `${style.paddingTop || "10px"} ${
              style.paddingRight || "20px"
            } ${style.paddingBottom || "10px"} ${style.paddingLeft || "20px"}`,
          }}
        >
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            style={{
              backgroundColor: cleanStyle.backgroundColor,
              borderRadius: cleanStyle.borderRadius,
              color: cleanStyle.color,
              fontSize: cleanStyle.fontSize,
              fontWeight: cleanStyle.fontWeight,
              textDecoration: "none",
              ...buttonPaddingStyles,
              lineHeight: "normal",
              cursor: "pointer",
            }}
            onClick={(e) => e.preventDefault()}
          >
            {text}
          </a>
        </div>
      );
      break;

    case "divider":
      componentContent = (
        <div
          style={{
            ...cleanStyle,
            padding: `${style.paddingTop || "15px"} ${
              style.paddingRight || "20px"
            } ${style.paddingBottom || "15px"} ${style.paddingLeft || "20px"}`,
            height: 0,
          }}
        >
          <div
            style={{
              borderBottom: `1px solid ${cleanStyle.borderColor || "#e2e8f0"}`,
              width: "100%",
              height: "0px",
            }}
          />
        </div>
      );
      break;

    // NEW COMPONENT: SOCIAL MEDIA
    case "socialMedia":
      componentContent = (
        <div
          className="w-full"
          style={{
            textAlign: cleanStyle.textAlign || "center",
            padding: `${style.paddingTop || "20px"} ${
              style.paddingRight || "20px"
            } ${style.paddingBottom || "20px"} ${style.paddingLeft || "20px"}`,
            backgroundColor: cleanStyle.backgroundColor || "transparent",
          }}
        >
          <div className="inline-flex items-center">
            {links &&
              links.map((link, index) => {
                const Icon = SocialIcons[link.icon] || X;
                if (!Icon) return null;

                const isLast = index === links.length - 1;

                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.preventDefault()}
                    style={{
                      display: "inline-block",
                      color: cleanStyle.iconColor || "inherit",
                      marginRight: isLast
                        ? "0"
                        : cleanStyle.iconSpacing || "15px",
                    }}
                  >
                    <Icon
                      style={{
                        width: cleanStyle.iconSize || "24px",
                        height: cleanStyle.iconSize || "24px",
                      }}
                    />
                  </a>
                );
              })}
          </div>
        </div>
      );
      break;

    default:
      componentContent = (
        <div className="p-4 bg-red-100 text-red-800 border border-red-400">
          Unknown Component Type: {type}
        </div>
      );
  }

  return (
    <div
      className={`relative cursor-pointer transition-shadow duration-150 group-hover:shadow-lg
                  ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-accent border-2 border-accent shadow-xl"
                      : "border border-transparent hover:border-accent-dark/50"
                  }
                  ${isDragOverAbove ? "border-t-4 border-t-blue-500/80" : ""}
                  ${isDragOverBelow ? "border-b-4 border-b-blue-500/80" : ""}`}
      onClick={onClick}
    >
      {/* Overlay to catch clicks and show selection border */}
      <div
        className={`absolute inset-0 z-10 ${
          isSelected ? "" : "hover:bg-muted/10 dark:hover:bg-background/10"
        }`}
        style={{
          backgroundColor:
            style.backgroundColor &&
            type !== "text" &&
            type !== "header" &&
            type !== "footer" &&
            type !== "signature" &&
            type !== "socialMedia"
              ? style.backgroundColor
              : "transparent",
          margin: 0,
          overflow: "hidden",
        }}
      >
        {componentContent}
      </div>

      {/* Selection Border & Indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 p-1 bg-(--primary) text-foreground text-xs font-bold rounded-bl-lg z-20 shadow-lg">
          {type.toUpperCase()}
        </div>
      )}

      {/* Actual Content Wrapper for Visual Inspection */}
      <div className={`relative p-0 pointer-events-none`}>
        {componentContent}
      </div>
    </div>
  );
};
export default EmailComponent;

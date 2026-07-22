// export const getDefaults = (type) => {
//   const base = {
//     id: Date.now() + Math.random(),
//     type,
//     style: {
//       paddingTop: "10px",
//       paddingBottom: "10px",
//       paddingLeft: "20px",
//       paddingRight: "20px",
//       width: "100%",
//       maxWidth: "600px",
//       boxSizing: "border-box",
//     },
//   };

//   switch (type) {
//     case "text":
//       return {
//         ...base,
//         content: "This is a text block. Click to edit.",
//         style: {
//           ...base.style,
//           fontSize: "16px",
//           color: "var(--text-primary)",
//           lineHeight: "1.5",
//           textAlign: "left",
//           backgroundColor: "transparent",
//         },
//       };
//     case "image":
//       return {
//         ...base,
//         src: "https://placehold.co/600x200/f59e0b/111111?text=Your+Image+Here",
//         alt: "Placeholder Image",
//         style: {
//           ...base.style,
//           paddingTop: "0px",
//           paddingBottom: "0px",
//           paddingLeft: "0px",
//           paddingRight: "0px",
//           display: "block",
//         },
//       };
//     case "button":
//       return {
//         ...base,
//         text: "Click Me",
//         href: "https://example.com",
//         style: {
//           ...base.style,
//           backgroundColor: "#d97706",
//           color: "#ffffff",
//           borderRadius: "5px",
//           textAlign: "center",
//           paddingTop: "12px",
//           paddingBottom: "12px",
//           paddingLeft: "24px",
//           paddingRight: "24px",
//           fontSize: "16px",
//           fontWeight: "bold",
//           display: "inline-block",
//         },
//       };
//     case "divider":
//       return {
//         ...base,
//         style: {
//           ...base.style,
//           paddingTop: "15px",
//           paddingBottom: "15px",
//           borderBottom: "1px solid #e2e8f0",
//         },
//       };
//     case "header":
//       return {
//         ...base,
//         content: "Company Name",
//         style: {
//           ...base.style,
//           fontSize: "24px",
//           color: "var(--text-primary)",
//           lineHeight: "1.2",
//           textAlign: "center",
//           fontWeight: "bold",
//           backgroundColor: "#f9fafb",
//           borderBottom: "1px solid #e5e7eb",
//         },
//       };
//     case "footer":
//       return {
//         ...base,
//         content: "© 2023 Company Name. All rights reserved.",
//         style: {
//           ...base.style,
//           fontSize: "14px",
//           color: "var(--text-secondary)",
//           lineHeight: "1.5",
//           textAlign: "center",
//           backgroundColor: "#f9fafb",
//           borderTop: "1px solid #e5e7eb",
//         },
//       };
//     case "signature":
//       return {
//         ...base,
//         content: "Best regards,\nYour Name\nYour Position",
//         style: {
//           ...base.style,
//           fontSize: "16px",
//           color: "var(--text-primary)",
//           lineHeight: "1.5",
//           textAlign: "left",
//           fontStyle: "italic",
//         },
//       };
//     default:
//       return base;
//   }
// };

// componentDefaults.js
export const getDefaults = (type) => {
  const base = {
    id: Date.now() + Math.random(),
    type,
    style: {
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingLeft: "20px",
      paddingRight: "20px",
      width: "100%",
      maxWidth: "600px",
      boxSizing: "border-box",
    },
  };

  switch (type) {
    case "text":
      return {
        ...base,
        content: "This is a text block. Click to edit.",
        style: {
          ...base.style,
          fontSize: "16px",
          color: "var(--text-primary)",
          lineHeight: "1.5",
          textAlign: "left",
          backgroundColor: "transparent",
        },
      };
    case "image":
      return {
        ...base,
        src: "https://placehold.co/600x200/f59e0b/111111?text=Your+Image+Here",
        alt: "Placeholder Image",
        style: {
          ...base.style,
          paddingTop: "0px",
          paddingBottom: "0px",
          paddingLeft: "0px",
          paddingRight: "0px",
          display: "block",
          borderRadius: "0px", // NEW
          height: "auto", // NEW
          maxWidth: "100%",
        },
      };
    case "button":
      return {
        ...base,
        text: "Click Me",
        href: "https://example.com",
        style: {
          ...base.style,
          backgroundColor: "#d97706",
          color: "#ffffff",
          borderRadius: "5px",
          textAlign: "center",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "24px",
          paddingRight: "24px",
          fontSize: "16px",
          fontWeight: "bold",
          display: "inline-block",
        },
      };
    case "divider":
      return {
        ...base,
        style: {
          ...base.style,
          paddingTop: "15px",
          paddingBottom: "15px",
          borderBottom: "1px solid #e2e8f0",
        },
      };
    case "header":
      return {
        ...base,
        content: "Company Name",
        style: {
          ...base.style,
          fontSize: "24px",
          color: "var(--text-primary)",
          lineHeight: "1.2",
          textAlign: "center",
          fontWeight: "bold",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        },
      };
    case "footer":
      return {
        ...base,
        content: "© 2023 Company Name. All rights reserved.",
        style: {
          ...base.style,
          fontSize: "14px",
          color: "var(--text-secondary)",
          lineHeight: "1.5",
          textAlign: "center",
          backgroundColor: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
        },
      };
    case "signature":
      return {
        ...base,
        content: "Best regards,\nYour Name\nYour Position",
        style: {
          ...base.style,
          fontSize: "16px",
          color: "var(--text-primary)",
          lineHeight: "1.5",
          textAlign: "left",
          fontStyle: "italic",
        },
      };
    // NEW COMPONENT: LOGO
    case "logo":
      return {
        ...base,
        src: "https://placehold.co/150x50/1f2937/ffffff?text=LOGO",
        alt: "Company Logo",
        href: "https://yourwebsite.com",
        style: {
          ...base.style,
          paddingTop: "20px",
          paddingBottom: "20px",
          display: "block",
          width: "150px",
          maxWidth: "150px",
          height: "auto",
          borderRadius: "0px",
          textAlign: "center",
        },
      };
    // NEW COMPONENT: SOCIAL MEDIA
    case "socialMedia":
      return {
        ...base,
        links: [
          {
            name: "Facebook",
            url: "https://facebook.com/yourpage",
            icon: "Facebook",
          },
          {
            name: "Twitter",
            url: "https://twitter.com/yourhandle",
            icon: "Twitter",
          },
          {
            name: "LinkedIn",
            url: "https://linkedin.com/company/yourcompany",
            icon: "Linkedin",
          },
        ],
        style: {
          ...base.style,
          textAlign: "center",
          paddingTop: "20px",
          paddingBottom: "20px",
          iconSize: "24px",
          iconColor: "var(--text-primary)",
          iconSpacing: "15px", // Spacing between icons
        },
      };
    default:
      return base;
  }
};

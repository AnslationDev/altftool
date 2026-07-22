// // htmlGenerators.js

// /**
//  * Utility to convert camelCase style object to an inline CSS string.
//  */
// export const objectToInlineStyle = (styleObj) => {
//   return Object.entries(styleObj)
//     .map(([key, value]) => {
//       const cssKey = key.replace(
//         /[A-Z]/g,
//         (match) => `-${match.toLowerCase()}`
//       );
//       return `${cssKey}: ${value};`;
//     })
//     .join(" ");
// };

// // export const generateEmailHtml = (components) => {
// //   const emailBody = components
// //     .map((comp) => {
// //       // Your existing HTML generation logic (copied from App.jsx)
// //       const cleanStyle = { ...comp.style };
// //       delete cleanStyle.width;
// //       delete cleanStyle.maxWidth;
// //       delete cleanStyle.boxSizing;

// //       let buttonPaddingStyles = "";
// //       if (comp.type === "button") {
// //         buttonPaddingStyles = `padding-top: ${cleanStyle.paddingTop}; padding-bottom: ${cleanStyle.paddingBottom}; padding-left: ${cleanStyle.paddingLeft}; padding-right: ${cleanStyle.paddingRight};`;
// //         delete cleanStyle.paddingTop;
// //         delete cleanStyle.paddingBottom;
// //         delete cleanStyle.paddingLeft;
// //         delete cleanStyle.paddingRight;
// //       }

// //       const styles = objectToInlineStyle(cleanStyle);

// //       switch (comp.type) {
// //         case "text":
// //           return `
// //             <tr>
// //               <td style="${styles}">
// //                 <p style="margin:0; ${objectToInlineStyle({
// //                   fontSize: comp.style.fontSize,
// //                   color: comp.style.color,
// //                   lineHeight: comp.style.lineHeight,
// //                   textAlign: comp.style.textAlign,
// //                   backgroundColor: comp.style.backgroundColor,
// //                   boxSizing: "border-box",
// //                 })}">
// //                   ${comp.content.replace(/\n/g, "<br />")}
// //                 </p>
// //               </td>
// //             </tr>
// //           `;
// //         case "image":
// //           return `
// //             <tr>
// //               <td style="${styles} text-align:center;">
// //                 <img src="${comp.src}" alt="${comp.alt}"
// //                     style="max-width: ${
// //                       comp.style.maxWidth || "100%"
// //                     }; width: ${
// //             comp.style.width || "100%"
// //           }; height: auto; display: block; margin: 0 auto;"
// //                     width="${parseInt(comp.style.maxWidth) || 600}" />
// //               </td>
// //             </tr>
// //           `;
// //         case "button": {
// //           const {
// //             backgroundColor,
// //             color,
// //             borderRadius,
// //             textAlign,
// //             fontSize,
// //             fontWeight,
// //           } = comp.style;

// //           return `
// //             <tr>
// //               <td style="${styles} text-align:${textAlign || "center"};">
// //                 <a href="${comp.href}"
// //                   target="_blank"
// //                   style="background-color: ${backgroundColor}; border-radius: ${borderRadius}; color: ${color}; display: inline-block; font-family: sans-serif; font-size: ${
// //             fontSize || "16px"
// //           }; font-weight: ${
// //             fontWeight || "bold"
// //           }; line-height: normal; text-align: center; text-decoration: none; ${buttonPaddingStyles} -webkit-text-size-adjust: none; mso-hide: all;">
// //                   ${comp.text}
// //                 </a>
// //               </td>
// //             </tr>
// //           `;
// //         }
// //         case "divider":
// //           return `
// //             <tr>
// //               <td style="${styles}">
// //                 <div style="border-bottom: ${comp.style.borderWidth || "1px"} ${
// //             comp.style.borderStyle || "solid"
// //           } ${
// //             comp.style.borderColor || "#e2e8f0"
// //           }; line-height: 0; font-size: 0;">&nbsp;</div>
// //               </td>
// //             </tr>
// //           `;
// //         case "header":
// //           return `
// //             <tr>
// //               <td style="${styles}">
// //                 <h1 style="margin:0; ${objectToInlineStyle({
// //                   fontSize: comp.style.fontSize,
// //                   color: comp.style.color,
// //                   lineHeight: comp.style.lineHeight,
// //                   textAlign: comp.style.textAlign,
// //                   fontWeight: comp.style.fontWeight,
// //                   backgroundColor: comp.style.backgroundColor,
// //                   borderBottom: comp.style.borderBottom,
// //                   padding: "20px",
// //                 })}">
// //                   ${comp.content.replace(/\n/g, "<br />")}
// //                 </h1>
// //               </td>
// //             </tr>
// //           `;
// //         case "footer":
// //           return `
// //             <tr>
// //               <td style="${styles}">
// //                 <div style="margin:0; ${objectToInlineStyle({
// //                   fontSize: comp.style.fontSize,
// //                   color: comp.style.color,
// //                   lineHeight: comp.style.lineHeight,
// //                   textAlign: comp.style.textAlign,
// //                   backgroundColor: comp.style.backgroundColor,
// //                   borderTop: comp.style.borderTop,
// //                   padding: "20px",
// //                 })}">
// //                   ${comp.content.replace(/\n/g, "<br />")}
// //                 </div>
// //               </td>
// //             </tr>
// //           `;
// //         case "signature":
// //           return `
// //             <tr>
// //               <td style="${styles}">
// //                 <div style="margin:0; ${objectToInlineStyle({
// //                   fontSize: comp.style.fontSize,
// //                   color: comp.style.color,
// //                   lineHeight: comp.style.lineHeight,
// //                   textAlign: comp.style.textAlign,
// //                   fontStyle: comp.style.fontStyle,
// //                   padding: "10px",
// //                 })}">
// //                   ${comp.content.replace(/\n/g, "<br />")}
// //                 </div>
// //               </td>
// //             </tr>
// //           `;
// //         default:
// //           return "";
// //       }
// //     })
// //     .join("\n");

// //   // The full wrapping boilerplate remains the same
// //   return `
// //       <!DOCTYPE html>
// //       <html lang="en">
// //       <head>
// //         <meta charset="UTF-8">
// //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
// //         <title>Your Email</title>
// //         <style>
// //           /* Universal styles */
// //           body { margin: 0 !important; padding: 0 !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; box-sizing: border-box; }
// //           table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
// //           table td { border-collapse: collapse; }
// //           img { -ms-interpolation-mode: bicubic; border: 0; height: auto; outline: none; text-decoration: none; max-width: 100%; }
// //           a { text-decoration: none; }

// //           /* Responsive styles */
// //           @media screen and (max-width: 600px) {
// //             .outer { width: 100% !important; max-width: 100% !important; }
// //             td.full-width-image img { width: 100% !important; max-width: 100% !important; }
// //           }
// //         </style>
// //       </head>
// //       <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: sans-serif; -webkit-font-smoothing: antialiased; width: 100%;" class="hide-scrollbar">
// //         <center style="width: 100%; background-color: #f4f4f4;">
// //           <div style="max-width: 600px; margin: 0 auto;">
// //             <table class="outer" align="center" role="presentation" style="margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #333; background-color: #ffffff;">
// //               <tbody>
// //                 ${emailBody}
// //               </tbody>
// //             </table>
// //             </div>
// //         </center>
// //       </body>
// //       </html>
// //     `;
// // };

// /**
//  * Generates the full HTML email template.
//  */
// export const generateEmailHtml = (components) => {
//   const emailBody = components
//     .map((comp) => {
//       const cleanStyle = { ...comp.style };
//       // These styles are applied to the wrapper TD and must be removed from the inner content block
//       delete cleanStyle.width;
//       delete cleanStyle.maxWidth;
//       delete cleanStyle.boxSizing;

//       let buttonPaddingStyles = "";
//       if (comp.type === "button") {
//         // Button padding needs to be on the A tag for reliable email client rendering
//         buttonPaddingStyles = `padding-top: ${cleanStyle.paddingTop}; padding-bottom: ${cleanStyle.paddingBottom}; padding-left: ${cleanStyle.paddingLeft}; padding-right: ${cleanStyle.paddingRight};`;
//         delete cleanStyle.paddingTop;
//         delete cleanStyle.paddingBottom;
//         delete cleanStyle.paddingLeft;
//         delete cleanStyle.paddingRight;
//       }

//       // Styles for the wrapper TD (mainly padding and background)
//       const tdStyles = objectToInlineStyle(cleanStyle);

//       switch (comp.type) {
//         case "text":
//           return `
//             <tr>
//               <td style="${tdStyles}">
//                 <p style="margin:0; ${objectToInlineStyle({
//                   fontSize: comp.style.fontSize,
//                   color: comp.style.color,
//                   lineHeight: comp.style.lineHeight,
//                   textAlign: comp.style.textAlign,
//                   backgroundColor: comp.style.backgroundColor,
//                   boxSizing: "border-box",
//                 })}">
//                   ${comp.content.replace(/\n/g, "<br />")}
//                 </p>
//               </td>
//             </tr>
//           `;
//         case "image":
//           return `
//             <tr>
//               <td style="${tdStyles} text-align:center;">
//                 <img src="${comp.src}" alt="${comp.alt}"
//                     style="max-width: ${
//                       comp.style.maxWidth || "100%"
//                     }; width: ${
//             comp.style.width || "100%"
//           }; height: auto; display: block; margin: 0 auto;"
//                     width="${parseInt(comp.style.maxWidth) || 600}" />
//               </td>
//             </tr>
//           `;
//         case "button": {
//           const {
//             backgroundColor,
//             color,
//             borderRadius,
//             textAlign,
//             fontSize,
//             fontWeight,
//           } = comp.style;

//           return `
//             <tr>
//               <td style="${tdStyles} text-align:${textAlign || "center"};">
//                 <a href="${comp.href}"
//                   target="_blank"
//                   style="background-color: ${backgroundColor}; border-radius: ${borderRadius}; color: ${color}; display: inline-block; font-family: sans-serif; font-size: ${
//             fontSize || "16px"
//           }; font-weight: ${
//             fontWeight || "bold"
//           }; line-height: normal; text-align: center; text-decoration: none; ${buttonPaddingStyles} -webkit-text-size-adjust: none; mso-hide: all;">
//                   ${comp.text}
//                 </a>
//               </td>
//             </tr>
//           `;
//         }
//         case "divider":
//           return `
//             <tr>
//               <td style="${tdStyles}">
//                 <div style="border-bottom: ${comp.style.borderWidth || "1px"} ${
//             comp.style.borderStyle || "solid"
//           } ${
//             comp.style.borderColor || "#e2e8f0"
//           }; line-height: 0; font-size: 0;">&nbsp;</div>
//               </td>
//             </tr>
//           `;
//         case "header":
//           return `
//             <tr>
//               <td style="${tdStyles}">
//                 <h1 style="margin:0; ${objectToInlineStyle({
//                   fontSize: comp.style.fontSize,
//                   color: comp.style.color,
//                   lineHeight: comp.style.lineHeight,
//                   textAlign: comp.style.textAlign,
//                   fontWeight: comp.style.fontWeight,
//                   backgroundColor: comp.style.backgroundColor,
//                   borderBottom: comp.style.borderBottom,
//                   padding: "20px",
//                 })}">
//                   ${comp.content.replace(/\n/g, "<br />")}
//                 </h1>
//               </td>
//             </tr>
//           `;
//         case "footer":
//           return `
//             <tr>
//               <td style="${tdStyles}">
//                 <div style="margin:0; ${objectToInlineStyle({
//                   fontSize: comp.style.fontSize,
//                   color: comp.style.color,
//                   lineHeight: comp.style.lineHeight,
//                   textAlign: comp.style.textAlign,
//                   backgroundColor: comp.style.backgroundColor,
//                   borderTop: comp.style.borderTop,
//                   padding: "20px",
//                 })}">
//                   ${comp.content.replace(/\n/g, "<br />")}
//                 </div>
//               </td>
//             </tr>
//           `;
//         case "signature":
//           return `
//             <tr>
//               <td style="${tdStyles}">
//                 <div style="margin:0; ${objectToInlineStyle({
//                   fontSize: comp.style.fontSize,
//                   color: comp.style.color,
//                   lineHeight: comp.style.lineHeight,
//                   textAlign: comp.style.textAlign,
//                   fontStyle: comp.style.fontStyle,
//                   padding: "10px",
//                 })}">
//                   ${comp.content.replace(/\n/g, "<br />")}
//                 </div>
//               </td>
//             </tr>
//           `;
//         default:
//           return "";
//       }
//     })
//     .join("\n");

//   // The full wrapping boilerplate
//   return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Your Email</title>
//         <style>
//           /* Universal styles */
//           body { margin: 0 !important; padding: 0 !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; box-sizing: border-box; }
//           table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
//           table td { border-collapse: collapse; }
//           img { -ms-interpolation-mode: bicubic; border: 0; height: auto; outline: none; text-decoration: none; max-width: 100%; }
//           a { text-decoration: none; }

//           /* Responsive styles */
//           @media screen and (max-width: 600px) {
//             .outer { width: 100% !important; max-width: 100% !important; }
//             td.full-width-image img { width: 100% !important; max-width: 100% !important; }
//           }
//         </style>
//       </head>
//       <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: sans-serif; -webkit-font-smoothing: antialiased; width: 100%;" class="hide-scrollbar">
//         <center style="width: 100%; background-color: #f4f4f4;">
//           <div style="max-width: 600px; margin: 0 auto;">
//             <table class="outer" align="center" role="presentation" style="margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #333; background-color: #ffffff;">
//               <tbody>
//                 ${emailBody}
//               </tbody>
//             </table>
//             </div>
//         </center>
//       </body>
//       </html>
//     `;
// };

// htmlGenerators.js

/**
 * Utility to convert camelCase style object to an inline CSS string.
 */
export const objectToInlineStyle = (styleObj) => {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      const cssKey = key.replace(
        /[A-Z]/g,
        (match) => `-${match.toLowerCase()}`
      );
      return `${cssKey}: ${value};`;
    })
    .join(" ");
};

/**
 * Generates the full HTML email template.
 */
export const generateEmailHtml = (components) => {
  const emailBody = components
    .map((comp) => {
      const cleanStyle = { ...comp.style };
      // Remove styles applied to the inner content from the TD wrapper
      delete cleanStyle.width;
      delete cleanStyle.maxWidth;
      delete cleanStyle.boxSizing;
      delete cleanStyle.borderRadius;
      delete cleanStyle.height;

      // Button-specific style removals for the A tag
      let buttonPaddingStyles = "";
      if (comp.type === "button") {
        buttonPaddingStyles = `padding-top: ${comp.style.paddingTop}; padding-bottom: ${comp.style.paddingBottom}; padding-left: ${comp.style.paddingLeft}; padding-right: ${comp.style.paddingRight};`;
        delete cleanStyle.paddingTop;
        delete cleanStyle.paddingBottom;
        delete cleanStyle.paddingLeft;
        delete cleanStyle.paddingRight;
      }

      // Social Media specific style removals for inner elements
      let socialMediaStyles = {};
      if (comp.type === "socialMedia") {
        socialMediaStyles = {
          color: comp.style.iconColor,
          spacing: comp.style.iconSpacing,
        };
        delete cleanStyle.iconColor;
        delete cleanStyle.iconSize;
        delete cleanStyle.iconSpacing;
      }

      // Styles for the wrapper TD (mainly padding and background)
      const tdStyles = objectToInlineStyle(cleanStyle);

      switch (comp.type) {
        case "text":
          // ... (existing text case)
          return `
            <tr>
              <td style="${tdStyles}">
                <p style="margin:0; ${objectToInlineStyle({
                  fontSize: comp.style.fontSize,
                  color: comp.style.color,
                  lineHeight: comp.style.lineHeight,
                  textAlign: comp.style.textAlign,
                  backgroundColor: comp.style.backgroundColor,
                  boxSizing: "border-box",
                })}">
                  ${comp.content.replace(/\n/g, "<br />")}
                </p>
              </td>
            </tr>
          `;

        case "image":
        case "logo": { // Handle Logo and Image together
          const imgStyles = objectToInlineStyle({
            maxWidth: comp.style.maxWidth || "100%",
            width: comp.style.width || "100%",
            height: comp.style.height || "auto",
            display: "block",
            margin: "0 auto",
            borderRadius: comp.style.borderRadius || "0px",
          });

          const imgHtml = `
            <img src="${comp.src}" alt="${comp.alt}"
                style="${imgStyles}"
                width="${
                  parseInt(comp.style.width) ||
                  parseInt(comp.style.maxWidth) ||
                  600
                }" />
          `;

          let contentHtml;

          if (comp.type === "logo" && comp.href) {
            contentHtml = `
              <a href="${comp.href}" target="_blank" style="display:inline-block; text-decoration:none;">
                ${imgHtml}
              </a>
            `;
          } else {
            contentHtml = imgHtml;
          }

          return `
            <tr>
              <td style="${tdStyles} text-align:${
            comp.style.textAlign || "center"
          };">
                ${contentHtml}
              </td>
            </tr>
          `;
        }

        case "button": {
          const {
            backgroundColor,
            color,
            borderRadius,
            textAlign,
            fontSize,
            fontWeight,
          } = comp.style;

          return `
            <tr>
              <td style="${tdStyles} text-align:${textAlign || "center"};">
                <a href="${comp.href}"
                  target="_blank"
                  style="background-color: ${backgroundColor}; border-radius: ${borderRadius}; color: ${color}; display: inline-block; font-family: sans-serif; font-size: ${
            fontSize || "16px"
          }; font-weight: ${
            fontWeight || "bold"
          }; line-height: normal; text-align: center; text-decoration: none; ${buttonPaddingStyles} -webkit-text-size-adjust: none; mso-hide: all;">
                  ${comp.text}
                </a>
              </td>
            </tr>
          `;
        }
        case "divider":
          return `
            <tr>
              <td style="${tdStyles}">
                <div style="border-bottom: ${comp.style.borderWidth || "1px"} ${
            comp.style.borderStyle || "solid"
          } ${
            comp.style.borderColor || "#e2e8f0"
          }; line-height: 0; font-size: 0;">&nbsp;</div>
              </td>
            </tr>
          `;

        case "header":
          return `
            <tr>
              <td style="${tdStyles}">
                <h1 style="margin:0; ${objectToInlineStyle({
                  fontSize: comp.style.fontSize,
                  color: comp.style.color,
                  lineHeight: comp.style.lineHeight,
                  textAlign: comp.style.textAlign,
                  fontWeight: comp.style.fontWeight,
                  backgroundColor: comp.style.backgroundColor,
                  borderBottom: comp.style.borderBottom,
                  padding: "20px",
                })}">
                  ${comp.content.replace(/\n/g, "<br />")}
                </h1>
              </td>
            </tr>
          `;
        case "footer":
          return `
            <tr>
              <td style="${tdStyles}">
                <div style="margin:0; ${objectToInlineStyle({
                  fontSize: comp.style.fontSize,
                  color: comp.style.color,
                  lineHeight: comp.style.lineHeight,
                  textAlign: comp.style.textAlign,
                  backgroundColor: comp.style.backgroundColor,
                  borderTop: comp.style.borderTop,
                  padding: "20px",
                })}">
                  ${comp.content.replace(/\n/g, "<br />")}
                </div>
              </td>
            </tr>
          `;
        case "signature":
          return `
            <tr>
              <td style="${tdStyles}">
                <div style="margin:0; ${objectToInlineStyle({
                  fontSize: comp.style.fontSize,
                  color: comp.style.color,
                  lineHeight: comp.style.lineHeight,
                  textAlign: comp.style.textAlign,
                  fontStyle: comp.style.fontStyle,
                  padding: "10px",
                })}">
                  ${comp.content.replace(/\n/g, "<br />")}
                </div>
              </td>
            </tr>
          `;

        // NEW COMPONENT: SOCIAL MEDIA
        case "socialMedia": {
          const iconColor = socialMediaStyles.color || "#333333";
          const iconSpacing = socialMediaStyles.spacing || "15px";

          // Use simple text/links for maximum email client compatibility
          const socialLinksSimpleHtml = comp.links
            .map((link, index) => {
              const isLast = index === comp.links.length - 1;
              return `
                  <a href="${
                    link.url
                  }" target="_blank" style="color:${iconColor}; font-size:14px; text-decoration:none; margin-right:${
                isLast ? "0" : iconSpacing
              };">
                      ${link.name}
                  </a>
              `;
            })
            .join("");

          return `
            <tr>
              <td style="${tdStyles} text-align:${
            comp.style.textAlign || "center"
          };">
                <div style="font-family: sans-serif; font-size: 14px; color: ${iconColor}; line-height: 1.5;">
                  ${socialLinksSimpleHtml}
                </div>
              </td>
            </tr>
          `;
        }

        default:
          return "";
      }
    })
    .join("\n");

  // The full wrapping boilerplate
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Email</title>
        <style>
          /* Universal styles */
          body { margin: 0 !important; padding: 0 !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; box-sizing: border-box; }
          table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          table td { border-collapse: collapse; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; outline: none; text-decoration: none; max-width: 100%; }
          a { text-decoration: none; }

          /* Responsive styles */
          @media screen and (max-width: 600px) {
            .outer { width: 100% !important; max-width: 100% !important; }
            td.full-width-image img { width: 100% !important; max-width: 100% !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: sans-serif; -webkit-font-smoothing: antialiased; width: 100%;" class="hide-scrollbar">
        <center style="width: 100%; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto;">
            <table class="outer" align="center" role="presentation" style="margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #333; background-color: #ffffff;">
              <tbody>
                ${emailBody}
              </tbody>
            </table>
            </div>
        </center>
      </body>
      </html>
    `;
};

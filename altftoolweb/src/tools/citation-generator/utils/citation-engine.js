/**
 * Citation Engine
 * Handles formatting for various styles and source types.
 */

const formatAuthors = (authors, style) => {
  if (!authors || authors.length === 0) return "";
  
  const authorList = authors.split(",").map(a => a.trim());
  
  if (style === "APA 7") {
    // Lastname, F. M.
    return authorList.map(name => {
      const parts = name.split(" ");
      const last = parts.pop();
      const initials = parts.map(p => p[0] + ".").join(" ");
      return `${last}, ${initials}`;
    }).join(", & ");
  }
  
  if (style === "MLA 9") {
    // Lastname, Firstname
    if (authorList.length === 1) {
      const parts = authorList[0].split(" ");
      const last = parts.pop();
      const first = parts.join(" ");
      return `${last}, ${first}`;
    }
    return authorList.join(", and ");
  }

  if (style === "IEEE") {
    // F. M. Lastname
    return authorList.map(name => {
      const parts = name.split(" ");
      const last = parts.pop();
      const initials = parts.map(p => p[0] + ".").join(" ");
      return `${initials} ${last}`;
    }).join(", ");
  }

  return authorList.join(", ");
};

export const generateCitation = (data, style) => {
  const { sourceType, authors, title, publisher, year, url, journal, volume, issue, pages, doi, edition, city, accessDate, publishedDate } = data;
  
  const authorStr = formatAuthors(authors, style);
  const currentYear = year || new Date().getFullYear();

  switch (sourceType) {
    case "Book":
      if (style === "APA 7") {
        return `${authorStr} (${currentYear}). ${title}${edition ? ` (${edition} ed.)` : ""}. ${publisher}.`;
      }
      if (style === "MLA 9") {
        return `${authorStr}. ${title}. ${edition ? `${edition} ed., ` : ""}${publisher}, ${currentYear}.`;
      }
      if (style === "IEEE") {
        return `${authorStr}, ${title}. ${city ? `${city}: ` : ""}${publisher}, ${currentYear}.`;
      }
      if (style === "Chicago") {
        return `${authorStr}. ${title}. ${city ? `${city}: ` : ""}${publisher}, ${currentYear}.`;
      }
      return `${authorStr} (${currentYear}) ${title}. ${publisher}.`;

    case "Website":
      if (style === "APA 7") {
        return `${authorStr} (${publishedDate || currentYear}). ${title}. ${publisher || ""}. ${url}`;
      }
      if (style === "MLA 9") {
        return `${authorStr}. "${title}." ${publisher || ""}, ${publishedDate || currentYear}, ${url}. Accessed ${accessDate || ""}.`;
      }
      if (style === "IEEE") {
        return `${authorStr}, "${title}," ${publisher || ""}, [Online]. Available: ${url}. [Accessed: ${accessDate || ""}].`;
      }
      return `${authorStr} ${title}. ${url}`;

    case "Journal Article":
      if (style === "APA 7") {
        return `${authorStr} (${currentYear}). ${title}. ${journal}, ${volume}${issue ? `(${issue})` : ""}, ${pages}. ${doi ? `https://doi.org/${doi}` : ""}`;
      }
      if (style === "MLA 9") {
        return `${authorStr}. "${title}." ${journal}, vol. ${volume}, no. ${issue || ""}, ${currentYear}, pp. ${pages}. ${doi ? `doi:${doi}` : ""}`;
      }
      if (style === "IEEE") {
        return `${authorStr}, "${title}," ${journal}, vol. ${volume}, no. ${issue || ""}, pp. ${pages}, ${currentYear}. ${doi ? `doi: ${doi}` : ""}`;
      }
      return `${authorStr} (${currentYear}). ${title}. ${journal}.`;

    case "YouTube Video":
    case "Podcast":
      if (style === "APA 7") {
        return `${authorStr} (${publishedDate || currentYear}). ${title} [Video/Audio]. ${publisher || ""}. ${url}`;
      }
      if (style === "MLA 9") {
        return `${authorStr}. "${title}." ${publisher || ""}, ${publishedDate || currentYear}, ${url}.`;
      }
      return `${authorStr} (${publishedDate || currentYear}) ${title}. ${publisher || ""}. ${url}`;

    default:
      return `${authorStr} (${currentYear}). ${title}. ${publisher || ""}.`;
  }
};

export const STYLES = ["APA 7", "MLA 9", "Chicago", "Harvard", "IEEE", "Vancouver"];
export const SOURCE_TYPES = ["Book", "Website", "Journal Article", "Newspaper", "Magazine", "YouTube Video", "Podcast", "Thesis", "Research Paper"];

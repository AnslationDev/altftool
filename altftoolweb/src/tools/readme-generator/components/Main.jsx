"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Copy, Check, Download, History, Trash2 } from "lucide-react";
import Hero from "../components/Hero";
import InputSection from "../components/InputSection";
import OutputSection from "../components/OutputSection";

const loadReadmeHistory = () => {
  if (typeof window === "undefined") return [];

  try {
    const savedHistory = localStorage.getItem("readme_history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch {
    return [];
  }
};

const loadSavedReadmeInput = () => {
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem("readme_data") || "";
  } catch {
    return "";
  }
};

export default function Main() {
  const [userInput, setUserInput] = useState(loadSavedReadmeInput);
  const [generatedReadme, setGeneratedReadme] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(loadReadmeHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("github");
  const [sectionsOrder, setSectionsOrder] = useState([]);
  const [reorderedReadme, setReorderedReadme] = useState("");
  const [isSectionMode, setIsSectionMode] = useState(false);


  // section toggle Builder 
  const [selectedSections, setSelectedSections] = useState({
  installation: true,
  usage: true,
  contributing: true,
  license: true,
});

  const saveToHistory = useCallback((input) => {
    setHistory((previousHistory) => {
      const newHistory = [
        { text: input, timestamp: new Date().toISOString() },
        ...previousHistory,
      ].slice(0, 5);
      localStorage.setItem("readme_history", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Clear History
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("readme_history");
  };
  // clear savedata
  const clearSavedData = () => {
    localStorage.removeItem("readme_data");
    setUserInput("");
  };

  // Autosave:
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (userInput.trim()) {
        localStorage.setItem("readme_data", userInput);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [userInput]);

  // generate Readme
  const generateReadme = useCallback(() => {
    if (!userInput.trim()) {
      alert("Please enter some text to generate README!");
      return;
    }

    saveToHistory(userInput);

    const lines = userInput.split("\n").filter((line) => line.trim());
    let readme = "";

    // Extract title (for "Project Title")
    const titleLine = lines[0] || "Project Title";
    readme += `# ${titleLine}\n\n`;

    // Check for overview/description
    const overviewKeywords = [
      "overview",
      "description",
      "about",
      "what is",
      "introduction",
    ];
    const overviewLines = lines.filter((line) =>
      overviewKeywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );
    if (overviewLines.length > 0 || lines.length > 1) {
      readme += `## Overview\n\n`;
      if (overviewLines.length > 0) {
        overviewLines.forEach((line) => {
          readme += `${line.replace(
            /^(overview|description|about|what is|introduction):?\s*/i,
            "",
          )}\n`;
        });
      } else {
        readme += `${lines.slice(1, 3).join("\n")}\n`;
      }
      readme += `\n`;
    }

    // Check for features
    const featureKeywords = [
      "feature",
      "features",
      "functionality",
      "capabilities",
    ];
    const featureLines = lines.filter(
      (line) =>
        featureKeywords.some((keyword) =>
          line.toLowerCase().includes(keyword),
        ) ||
        line.trim().startsWith("-") ||
        line.trim().startsWith("*"),
    );
    if (featureLines.length > 0) {
      readme += `## Features\n\n`;
      featureLines.forEach((line) => {
        const cleaned = line
          .replace(/^(feature|features|functionality|capabilities):?\s*/i, "")
          .trim();
        if (cleaned.startsWith("-") || cleaned.startsWith("*")) {
          readme += `${cleaned}\n`;
        } else {
          readme += `- ${cleaned}\n`;
        }
      });
      readme += `\n`;
    }

    // Check for tech stack
    const techKeywords = [
      "tech",
      "technology",
      "stack",
      "built with",
      "using",
      "framework",
      "library",
    ];
    const techLines = lines.filter((line) =>
      techKeywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );
    if (techLines.length > 0) {
      readme += `## Tech Stack\n\n`;
      techLines.forEach((line) => {
        const cleaned = line
          .replace(
            /^(tech|technology|stack|built with|using|framework|library):?\s*/i,
            "",
          )
          .trim();
        readme += `- ${cleaned}\n`;
      });
      readme += `\n`;
    }

    // Check for installation
    const installKeywords = [
      "install",
      "installation",
      "setup",
      "getting started",
    ];
    const installLines = lines.filter((line) =>
      installKeywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );
    if (installLines.length > 0 && selectedSections.installation) {
      readme += `## Installation\n\n`;
      readme += `\`\`\`bash\n`;
      installLines.forEach((line) => {
        const cleaned = line
          .replace(/^(install|installation|setup|getting started):?\s*/i, "")
          .trim();
        readme += `${cleaned}\n`;
      });
      readme += `\`\`\`\n\n`;
    }

    // Check for usage
    const usageKeywords = ["usage", "how to use", "run", "start", "execute"];
    const usageLines = lines.filter((line) =>
      usageKeywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );
    if (usageLines.length > 0 && selectedSections.usage) {
      readme += `## Usage\n\n`;
      usageLines.forEach((line) => {
        const cleaned = line
          .replace(/^(usage|how to use|run|start|execute):?\s*/i, "")
          .trim();
        readme += `${cleaned}\n\n`;
      });
    }

    // Check for API endpoints
    const apiKeywords = ["api", "endpoint", "route", "rest"];
    const apiLines = lines.filter((line) =>
      apiKeywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );
    if (apiLines.length > 0) {
      readme += `## API Endpoints\n\n`;
      apiLines.forEach((line) => {
        readme += `${line}\n`;
      });
      readme += `\n`;
    }

    // Check for folder structure
    const folderKeywords = [
      "folder",
      "structure",
      "directory",
      "file structure",
    ];
    const folderLines = lines.filter((line) =>
      folderKeywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );
    if (folderLines.length > 0) {
      readme += `## Folder Structure\n\n`;
      readme += `\`\`\`\n`;
      folderLines.forEach((line) => {
        const cleaned = line
          .replace(/^(folder|structure|directory|file structure):?\s*/i, "")
          .trim();
        readme += `${cleaned}\n`;
      });
      readme += `\`\`\`\n\n`;
    }

    // Check for contributing
    const contributingKeywords = [
      "contribut",
      "pull request",
      "pr",
      "contribution",
    ];
    if (
  lines.some((line) =>
    contributingKeywords.some((keyword) =>
      line.toLowerCase().includes(keyword)
    )
  ) &&
  selectedSections.contributing
)  {
      readme += `## Contributing\n\n`;
      readme += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
    }

    // Check for license
    const licenseKeywords = ["license", "mit", "apache", "gpl"];
    const licenseLines = lines.filter((line) =>
      licenseKeywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );
    if (licenseLines.length > 0 && selectedSections.license) {
      readme += `## License\n\n`;
      licenseLines.forEach((line) => {
        readme += `${line}\n`;
      });
    }
    // geneateReadme function
    const finalRaw =
      readme ||
      "# Project Title\n\nNo sufficient information to generate README. Please provide more details.";

    // original save
    setGeneratedReadme(finalRaw);

    // Extract sections safely
    const sectionsMap = {};

    const extract = (title) => {
      if (!finalRaw.includes(`## ${title}`)) return "";
      return finalRaw.split(`## ${title}`)[1]?.split("##")[0] || "";
    };

    sectionsMap["Overview"] = extract("Overview");
    sectionsMap["Features"] = extract("Features");
    sectionsMap["Tech Stack"] = extract("Tech Stack");
    sectionsMap["Installation"] = extract("Installation");
    sectionsMap["Usage"] = extract("Usage");
    sectionsMap["API Endpoints"] = extract("API Endpoints");
    sectionsMap["Folder Structure"] = extract("Folder Structure");
    sectionsMap["Contributing"] = extract("Contributing");
    sectionsMap["License"] = extract("License");

    const available = Object.keys(sectionsMap).filter((k) => sectionsMap[k]);

    setSectionsOrder(available);
    setReorderedReadme("");
  }, [saveToHistory, selectedSections, userInput]);


  const orderedReadme = useMemo(() => {
    if (!sectionsOrder.length || !generatedReadme) return;

    const extract = (title) => {
      if (!generatedReadme.includes(`## ${title}`)) return "";
      return generatedReadme.split(`## ${title}`)[1]?.split("##")[0] || "";
    };

    let final = generatedReadme.split(/(?=##)/)[0];

    sectionsOrder.forEach((section) => {
      const content = extract(section);
      if (content) {
        final += `## ${section}\n${content}\n\n`;
      }
    });

    return final;
  }, [sectionsOrder, generatedReadme]);

  const copyToClipboard = () => {
    const finalOutput = reorderedReadme || orderedReadme || generatedReadme;
    navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReadme = () => {
    const finalOutput = reorderedReadme || orderedReadme || generatedReadme;
    const blob = new Blob([finalOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

// for shorcuts
 useEffect(() => {
  const handleKeyDown = (e) => {

    // Ctrl + Enter
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      generateReadme();
    }

    // Ctrl + C (SAFE + FORCE)
    if (e.ctrlKey && (e.key === "c" || e.code === "KeyC")) {

      if (isPreviewMode && (generatedReadme || orderedReadme || reorderedReadme)) {

        e.preventDefault(); 

        const finalOutput = reorderedReadme || orderedReadme || generatedReadme;

        navigator.clipboard.writeText(finalOutput).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });

      }
    }
    }; window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [generateReadme, isPreviewMode, generatedReadme, orderedReadme, reorderedReadme]);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-(--foreground)">
      <Hero generatedReadme={reorderedReadme || orderedReadme || generatedReadme} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputSection
          userInput={userInput}
          setUserInput={setUserInput}
          generateReadme={generateReadme}
          setGeneratedReadme={setGeneratedReadme}
          history={history}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          clearHistory={clearHistory}
          isPreviewMode={isPreviewMode}
          clearSavedData={clearSavedData}
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
         
        />

        <OutputSection
          generatedReadme={generatedReadme}
          setGeneratedReadme={setGeneratedReadme}
          copyToClipboard={copyToClipboard}
          downloadReadme={downloadReadme}
          copied={copied}
          isPreviewMode={isPreviewMode}
          setIsPreviewMode={setIsPreviewMode}
          userInput={userInput}
          setUserInput={setUserInput}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          sectionsOrder={sectionsOrder}
          setSectionsOrder={setSectionsOrder}
          reorderedReadme={reorderedReadme || orderedReadme || ""}
          setReorderedReadme={setReorderedReadme}
          isSectionMode={isSectionMode}
          setIsSectionMode={setIsSectionMode}
        />
      </div>
    </main>
  );
}

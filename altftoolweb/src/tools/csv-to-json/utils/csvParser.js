

export const parseCSV = (csvText) => {
  try {
    if (typeof csvText !== "string") return [];

    const lines = csvText
      .trim()
      .split(/\r?\n/)   
      .filter(line => line.trim() !== "");

    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');

      // ⚠️ skip only if completely broken
      if (currentLine.length < headers.length) continue;

      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = currentLine[index]?.trim() || "";
      });

      data.push(entry);
    }

    return data;
  } catch (error) {
    console.error("CSV Parsing Error:", error);
    return [];
  }
};

export const convertToJson = (data) => {
  return JSON.stringify(data, null, 2);
};

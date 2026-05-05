import { useRef, useState } from "react";

/* ================= HELPERS ================= */
// (UNCHANGED — YOUR ORIGINAL CODE)
const parseCSV = (text) => {
  const lines = text.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || "").trim();
    });
    return obj;
  });
};

const cleanLeads = (rows) => {
  const seenEmails = new Set();
  const cleaned = [];
  let duplicates = 0;
  let invalid = 0;

  rows.forEach(r => {
    const name = r.Name?.trim();
    const email = r.Email?.trim().toLowerCase();
    const phone = r.Phone?.trim();
    const company = r.Company?.trim();

    if (!email) {
      invalid++;
      return;
    }

    if (seenEmails.has(email)) {
      duplicates++;
      return;
    }

    seenEmails.add(email);

    cleaned.push({
      Name: name || "",
      Email: email,
      Phone: phone || "",
      Company: company || ""
    });
  });

  return { cleaned, duplicates, invalid };
};

const downloadCSV = (data) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(r => Object.values(r).join(",")).join("\n");
  const csv = `${headers}\n${rows}`;

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cleaned_leads.csv";
  a.click();
};

/* ================= COMPONENT ================= */

export default function CsvLeadCleaner() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setFileName(f.name);
    setResult(null);
  };

  const handleProcess = () => {
    if (!file) {
      alert("Please choose a CSV file first");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      const cleanedResult = cleanLeads(rows);

      setResult({
        total: rows.length,
        ...cleanedResult
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">

      {/* Choose File */}
      <input
        type="file"
        accept=".csv"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => fileRef.current.click()}
        className="
          border-2 border-dashed border-(--border)
          bg-(--card)
          rounded-2xl h-40
          flex flex-col justify-center items-center
          cursor-pointer
          transition-all duration-300
          hover:border-(--primary)
          hover:bg-(--primary)/5
          text-center
          shadow-sm
        "
      >
        <p className="text-lg font-semibold text-(--primary)">
          Choose CSV File
        </p>
        <p className="text-sm text-(--muted-foreground) mt-2">
          {fileName}
        </p>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        className="
          w-full
          bg-(--primary)
          text-(--primary-foreground)
          py-3 rounded-xl
          font-semibold
          shadow-md hover:shadow-lg
          transition-all duration-300
          hover:opacity-90
        "
      >
        Process CSV
      </button>

      {/* RESULT SECTION */}
      {result && (
        <div className="space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Stat title="Total Rows" value={result.total} />
            <Stat title="Cleaned Rows" value={result.cleaned.length} />
            <Stat title="Duplicates Removed" value={result.duplicates} />
            <Stat title="Invalid Rows" value={result.invalid} />
          </div>

          {/* Preview Table */}
          <div className="
            border border-(--border)
            bg-(--card)
            rounded-2xl
            overflow-x-auto
            shadow-md
          ">
            <table className="min-w-full text-sm">
              <thead className="bg-(--muted)">
                <tr>
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Phone</th>
                  <th className="p-3 text-left font-semibold">Company</th>
                </tr>
              </thead>
              <tbody>
                {result.cleaned.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-(--border)">
                    <td className="p-3">{r.Name}</td>
                    <td className="p-3 text-(--primary)">{r.Email}</td>
                    <td className="p-3">{r.Phone}</td>
                    <td className="p-3">{r.Company || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Download */}
          <button
            onClick={() => downloadCSV(result.cleaned)}
            className="
              w-full
              bg-green-600
              text-white
              py-3 rounded-xl
              font-semibold
              shadow-md hover:shadow-lg
              transition-all duration-300
              hover:bg-green-700
            "
          >
            Download Cleaned CSV
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= STAT BOX ================= */

const Stat = ({ title, value }) => (
  <div className="
    bg-(--card)
    border border-(--border)
    rounded-xl
    p-5 text-center
    shadow-sm
  ">
    <p className="text-xs text-(--muted-foreground)">
      {title}
    </p>
    <p className="text-2xl font-bold mt-2 text-(--foreground)">
      {value}
    </p>
  </div>
);

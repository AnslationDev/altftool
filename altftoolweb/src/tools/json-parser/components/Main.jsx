import { useState } from "react";
import { Code, CheckCircle, AlertCircle, Copy, Check, Download, Trash2, Wand2 } from "lucide-react";
import Features from "./Features";

export default function Main(){
      const [jsonInput, setJsonInput] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState("tree"); // tree, raw, formatted

  const parseJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setParsedData(parsed);
      setError(null);
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setParsedData(parsed);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonInput(minified);
      setParsedData(parsed);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = () => {
    if (parsedData) {
      navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadJSON = () => {
    if (parsedData) {
      const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setJsonInput("");
    setParsedData(null);
    setError(null);
  };

  const loadSample = () => {
    const sampleJSON = {
      "name": "John Doe",
      "age": 30,
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001"
      },
      "hobbies": ["reading", "gaming", "coding"],
      "isActive": true,
      "balance": 1250.50
    };
    const formatted = JSON.stringify(sampleJSON, null, 2);
    setJsonInput(formatted);
    setParsedData(sampleJSON);
    setError(null);
  };

  const renderTreeView = (data, level = 0) => {
    if (data === null) return <span className="text-muted-foreground">null</span>;
    if (data === undefined) return <span className="text-muted-foreground">undefined</span>;
    
    const indent = level * 20;

    if (typeof data === "object" && !Array.isArray(data)) {
      return (
        <div style={{ marginLeft: `${indent}px` }}>
          {Object.entries(data).map(([key, value], index) => (
            <div key={index} className="my-1">
              <span className="text-blue-600 font-semibold">{key}</span>
              <span className="text-muted-foreground">: </span>
              {typeof value === "object" ? (
                renderTreeView(value, level + 1)
              ) : (
                <span className={
                  typeof value === "string" ? "text-green-600" :
                  typeof value === "number" ? "text-orange-600" :
                  typeof value === "boolean" ? "text-purple-600" :
                  "text-muted-foreground"
                }>
                  {typeof value === "string" ? `"${value}"` : String(value)}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(data)) {
      return (
        <div style={{ marginLeft: `${indent}px` }}>
          <span className="text-muted-foreground">[</span>
          {data.map((item, index) => (
            <div key={index} className="ml-4 my-1">
              <span className="text-muted-foreground">{index}: </span>
              {typeof item === "object" ? (
                renderTreeView(item, level + 1)
              ) : (
                <span className={
                  typeof item === "string" ? "text-green-600" :
                  typeof item === "number" ? "text-orange-600" :
                  typeof item === "boolean" ? "text-purple-600" :
                  "text-muted-foreground"
                }>
                  {typeof item === "string" ? `"${item}"` : String(item)}
                </span>
              )}
            </div>
          ))}
          <span className="text-muted-foreground">]</span>
        </div>
      );
    }

    return <span>{String(data)}</span>;
  };


    return(
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="heading mb-4 animate-fade-up">
            Parse & Validate
            <br />
            <span className="heaidng animate-fade-up">
              JSON Data
            </span>
          </h1>
          <p className="description mx-auto animate-fade-up">
            Format, validate, and visualize JSON with ease
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-background rounded-2xl shadow-lg border border-green-100 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={parseJSON}
              className="bg-(--primary) text-foreground font-semibold px-6 py-2 rounded-lg transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Parse JSON
            </button>
            {/* <button
              onClick={formatJSON}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Format
            </button> */}
            <button
              onClick={minifyJSON}
              className="bg-purple-100 cursor-pointer hover:bg-purple-200 text-purple-700 font-medium px-4 py-2 rounded-lg transition-all"
            >
              Minify
            </button>
            <button
              onClick={loadSample}
              className="bg-muted hover:bg-muted cursor-pointer text-foreground font-medium px-4 py-2 rounded-lg transition-all"
            >
              Sample
            </button>
            <button
              onClick={clearAll}
              className="bg-red-100 hover:bg-red-200 cursor-pointer text-red-700 font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            {parsedData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="bg-muted hover:bg-muted cursor-pointer text-foreground font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 ml-auto"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={downloadJSON}
                  className="bg-muted hover:bg-muted cursor-pointer text-foreground font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className=" rounded-2xl shadow-xl border border-(--border) p-6">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-green-600" />
              JSON Input
            </h3>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"name": "John", "age": 30}'
              className="w-full h-96 bg-(--card) border  border-(--border) text-foreground rounded-lg px-4 py-3 focus:outline-none  resize-none font-mono text-sm"
            />
          </div>

          {/* Output Section */}
          <div className=" rounded-2xl shadow-xl border border-(--border) p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                {error ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Error
                  </>
                ) : parsedData ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Parsed Output
                  </>
                ) : (
                  "Output"
                )}
              </h3>
              {parsedData && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setView("tree")}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      view === "tree" ? "bg-green-600 text-foreground" : "bg-(--card) text-foreground hover:bg-muted"
                    }`}
                  >
                    Tree
                  </button>
                  <button
                    onClick={() => setView("formatted")}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      view === "formatted" ? "bg-green-600 text-foreground" : "bg-muted text-foreground hover:bg-muted"
                    }`}
                  >
                    Formatted
                  </button>
                </div>
              )}
            </div>

            <div className="h-96 bg-(--card)  border border-(--border) rounded-lg p-4 overflow-auto">
              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-mono text-sm">{error}</p>
                </div>
              ) : parsedData ? (
                view === "tree" ? (
                  <div className="font-mono text-sm">
                    {renderTreeView(parsedData)}
                  </div>
                ) : (
                  <pre className="text-(--foreground) font-mono text-sm whitespace-pre-wrap">
                    {JSON.stringify(parsedData, null, 2)}
                  </pre>
                )
              ) : (
                <div className="flex flex-col  items-center justify-center h-full text-center rounded-xl">
                  <Code className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-muted-foreground">Enter JSON and click "Parse JSON"</p>
                </div>
              )}
            </div>
          </div>  
        </div>
   <Features/>
        {/* Info Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-background rounded-xl border border-green-100 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Validation</h3>
            <p className="text-sm text-muted-foreground">Instantly validate JSON syntax and structure</p>
          </div>
          <div className="bg-background rounded-xl border border-green-100 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Formatting</h3>
            <p className="text-sm text-muted-foreground">Beautify or minify JSON with one click</p>
          </div>
          <div className="bg-background rounded-xl border border-green-100 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Tree View</h3>
            <p className="text-sm text-muted-foreground">Visualize JSON in an easy-to-read tree structure</p>
          </div>
        </div> */}
      </main>
    )
}
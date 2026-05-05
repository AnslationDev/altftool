import { AlertCircle } from "lucide-react";

export default function InputTab({ jsonInput, setJsonInput, error, loadExample, generateSwagger }) {
  return (
    <div>
      <div className="mb-6">

        {/* Action buttons — Load Example and Generate Swagger */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 mt-2">
          <button
            onClick={loadExample}
            className="w-full sm:w-auto px-4 py-2 bg-[var(--muted)] hover:bg-[var(--card)] 
            text-[var(--foreground)] border border-[var(--border)]
            rounded-lg transition-colors font-medium cursor-pointer"
          >
            Load Example
          </button>
          <button
            onClick={generateSwagger}
            className="w-full sm:w-auto px-6 py-2 bg-[var(--primary)] hover:opacity-90 
            text-[var(--primary-foreground)] rounded-lg transition-colors 
            font-medium shadow-md cursor-pointer"
          >
            Generate Swagger Docs
          </button>
        </div>

        {/* Error box — only visible when JSON parsing fails */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 
          dark:border-red-800 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 dark:text-red-300 font-semibold">
                Error parsing JSON:
              </p>
              <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* JSON format guide box — shows expected input structure */}
        <div className="bg-[var(--muted)] rounded-lg p-3 sm:p-4 mb-4 border border-[var(--border)]">
          <h3 className="font-semibold text-[var(--foreground)] mb-2">
            JSON Format:
          </h3>

          <pre className="text-xs sm:text-sm  text-[var(--muted-foreground)] overflow-x-auto whitespace-pre-wrap break-words max-w-full w-0 min-w-full">
            {`{
  "title": "API Name",
  "version": "1.0.0",
  "description": "API Description",
  "baseUrl": "https://api.example.com",
  "endpoints": [
    {
      "path": "/resource",
      "method": "GET",
      "summary": "Brief summary",
      "description": "Detailed description",
      "status": "stable",
      "version": "v1",
      "latency": "fast",
      "parameters": [...],
      "responses": {...}
    }
  ]
}`}
          </pre>
        </div>
      </div>

      {/* JSON input textarea — user pastes their API spec here */}
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste your JSON here..."
        className="w-full max-w-full h-52 sm:h-64 p-3 sm:p-4
        bg-[var(--background)] text-[var(--foreground)]
        border-2 border-[var(--border)] rounded-lg
        focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20
        outline-none font-mono text-sm resize-none
        placeholder:text-[var(--muted-foreground)] transition-colors"
      />
    </div>
  );
}
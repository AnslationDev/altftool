import { RefreshCw } from "lucide-react";

export default function HealthLoadingState() {
  return (
    <div className="border border-gray-200 bg-white p-6 shadow-sm rounded-md">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-gray-100 text-gray-700">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-950">Loading health snapshot...</p>
            <p className="mt-2 text-sm text-gray-500">Checking tools, SEO, content data, and validation coverage.</p>
          </div>
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-2xl xl:grid-cols-4">
          {["Registry", "Firebase", "Routes", "Deploy"].map((item) => (
            <div key={item} className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-6 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-2 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

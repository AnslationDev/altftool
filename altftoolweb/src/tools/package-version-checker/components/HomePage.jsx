"use client";
import React, { useState, useCallback } from "react";
import { Search, Package, Zap, Shield, Globe, User, Clock } from "lucide-react";
import { fetchWithRetry } from "../utils/fetchWithRetry";
export default function HomePage() {
  const [packageName, setPackageName] = useState("react");
  const [packageInfo, setPackageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkPackageVersion = useCallback(
    async (e) => {
      e.preventDefault();
      if (!packageName.trim()) {
        setError("Please enter a package name.");
        setPackageInfo(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setPackageInfo(null);

      try {
        const encodedPkg = encodeURIComponent(packageName.toLowerCase().trim());
        const url = `https://registry.npmjs.org/${encodedPkg}`;
        const data = await fetchWithRetry(url);

        const latestVersion = data["dist-tags"]?.latest;
        if (!latestVersion) {
          setError('Could not find the "latest" version of this package.');
          return;
        }

        const latestMetadata = data.versions[latestVersion];

        const info = {
          version: latestVersion,
          description:
            data.description ||
            latestMetadata.description ||
            "No description provided.",
          homepage: latestMetadata.homepage || data.homepage,
          lastUpdated: data.time?.modified
            ? new Date(data.time.modified).toLocaleDateString()
            : "N/A",
          author: latestMetadata.author?.name || data.author?.name || "N/A",
        };

        setPackageInfo(info);
      } catch (err) {
        setError(err.message || "Unexpected error.");
      } finally {
        setIsLoading(false);
      }
    },
    [packageName],
  );

  const hasResult = !!packageInfo;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-(--foreground)">
      {/* HERO SECTION */}
      <div className="text-center mb-12">
        {/* <div className="inline-block p-4 rounded-2xl bg-(--primary) shadow-md mb-6">
          <Search className="w-12 h-12 text-(--primary-foreground)" />
        </div> */}

        <h1 className="heading">NPM Version Checker</h1>

        <p className="description max-w-2xl mx-auto">
          Instantly discover the latest stable version of any NPM package.
        </p>
      </div>

      {/* SEARCH BOX */}
      <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
        <form onSubmit={checkPackageVersion} className="space-y-4">
          <label className="text-sm font-semibold text-(--foreground)">
            Package Name
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="react, lodash, @angular/core..."
              disabled={isLoading}
              className={`
                grow p-4 rounded-xl border border-(--border)
                bg-(--background) text-(--foreground)
                placeholder:text-(--muted-foreground)
                focus:ring-2 focus:ring-(--primary) outline-none
              `}
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`
                px-6 py-4 rounded-xl font-semibold shadow-md flex items-center justify-center 
                text-(--primary-foreground)
                transition-all
                ${
                  isLoading
                    ? "bg-(--primary)/60 cursor-not-allowed"
                    : "bg-(--primary) hover:opacity-90"
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-(--primary-foreground) border-t-transparent rounded-full animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Check Version
                </>
              )}
            </button>
          </div>
        </form>

        {/* ERRORS */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* RESULTS */}
        {hasResult && (
          <div className="mt-8 space-y-6">
            {/* Package header */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-(--muted) rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-(--foreground)" />
              </div>
              <span className="text-3xl font-bold text-(--foreground) break-all">
                {packageName}
              </span>
            </div>

            {/* Description */}
            <div className="bg-(--card) border border-(--border) p-6 rounded-xl shadow">
              <p className="text-(--muted-foreground) italic">
                {packageInfo.description}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Latest Version */}
              <div className="bg-(--muted) p-4 rounded-xl border border-(--border) text-center">
                <p className="text-xs font-semibold text-(--muted-foreground) uppercase mb-1">
                  Latest Version
                </p>
                <p className="text-xl font-bold text-(--foreground) font-mono">
                  {packageInfo.version}
                </p>
              </div>

              {/* Last Updated */}
              <div className="bg-(--card) p-4 rounded-xl border border-(--border) text-center">
                <p className="text-xs font-semibold text-(--muted-foreground) uppercase mb-1">
                  Last Updated
                </p>
                <p className="text-base font-bold text-(--foreground) flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1 text-(--muted-foreground)" />
                  {packageInfo.lastUpdated}
                </p>
              </div>

              {/* Author */}
              <div className="bg-(--card) p-4 rounded-xl border border-(--border) text-center">
                <p className="text-xs font-semibold text-(--muted-foreground) uppercase mb-1">
                  Author
                </p>
                <p className="text-base font-bold text-(--foreground) flex items-center justify-center">
                  <User className="w-4 h-4 mr-1 text-(--muted-foreground)" />
                  {packageInfo.author}
                </p>
              </div>
            </div>

            {packageInfo.homepage && (
              <div className="text-center pt-4">
                <a
                  href={packageInfo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    inline-flex items-center gap-2 px-6 py-3 rounded-lg
                    bg-(--primary) text-(--primary-foreground)
                    shadow hover:opacity-90 transition
                  `}
                >
                  <Globe className="w-5 h-5" />
                  Go to Documentation Site
                </a>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !hasResult && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-(--primary)/90 mx-auto mb-4" />
            <p className="text-(--muted-foreground)">
              Enter a package name above to get started
            </p>
          </div>
        )}
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
        <Feature
          icon={<Zap className="text-blue-600" />}
          bg="bg-blue-100"
          title="Lightning Fast"
          desc="Get results in milliseconds with our optimized API calls."
        />
        <Feature
          icon={<Shield className="text-purple-600" />}
          bg="bg-purple-100"
          title="Reliable"
          desc="Built-in retry logic ensures you always get accurate data."
        />
        <Feature
          icon={<Package className="text-green-600" />}
          bg="bg-green-100"
          title="Complete Coverage"
          desc="Search any package from the entire NPM registry."
        />
      </div>
    </div>
  );
}

/*** SMALL HELPER COMPONENT FOR FEATURES ***/
function Feature({ icon, title, desc, bg }) {
  return (
    <div className="bg-(--card) p-6 rounded-xl shadow border border-(--border) text-center">
      <div
        className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mx-auto mb-4`}
      >
        <span className="text-(--foreground)">{icon} </span>
      </div>
      <h3 className="font-semibold text-(--foreground) mb-2">{title}</h3>
      <p className="text-sm text-(--muted-foreground)">{desc}</p>
    </div>
  );
}

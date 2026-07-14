"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Github,
  GitFork,
  Star,
  Users,
  Folder,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Twitter,
  Building,
  BookOpen,
  Info,
  ExternalLink,
  Sliders,
} from "lucide-react";

// Predefined colors for languages
const LANGUAGE_COLORS = {
  javascript: "#F1E05A",
  typescript: "#3178C6",
  python: "#3572A5",
  java: "#B07219",
  html: "#E34C26",
  css: "#563D7C",
  c: "#555555",
  "c++": "#F34B7D",
  "c#": "#178600",
  ruby: "#701516",
  go: "#00ADD8",
  php: "#4F5D95",
  rust: "#DEA584",
  shell: "#89E051",
  swift: "#F05138",
  kotlin: "#A97BFF",
  dart: "#00B4AB",
};

export default function MainComponent() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchExamples = ["vercel", "gaearon", "torvalds", "facebook"];

  // Run search
  const fetchGitHubProfile = async (searchName) => {
    if (!searchName || searchName.trim() === "") return;
    setIsLoading(true);
    setError("");
    setSuccess("");
    setUserData(null);
    setRepos([]);
    setLanguages([]);

    try {
      // 1. Fetch user profile data
      const userRes = await fetch(`https://api.github.com/users/${searchName}`);
      if (userRes.status === 404) {
        setError(`GitHub user "${searchName}" not found. Please verify the username and try again.`);
        setIsLoading(false);
        return;
      }
      if (!userRes.ok) {
        if (userRes.status === 403) {
          setError("GitHub API rate limit exceeded. Please wait a few minutes before searching again.");
        } else {
          setError("Failed to fetch profile details. Please try again later.");
        }
        setIsLoading(false);
        return;
      }
      const uData = await userRes.json();

      // 2. Fetch user repositories (limit to 30)
      const reposRes = await fetch(
        `https://api.github.com/users/${searchName}/repos?sort=updated&per_page=30`
      );
      let repoList = [];
      if (reposRes.ok) {
        const rawJson = await reposRes.json();
        if (Array.isArray(rawJson)) {
          repoList = rawJson;
        }
      }

      // Calculate languages distribution
      const langCounts = {};
      let totalLangs = 0;
      repoList.forEach((r) => {
        if (r && r.language) {
          const lang = String(r.language).toLowerCase();
          langCounts[lang] = (langCounts[lang] || 0) + 1;
          totalLangs++;
        }
      });

      const parsedLangs = Object.keys(langCounts)
        .map((l) => ({
          name: l,
          count: langCounts[l],
          percentage: totalLangs > 0 ? Math.round((langCounts[l] / totalLangs) * 100) : 0,
          color: LANGUAGE_COLORS[l] || "#94A3B8",
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Sort repositories by stars/forks to show top 8
      const topRepos = repoList
        .sort((a, b) => {
          const scoreB = (b?.stargazers_count || 0) + (b?.forks_count || 0);
          const scoreA = (a?.stargazers_count || 0) + (a?.forks_count || 0);
          return scoreB - scoreA;
        })
        .slice(0, 8);

      setUserData(uData);
      setRepos(topRepos);
      setLanguages(parsedLangs);
      setSuccess("GitHub profile details loaded successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGitHubProfile(username);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Github className="h-8 w-8 text-teal-500 shrink-0" /> GitHub Profile Finder
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Instantly fetch stats, public repos, language distributions, and star counts for any developer or organization.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar Section */}
      <div className="bg-(--surface) rounded-xl border border-(--border) p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g. gaearon)..."
              className="w-full pl-10 pr-4 py-3 bg-(--page) border border-(--border) text-(--foreground) text-sm rounded-lg outline-none focus:border-teal-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow transition-all cursor-pointer active:scale-98"
          >
            Find Profile
          </button>
        </form>

        {/* Example Tags */}
        <div className="flex flex-wrap gap-2 justify-center items-center text-xs">
          <span className="text-slate-500 font-semibold">Try searching:</span>
          {searchExamples.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setUsername(ex);
                fetchGitHubProfile(ex);
              }}
              className="px-2.5 py-1 bg-(--page) border border-(--border) hover:border-teal-500 rounded text-teal-600 dark:text-teal-400 font-semibold transition-colors cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Shimmer Loading Skeleton */}
      {isLoading && (
        <div className="mt-8 space-y-6 animate-pulse">
          <div className="bg-(--surface) rounded-xl border border-(--border) p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-24 h-24 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
              <div className="flex-1 space-y-3 w-full">
                <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Dashboard */}
      {userData && !isLoading && (
        <div className="mt-8 space-y-8 animate-fade-in">
          
          {/* Main User Card */}
          <div className="bg-(--surface) rounded-xl border border-(--border) p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              
              {/* Avatar Image */}
              <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-teal-500 shadow-md">
                  <img
                    src={userData.avatar_url}
                    alt={`${userData.login} avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <a
                  href={userData.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  View on GitHub <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Bio Details */}
              <div className="flex-1 space-y-4 w-full text-center md:text-left">
                <div>
                  <h2 className="text-2xl font-extrabold text-(--foreground)">{userData.name || userData.login}</h2>
                  <p className="text-sm font-semibold text-slate-500">@{userData.login}</p>
                </div>

                {userData.bio && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">{userData.bio}</p>
                )}

                {/* Info Badges Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-(--border)">
                  {userData.company && (
                    <div className="flex items-center gap-1.5 justify-center md:justify-start">
                      <Building className="h-4 w-4 text-teal-500 shrink-0" />
                      <span className="truncate">{userData.company}</span>
                    </div>
                  )}
                  {userData.location && (
                    <div className="flex items-center gap-1.5 justify-center md:justify-start">
                      <MapPin className="h-4 w-4 text-teal-500 shrink-0" />
                      <span className="truncate">{userData.location}</span>
                    </div>
                  )}
                  {userData.blog && (
                    <div className="flex items-center gap-1.5 justify-center md:justify-start">
                      <LinkIcon className="h-4 w-4 text-teal-500 shrink-0" />
                      <a
                        href={userData.blog.startsWith("http") ? userData.blog : `https://${userData.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:underline text-teal-600 dark:text-teal-400"
                      >
                        {userData.blog}
                      </a>
                    </div>
                  )}
                  {userData.twitter_username && (
                    <div className="flex items-center gap-1.5 justify-center md:justify-start">
                      <Twitter className="h-4 w-4 text-teal-500 shrink-0" />
                      <span className="truncate">@{userData.twitter_username}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Calendar className="h-4 w-4 text-teal-500 shrink-0" />
                    <span>Joined: {new Date(userData.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Stats Metrics Dashboard Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Public Repos</span>
              <div className="flex items-center justify-center gap-1.5">
                <Folder className="h-4 w-4 text-teal-500" />
                <span className="text-xl font-extrabold text-(--foreground)">{userData.public_repos}</span>
              </div>
            </div>
            <div className="bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Followers</span>
              <div className="flex items-center justify-center gap-1.5">
                <Users className="h-4 w-4 text-teal-500" />
                <span className="text-xl font-extrabold text-(--foreground)">{userData.followers}</span>
              </div>
            </div>
            <div className="bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Following</span>
              <div className="flex items-center justify-center gap-1.5">
                <Users className="h-4 w-4 text-teal-500" />
                <span className="text-xl font-extrabold text-(--foreground)">{userData.following}</span>
              </div>
            </div>
            <div className="bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Public Gists</span>
              <div className="flex items-center justify-center gap-1.5">
                <BookOpen className="h-4 w-4 text-teal-500" />
                <span className="text-xl font-extrabold text-(--foreground)">{userData.public_gists}</span>
              </div>
            </div>
          </div>

          {/* Language Breakdown Section (progress bars) */}
          {languages.length > 0 && (
            <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
                <Sliders className="h-4.5 w-4.5 text-teal-500" /> Code Language Distributions
              </h3>
              
              {/* Stacked Percentage Bar */}
              <div className="w-full bg-(--border) h-3.5 rounded-full overflow-hidden flex">
                {languages.map((l) => (
                  <div
                    key={l.name}
                    style={{ width: `${l.percentage}%`, backgroundColor: l.color }}
                    title={`${l.name.toUpperCase()}: ${l.percentage}%`}
                  ></div>
                ))}
              </div>

              {/* Languages percentage tags */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {languages.map((l) => (
                  <div key={l.name} className="flex items-center gap-2 p-2 bg-(--page) border border-(--border) rounded-lg">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }}></span>
                    <div className="truncate text-xs font-bold">
                      <span className="text-(--foreground) uppercase mr-1">{l.name}</span>
                      <span className="text-slate-500">{l.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Repos Showcase */}
          {repos.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
                <Folder className="h-4.5 w-4.5 text-teal-500" /> Popular Repositories
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {repos.map((r) => (
                  <div
                    key={r.id}
                    className="bg-(--surface) border border-(--border) hover:border-teal-500/40 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <a
                          href={r.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-(--foreground) hover:text-teal-600 dark:hover:text-teal-400 hover:underline truncate max-w-[240px]"
                        >
                          {r.name}
                        </a>
                        {r.private ? (
                          <span className="px-2 py-0.5 border border-(--border) rounded text-[10px] uppercase text-slate-500 font-bold bg-(--page)">Private</span>
                        ) : (
                          <span className="px-2 py-0.5 border border-(--border) rounded text-[10px] uppercase text-slate-500 font-bold bg-(--page)">Public</span>
                        )}
                      </div>

                      {r.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                          {r.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-(--border) text-[11px] text-slate-500 font-semibold">
                      {/* Language tag */}
                      {r.language && (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: LANGUAGE_COLORS[r.language.toLowerCase()] || "#94A3B8" }}
                          ></span>
                          <span>{r.language}</span>
                        </span>
                      )}

                      {/* Stars & forks */}
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500" /> {r.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="h-3.5 w-3.5 text-teal-500" /> {r.forks_count}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

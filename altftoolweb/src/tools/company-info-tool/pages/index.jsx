"use client";

import { useState } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Building2,
  Search,
  Globe,
  ExternalLink,
  Loader2
} from "lucide-react";

const CompanyInfoTool = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const safeValue = (value) => {
    if (value === null || value === void 0) return "N/A";
    if (typeof value === "string" || typeof value === "number") return value;
    return JSON.stringify(value, null, 2);
  };
  const searchCompany = async () => {
    if (!companyName.trim()) {
      setError("Please enter a company name!");
      return;
    }
    setLoading(true);
    setError("");
    setCompanyInfo(null);
    try {
      const query = encodeURIComponent(companyName);
      const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://api.duckduckgo.com/?q=${query}&format=json&no_html=1&skip_disambig=1`
      )}`;
      const response = await fetch(apiUrl);
      const proxyData = await response.json();
      const data = JSON.parse(proxyData.contents);
      const info = {
        name: data.Heading || companyName,
        description: data.AbstractText || data.Abstract || "No description available",
        source: data.AbstractSource || "Unknown",
        url: data.AbstractURL || "",
        image: data.Image || "",
        relatedTopics: [],
        infobox: null
      };
      if (Array.isArray(data.RelatedTopics)) {
        info.relatedTopics = data.RelatedTopics.flatMap((item) => {
          if (item.Text) return [item];
          if (item.Topics) return item.Topics;
          return [];
        });
      }
      if (data.Infobox && Array.isArray(data.Infobox.content)) {
        info.infobox = {
          content: data.Infobox.content.map((i) => ({
            label: i.label || "Info",
            value: i.value
          }))
        };
      }
      setCompanyInfo(info);
    } catch (err) {
      setError("Failed to fetch company information. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchCompany();
    }
  };
  return <div className="space-y-6">
      {
    /* Description Card */
  }
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <h2 className="text-xl font-semibold text-(--foreground) mb-2">Company Info Finder</h2>
        <p className="text-(--muted-foreground)">
          Search for any company and get detailed information instantly.
        </p>
      </Card>

      {
    /* Search Section */
  }
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary " />
            <h3 className="text-lg font-semibold text-(--foreground)">Search Company</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
           <div
    className="
    flex-1
    rounded-md
    border-2
    border-black
    dark:border-white

    focus-within:border-black
    dark:focus-within:border-white
  "
  >
  <Input
    type="text"
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
    onKeyDown={handleKeyPress}
    placeholder="Enter company name (e.g., Google)"
    className="
      border-0
      bg-transparent
      focus-visible:ring-0
      focus-visible:ring-offset-0
      focus:ring-0
    "
  />
</div>

            <Button
    onClick={searchCompany}
    disabled={loading}
    className="gap-2"
  >
              {loading ? <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </> : <>
                  <Search className="w-4 h-4" />
                  Search
                </>}
            </Button>
          </div>

          {
    /* <div className="flex items-center gap-2 text-sm text-(--muted-foreground)">
      <Info className="w-4 h-4" />
      <span>Powered by DuckDuckGo API</span>
    </div> */
  }
        </div>
      </Card>

      {
    /* Error */
  }
      {error && <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-700 font-medium">{error}</p>
        </Card>}

      {
    /* Result */
  }
      {companyInfo && !loading && <div className="space-y-6">
          {
    /* Main Card */
  }
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-(--foreground) mb-4">{companyInfo.name}</h2>
            <p className="text-(--muted-foreground) mb-4">{companyInfo.description}</p>

            {companyInfo.source && <p className="text-sm text-(--muted-foreground) flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Source: {companyInfo.source}
              </p>}

            {companyInfo.url && <a
    href={companyInfo.url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 mt-4 rounded-lg hover:bg-primary/90 transition-colors"
  >
                Learn More
                <ExternalLink className="w-4 h-4" />
              </a>}
          </Card>

          {
    /* Infobox */
  }
          {companyInfo.infobox?.content?.length > 0 && <Card className="p-6">
              <h3 className="text-xl font-semibold text-(--foreground) mb-6">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyInfo.infobox.content.map((item, index) => <div key={index} className="bg-(--muted) rounded-lg p-4">
                    <p className="font-semibold text-(--foreground)">{item.label}</p>
                    <p className="text-(--muted-foreground) whitespace-pre-wrap">{safeValue(item.value)}</p>
                  </div>)}
              </div>
            </Card>}

          {
    /* Related Topics */
  }
          {companyInfo.relatedTopics.length > 0 && <Card className="p-6">
              <h3 className="text-xl font-semibold text-(--foreground) mb-6">Related Information</h3>
              <div className="space-y-4">
                {companyInfo.relatedTopics.map((t, i) => "Text" in t && <div key={i} className="bg-(--muted) rounded-lg p-4">
                      <p className="text-(--foreground)">{t.Text}</p>
                      {t.FirstURL && <a
    href={t.FirstURL}
    target="_blank"
    className="text-primary flex items-center gap-1 text-sm mt-2 hover:underline"
  >
                          Read more <ExternalLink className="w-3 h-3" />
                        </a>}
                    </div>)}
              </div>
            </Card>}
        </div>}

      {
    /* Empty State */
  }
      {!loading && !companyInfo && !error && <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-(--foreground) mb-2">No Results Yet</h3>
          <p className="text-(--muted-foreground)">Enter a company name and click search</p>
        </Card>}

      {
    /* Information Card */
  }
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-(--foreground) mb-3">About This Tool</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-1">Research</Badge>
              <p className="text-sm text-(--muted-foreground)">
                Get detailed information about any company including descriptions, related topics, and key details.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-1">Business</Badge>
              <p className="text-sm text-(--muted-foreground)">
                Perfect for market research, competitor analysis, and business intelligence gathering.
              </p>
            </div>
          </div>
        </div>
      </Card>


    </div>;
};
export default CompanyInfoTool;

import * as React from "react";
import { useState } from "react";

import {
    Camera,
    Download,
    Copy,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const API_KEY = '74c587';
const API_BASE = 'https://api.screenshotmachine.com';

function normalizeUrl(input) {
    try {
        let url = input.trim();
        if (!url) return null;
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        const parsed = new URL(url);
        return parsed.href;
    } catch {
        return null;
    }
}

function buildScreenshotUrl(url, format) {
    const normalized = normalizeUrl(url);
    if (!normalized) throw new Error('Invalid URL');

    const params = new URLSearchParams({
        key: API_KEY,
        url: normalized,
        dimension: '1024x768',
        format,
        cacheLimit: '0'
    });

    return `${API_BASE}?${params.toString()}`;
}

function generateFilename(url, format) {
    try {
        const domain = new URL(url).hostname.replace(/^www\./, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `screenshot-${domain}-${timestamp}.${format}`;
    } catch {
        return `screenshot-${Date.now()}.${format}`;
    }
}

async function downloadImage(url, filename) {
    const response = await fetch(url);
    const blob = await response.blob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ScreenshotTool = () => {
    const [url, setUrl] = useState('');
    const [format, setFormat] = useState('png');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleCapture = async () => {
        setError('');

        if (!url.trim()) {
            setError('Please enter a URL');
            return;
        }

        const normalized = normalizeUrl(url);
        if (!normalized) {
            setError('Please enter a valid URL');
            return;
        }

        setIsLoading(true);

        try {
            const screenshotUrl = buildScreenshotUrl(url, format);

            // Preload image
            const img = new Image();
            img.onload = () => {
                setScreenshot({
                    url: screenshotUrl,
                    originalUrl: normalized,
                    format
                });
                setIsLoading(false);
            };

            img.onerror = () => {
                setError('Failed to capture screenshot. Please try again.');
                setIsLoading(false);
            };

            img.src = screenshotUrl;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!screenshot) return;

        setDownloading(true);
        try {
            const filename = generateFilename(screenshot.originalUrl, screenshot.format);
            await downloadImage(screenshot.url, filename);
        } catch {
            setError('Failed to download screenshot. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const handleCopy = async () => {
        if (!screenshot) return;

        try {
            await copyToClipboard(screenshot.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError('Failed to copy URL. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-(--card) rounded-xl border border-(--border) shadow-sm overflow-hidden border-(--primary) bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="p-6 pb-4">
                    <h3 className="font-semibold text-lg leading-none tracking-tight flex items-center gap-2">
                        <Camera className="h-5 w-5 text-(--primary)" />
                        Screenshot Tool
                    </h3>
                    <p className="text-sm text-(--muted-foreground) mt-2">
                        Capture beautiful screenshots of any website instantly
                    </p>
                </div>
                <div className="p-6 pt-0">
                    <p className="text-sm text-(--muted-foreground)">
                        Enter any website URL and get high-quality screenshots in PNG, JPG, or GIF format.
                        Perfect for documentation, previews, and sharing.
                    </p>
                </div>
            </div>

            {/* Input Form - Enhanced visibility */}
            <div className="bg-(--card) rounded-xl border border-(--border) shadow-sm overflow-hidden border-2">
                <div className="p-6 pb-4">
                    <h3 className="font-semibold text-lg leading-none tracking-tight text-lg">Capture Screenshot</h3>
                    <p className="text-sm text-(--muted-foreground) mt-2">Enter a website URL to get started</p>
                </div>
                <div className="p-6 pt-0 space-y-5">
                    {/* URL Input with Clear Label */}
                    <div className="space-y-2.5">
                        <label htmlFor="url-input" className="text-sm font-semibold text-(--foreground) flex items-center gap-1.5">
                            <Camera className="h-4 w-4 text-(--primary)" />
                            Website URL
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="url-input"
                            type="text"
                            placeholder="e.g., google.com or https://example.com"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setError('');
                            }}
                            disabled={isLoading}
                            className="flex h-11 w-full rounded-md border-2 border-zinc-400 dark:border-zinc-500 bg-transparent px-3 py-2 text-base font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:border-(--primary) shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="text-xs text-(--muted-foreground)">
                            Enter any valid URL (protocol will be added automatically)
                        </p>
                    </div>

                    {/* Format and Capture Row */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <div className="space-y-2">
                            <label htmlFor="format-select" className="text-sm font-medium text-(--foreground)">
                                Image Format
                            </label>
                            <select
                                id="format-select"
                                value={format}
                                onChange={(e) => setFormat(e.target.value )}
                                disabled={isLoading}
                                className="flex h-11 px-4 w-full rounded-md border-2 border-zinc-400 dark:border-zinc-500 bg-(--background) text-(--foreground) font-medium ring-offset-background placeholder:text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:border-(--primary) shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="png">PNG (Best Quality)</option>
                                <option value="jpg">JPG (Smaller Size)</option>
                                <option value="gif">GIF (Animated)</option>
                            </select>
                        </div>

                        {/* Prominent Capture Button */}
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium text-(--foreground) opacity-0 pointer-events-none">Action</label>
                            <button
                                onClick={handleCapture}
                                disabled={isLoading || !url.trim()}
                                className="w-full inline-flex items-center justify-center rounded-md h-11 bg-(--primary) text-(--primary-foreground) hover:bg-(--primary)/90 font-bold text-base shadow-lg hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) disabled:opacity-100 disabled:bg-(--primary)/60"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                                        Capturing Screenshot...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="mr-2.5 h-5 w-5" />
                                        Capture Screenshot
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3.5 text-sm text-red-500 bg-red-500/10 border-2 border-red-500/20 rounded-md animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Screenshot Display */}
            {screenshot && !isLoading && (
                <div className="bg-(--card) rounded-xl border border-(--border) shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 pb-4">
                        <h3 className="font-semibold text-lg leading-none tracking-tight flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Your Screenshot
                        </h3>
                        <p className="text-sm text-(--muted-foreground) mt-2 break-all">{screenshot.originalUrl}</p>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        <div className="border-2 rounded-lg overflow-hidden bg-(--muted)">
                            <img
                                src={screenshot.url}
                                alt="Website screenshot"
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="flex-1 inline-flex items-center justify-center rounded-md h-11 bg-(--primary) text-(--primary-foreground) hover:bg-(--primary)/90 font-medium px-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) disabled:opacity-50"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Image
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleCopy}
                                className="flex-1 inline-flex items-center justify-center rounded-md h-11 border border-(--border) bg-transparent hover:bg-(--muted) hover:text-(--foreground) font-medium px-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) disabled:opacity-50"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy URL
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Features */}
            {!screenshot && !isLoading && (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-(--card) rounded-xl border border-(--border) shadow-sm overflow-hidden">
                        <div className="p-6 pb-4">
                            <h3 className="font-semibold text-lg leading-none tracking-tight text-base">⚡ Lightning Fast</h3>
                        </div>
                        <div className="p-6 pt-0">
                            <p className="text-sm text-(--muted-foreground)">
                                Capture screenshots in seconds with our optimized API
                            </p>
                        </div>
                    </div>

                    <div className="bg-(--card) rounded-xl border border-(--border) shadow-sm overflow-hidden">
                        <div className="p-6 pb-4">
                            <h3 className="font-semibold text-lg leading-none tracking-tight text-base">🎨 Multiple Formats</h3>
                        </div>
                        <div className="p-6 pt-0">
                            <p className="text-sm text-(--muted-foreground)">
                                Download in PNG, JPG, or GIF format based on your needs
                            </p>
                        </div>
                    </div>

                    <div className="bg-(--card) rounded-xl border border-(--border) shadow-sm overflow-hidden">
                        <div className="p-6 pb-4">
                            <h3 className="font-semibold text-lg leading-none tracking-tight text-base">📱 Responsive</h3>
                        </div>
                        <div className="p-6 pt-0">
                            <p className="text-sm text-(--muted-foreground)">
                                Works perfectly on desktop, tablet, and mobile devices
                            </p>
                        </div>
                    </div>

                    <div className="bg-(--card) rounded-xl border border-(--border) shadow-sm overflow-hidden">
                        <div className="p-6 pb-4">
                            <h3 className="font-semibold text-lg leading-none tracking-tight text-base">🔒 Secure</h3>
                        </div>
                        <div className="p-6 pt-0">
                            <p className="text-sm text-(--muted-foreground)">
                                Your data is safe - we do not store any screenshots
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ScreenshotTool;

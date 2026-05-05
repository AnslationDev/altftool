import React, { useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  Search,
  Copy,
  Share2,
  Smile,
  Image as ImageIcon,
  X,
  Check,
  Heart,
  Star,
  Trash2,
} from "lucide-react";
import Description from "../components/Description";

export default function ToolHome() {
  const [activeTab, setActiveTab] = useState("emoji");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const GIPHY_API_KEY = "GlVGYHkr3WSBnllca54iNt0yFbjz7L65";

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const savedRecent = JSON.parse(localStorage.getItem("recentEmojis") || "[]");
    setFavorites(savedFavorites);
    setRecentEmojis(savedRecent);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("recentEmojis", JSON.stringify(recentEmojis));
  }, [recentEmojis]);

  useEffect(() => {
    if (activeTab === "gif") {
      fetchGifs(searchTerm || "trending");
    }
  }, [activeTab, searchTerm]);

  const fetchGifs = async (query) => {
    setLoading(true);
    try {
      const endpoint =
        query === "trending"
          ? `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`
          : `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20`;

      const response = await fetch(endpoint);
      const data = await response.json();
      setGifs(data.data);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setSelectedEmoji(emojiObject.emoji);
    addToRecent(emojiObject.emoji);
    setShowPicker(false);
  };

  const addToRecent = (emoji) => {
    const updated = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 20);
    setRecentEmojis(updated);
  };

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedItem(content);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareContent = async (content) => {
    if (navigator.share) {
      try {
        await navigator.share({ text: content });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard(content);
    }
  };

  const toggleFavorite = (item) => {
    if (favorites.includes(item)) {
      setFavorites(favorites.filter((f) => f !== item));
    } else {
      setFavorites([...favorites, item]);
    }
  };

  const handleGifSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchGifs(searchTerm);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="text-center pt-8">
          <h1 className="heading text-center animate-fade-up">
            Emoji & GIF Picker
          </h1>
          <p className="description px-3 animate-fade-up">
            Express yourself with emojis and GIFs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 pt-5 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48">
          <button
            onClick={() => setActiveTab("emoji")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all border ${
              activeTab === "emoji"
                ? "bg-white shadow-md text-purple-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Smile className="w-4 h-4" />
            <span className="font-medium">Emojis</span>
          </button>

          <button
            onClick={() => setActiveTab("gif")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all border ${
              activeTab === "gif"
                ? "bg-white shadow-md text-pink-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span className="font-medium">GIFs</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === "emoji" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width="100%"
                height="400px"
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}

          {activeTab === "gif" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gifs.map((gif) => (
                <div
                  key={gif.id}
                  className="rounded-2xl shadow-lg overflow-hidden"
                >
                  <img
                    src={gif.images.fixed_height.url}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ✅ Description Section Added */}
      <Description />

      {/* Copy Notification */}
      {copiedItem && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-5 h-5" />
          <span className="font-medium">Copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
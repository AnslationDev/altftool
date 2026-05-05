import { permission } from "process";

const getTags = (name = "") => {
  name = name.toLowerCase();

  if (name.includes("music")) return ["Music", "Audio", "Playlists"];
  if (name.includes("chat") || name.includes("whatsapp"))
    return ["Messaging", "Chat", "Social"];
  if (name.includes("video") || name.includes("tiktok"))
    return ["Video", "Short Videos", "Trending"];
  if (name.includes("photo") || name.includes("instagram"))
    return ["Photos", "Social", "Stories"];
  if (name.includes("bank") || name.includes("finance"))
    return ["Finance", "Payments", "Banking"];

  return ["App", "Utility"];
};

export const demoApps = [
{
title: "Instagram",
snippet: "Photo & Video sharing app with Stories, Reels and messaging. Connect with friends and share your moments.",
link: "https://apps.apple.com/app/instagram/id389801252",
rating :4.6,
downloads : 1000000000,
popularityScore : 92,
},
{
title: "Spotify",
snippet: "Music streaming with playlists, podcasts & offline listening. Enjoy millions of songs and podcasts.",
link: "https://apps.apple.com/app/spotify-music/id324684580",
rating :4.5,
downloads : 500000000,
popularityScore : 88,
},
{
title: "Snapchat",
snippet: "Share short-lived snaps, chat and creative AR filters. Stay connected with friends through fun snaps.",
link: "https://apps.apple.com/app/snapchat/id447188370",
rating :4.4,
downloads : 800000000,
popularityScore : 85,
},
{
title: "TikTok",
snippet: "Create and discover short-form videos. Join millions of creators and trending challenges.",
link: "https://apps.apple.com/app/tiktok/id835599320",
rating :4.1,
downloads : 60000000,
popularityScore : 76,

},
{
title: "WhatsApp",
snippet: "Simple, reliable messaging and calling. Connect with family and friends for free.",
link: "https://apps.apple.com/app/whatsapp-messenger/id310633997",
rating :4.6,
downloads : 1000000000,
popularityScore : 96,
},
{
title: "Netflix",
snippet: "Watch movies, series, and documentaries. Stream unlimited entertainment on any device.",
link: "https://apps.apple.com/app/netflix/id363590051",
rating :4.5,
downloads : 700000000,
popularityScore : 92,
}
];

export const fetchApps = async (query) => {
const res = await fetch(
`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=12`

);
const data = await res.json();

return (data.results || []).map((app) => {
    const rating = app.averageUserRating || 4.5;
    const reviews = app.userRatingCount || 1000;

    

    const downloads = Math.floor(Math.random() * 1000000000);
    const score = Math.min(100, Math.round(rating * 20 + downloads / 100000000));

    const getSafetyScore = (rating) => {
  const base = (rating || 4) * 20; // convert to 100 scale
  const randomFactor = Math.floor(Math.random() * 10);
  return Math.min(100, Math.round(base + randomFactor));
};

    return{
        title: app.trackName,
        snippet: app.description,
        link: app.trackViewUrl,

androidLink:app.trackViewUrl,
        androidLink:`https://play.google.com/store/search?q=${encodeURIComponent(app.trackName)}&c=apps`,

        artworkUrl100: app.artworkUrl100,       //icon 
        rating: rating, 
        downloads : downloads,
        popularityScore : score,

    category:app.primaryGenreName || "General",

    safetyScore: getSafetyScore(rating),
    permissions : score > 80 ? "Low" : score > 60 ? "Medium" : "High",
    privacy : score > 75 ? "Good" : "Average",
    ads : score > 70 ? "Low" : "High",

    tags : getTags(app.trackName),

};
});
}

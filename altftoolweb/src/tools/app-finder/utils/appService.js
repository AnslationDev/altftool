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

export const fetchApps = async (query) => {
const res = await fetch(
`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=12`

);
const data = await res.json();

return (data.results || []).map((app) => {
    const rating = app.averageUserRating || 4.5;

    return{
        title: app.trackName,
        snippet: app.description,
        link: app.trackViewUrl,

        androidLink:`https://play.google.com/store/search?q=${encodeURIComponent(app.trackName)}&c=apps`,

        artworkUrl100: app.artworkUrl100,       //icon
        rating: rating,

    category:app.primaryGenreName || "General",

    tags : getTags(app.trackName),

};
});
}

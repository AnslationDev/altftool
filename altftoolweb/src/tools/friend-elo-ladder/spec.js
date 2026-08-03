// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "friend-elo-ladder",
  "title": "Friend ELO Ladder",
  "description": "Track a persistent Elo rating ladder for friendly matches.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "ratings",
      "label": "Starting ratings",
      "type": "textarea",
      "default": "Asha | 1200\nBen | 1200\nChirag | 1200"
    },
    {
      "key": "matches",
      "label": "Matches in order",
      "type": "textarea",
      "default": "Asha | Ben | 1\nChirag | Asha | 0.5\nBen | Chirag | 0",
      "hint": "Player A | Player B | A score (1 win, 0.5 draw, 0 loss)"
    },
    {
      "key": "k",
      "label": "K-factor",
      "type": "number",
      "default": 32,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Three matches",
      "values": {
        "ratings": "Asha | 1200\nBen | 1200\nChirag | 1200",
        "matches": "Asha | Ben | 1\nChirag | Asha | 0.5\nBen | Chirag | 0",
        "k": 32
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      // Ratings are keyed case-insensitively (lowercased name) so "Asha" and a
      // later "asha" typo resolve to the same ladder entry instead of forking
      // into two players; the first-seen casing is kept as the display name.
      const ratings = new Map();
      String(values.ratings || "").split(/\r?\n/).forEach((line) => {
        const [name, rating] = line.split("|").map((x) => x.trim());
        if (!name) return;
        const parsedRating = rating === undefined || rating === "" ? NaN : Number(rating);
        ratings.set(name.toLowerCase(), { name, rating: Number.isFinite(parsedRating) ? parsedRating : 1200 });
      });
      const resolvePlayer = (name) => {
        const key = name.toLowerCase();
        if (!ratings.has(key)) ratings.set(key, { name, rating: 1200 });
        return key;
      };
      const kNum = Number(values.k);
      const k = Math.max(1, Number.isFinite(kNum) ? kNum : 32);
      const history = [];
      const skipped = [];
      String(values.matches || "").split(/\r?\n/).forEach((line, index) => {
        const raw = line.trim();
        if (raw === "") return; // a genuinely blank line is not a malformed entry
        const [a, b, scoreRaw] = line.split("|").map((x) => x.trim());
        const scoreNum = scoreRaw === undefined || scoreRaw === "" ? NaN : Number(scoreRaw);
        const sameName = a && b && a.toLowerCase() === b.toLowerCase();
        if (!a || !b || sameName || !Number.isFinite(scoreNum)) {
          let reason = "missing a player name";
          if (sameName) reason = "the same player listed on both sides";
          else if (a && b) reason = "a missing or invalid score";
          skipped.push("Line " + (index + 1) + " skipped (" + reason + "): \"" + raw + "\"");
          return;
        }
        const score = Math.max(0, Math.min(1, scoreNum));
        const aKey = resolvePlayer(a), bKey = resolvePlayer(b);
        const pa = ratings.get(aKey), pb = ratings.get(bKey);
        const expected = 1 / (1 + Math.pow(10, (pb.rating - pa.rating) / 400));
        const newA = pa.rating + k * (score - expected);
        const newB = pb.rating + k * ((1 - score) - (1 - expected));
        pa.rating = newA;
        pb.rating = newB;
        history.push([index + 1, pa.name, pb.name, score, newA.toFixed(1), newB.toFixed(1)]);
      });
      const ladder = [...ratings.values()].sort((a, b) => b.rating - a.rating).map((entry, index) => [index + 1, entry.name, entry.rating.toFixed(1)]);
      const caption = "Current ladder leader · " + history.length + " match(es)" + (skipped.length ? ", " + skipped.length + " line" + (skipped.length === 1 ? "" : "s") + " skipped" : "");
      return {result:ladder[0]?.[1]||"No players",caption,table:{headers:["Rank","Player","Elo"],rows:ladder},list:[...history.map((x)=>"Match "+x[0]+": "+x[1]+" vs "+x[2]+" → "+x[4]+" / "+x[5]),...skipped]};
    },
};

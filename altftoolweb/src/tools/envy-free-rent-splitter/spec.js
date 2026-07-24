// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "envy-free-rent-splitter",
  "title": "Envy-Free Rent Splitter",
  "description": "Room preferences aur total rent se fair shares optimize kare.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "rent",
      "label": "Total rent",
      "type": "number",
      "default": 60000,
      "min": 0
    },
    {
      "key": "people",
      "label": "People",
      "type": "textarea",
      "default": "Asha\nBen\nChirag"
    },
    {
      "key": "rooms",
      "label": "Rooms and preference values",
      "type": "textarea",
      "default": "Large room | 50 | 30 | 20\nBalcony room | 30 | 45 | 25\nQuiet room | 20 | 25 | 55",
      "hint": "Room | value by person 1 | person 2 | … (each person’s values should total 100)"
    }
  ],
  "presets": [
    {
      "label": "Three people",
      "values": {
        "rent": 60000,
        "people": "Asha\nBen\nChirag",
        "rooms": "Large room | 50 | 30 | 20\nBalcony room | 30 | 45 | 25\nQuiet room | 20 | 25 | 55"
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const rent = Math.max(0, Number(values.rent) || 0), people = String(values.people || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      const rooms = String(values.rooms || "").split(/\r?\n/).map((line) => { const cells = line.split("|").map((x) => x.trim()); return { name: cells[0], scores: cells.slice(1).map(Number) }; }).filter((room) => room.name);
      if (!people.length || rooms.length !== people.length || rooms.some((room) => room.scores.length < people.length)) return { result: "—", caption: "Enter the same number of people and rooms with one score per person" };
      const permutations = (items) => items.length < 2 ? [items] : items.flatMap((item, index) => permutations(items.filter((_, i) => i !== index)).map((rest) => [item, ...rest]));
      const choices = permutations(rooms.map((_, index) => index));
      const best = choices.map((assignment) => { const utility = assignment.map((roomIndex, personIndex) => Number(rooms[roomIndex].scores[personIndex]) || 0); return { assignment, utility, min: Math.min(...utility), total: utility.reduce((a,b)=>a+b,0) }; }).sort((a,b)=>b.min-a.min || b.total-a.total)[0];
      const rawShares = best.utility.map((score) => score > 0 ? rent / score : rent), scale = rent / rawShares.reduce((a,b)=>a+b,0), shares = rawShares.map((share)=>share*scale);
      return { result: "Max-min preference assignment", caption: "Rent shares sum to " + shares.reduce((a,b)=>a+b,0).toFixed(2), table: { headers: ["Person","Room","Preference","Suggested share"], rows: people.map((person,index)=>[person, rooms[best.assignment[index]].name, best.utility[index], shares[index].toFixed(2)]) } };
    },
};

export default spec;

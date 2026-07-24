import path from "node:path";
import { fileURLToPath } from "node:url";
import backlog from "./new-tasks-backlog.json" with { type: "json" };
import { emitTool } from "./lib/spec.mjs";
import { validateRawSpec } from "./generator/validate.mjs";
import { qualityLint } from "./verify/quality.mjs";

const automationDir = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(automationDir, "..", "src", "tools");
const dryRun = process.argv.includes("--dry");
const bySlug = new Map(backlog.tools.map((entry) => [entry.slug, entry]));

const base = (slug, raw) => {
  const entry = bySlug.get(slug);
  if (!entry) throw new Error(`Missing backlog entry for ${slug}`);
  return {
    slug,
    title: entry.name,
    description: entry.description,
    badge: entry.category,
    category: ["Productivity", "Business"],
    icon: "users-round",
    iconColor: "text-primary",
    note:
      "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision.",
    ...raw,
  };
};

const specs = [
  base("envy-free-rent-splitter", {
    fields: [
      { key: "rent", label: "Total rent", type: "number", min: 0, default: 60000 },
      { key: "people", label: "People", type: "textarea", default: "Asha\nBen\nChirag" },
      { key: "rooms", label: "Rooms and preference values", type: "textarea", default: "Large room | 50 | 30 | 20\nBalcony room | 30 | 45 | 25\nQuiet room | 20 | 25 | 55", hint: "Room | value by person 1 | person 2 | … (each person’s values should total 100)" },
    ],
    presets: [{ label: "Three people", values: { rent: 60000, people: "Asha\nBen\nChirag", rooms: "Large room | 50 | 30 | 20\nBalcony room | 30 | 45 | 25\nQuiet room | 20 | 25 | 55" } }],
    compute: `(values) => {
      const rent = Math.max(0, Number(values.rent) || 0), people = String(values.people || "").split(/\\r?\\n/).map((x) => x.trim()).filter(Boolean);
      const rooms = String(values.rooms || "").split(/\\r?\\n/).map((line) => { const cells = line.split("|").map((x) => x.trim()); return { name: cells[0], scores: cells.slice(1).map(Number) }; }).filter((room) => room.name);
      if (!people.length || rooms.length !== people.length || rooms.some((room) => room.scores.length < people.length)) return { result: "—", caption: "Enter the same number of people and rooms with one score per person" };
      const permutations = (items) => items.length < 2 ? [items] : items.flatMap((item, index) => permutations(items.filter((_, i) => i !== index)).map((rest) => [item, ...rest]));
      const choices = permutations(rooms.map((_, index) => index));
      const best = choices.map((assignment) => { const utility = assignment.map((roomIndex, personIndex) => Number(rooms[roomIndex].scores[personIndex]) || 0); return { assignment, utility, min: Math.min(...utility), total: utility.reduce((a,b)=>a+b,0) }; }).sort((a,b)=>b.min-a.min || b.total-a.total)[0];
      const rawShares = best.utility.map((score) => score > 0 ? rent / score : rent), scale = rent / rawShares.reduce((a,b)=>a+b,0), shares = rawShares.map((share)=>share*scale);
      return { result: "Max-min preference assignment", caption: "Rent shares sum to " + shares.reduce((a,b)=>a+b,0).toFixed(2), table: { headers: ["Person","Room","Preference","Suggested share"], rows: people.map((person,index)=>[person, rooms[best.assignment[index]].name, best.utility[index], shares[index].toFixed(2)]) } };
    }`,
  }),
  base("snake-draft-board", {
    fields: [
      { key: "players", label: "Players in seed order", type: "textarea", default: "Asha\nBen\nChirag\nDia" },
      { key: "rounds", label: "Rounds", type: "number", min: 1, max: 50, default: 4 },
      { key: "picks", label: "Recorded selections", type: "textarea", default: "Asha | Item 1\nBen | Item 2", hint: "Player | selection" },
    ],
    presets: [{ label: "Four-player draft", values: { players: "Asha\nBen\nChirag\nDia", rounds: 4, picks: "Asha | Item 1\nBen | Item 2" } }],
    compute: `(values) => {
      const players = String(values.players || "").split(/\\r?\\n/).map((x)=>x.trim()).filter(Boolean), rounds = Math.max(1,Math.round(Number(values.rounds)||1));
      const recorded = String(values.picks || "").split(/\\r?\\n/).map((line)=>line.split("|").map((x)=>x.trim())).filter((row)=>row[0]);
      const order=[]; for(let round=1;round<=rounds;round+=1){ const list=round%2?players:[...players].reverse(); list.forEach((player)=>order.push([order.length+1,round,player,recorded[order.length]?.[1]||"Open",recorded[order.length]?.[0]&&recorded[order.length][0]!==player?"Player mismatch":"Ready"])); }
      return { result: order.length+" total draft slots", caption: recorded.length+" selection(s) entered", table:{headers:["Pick","Round","Player","Selection","Check"],rows:order} };
    }`,
  }),
  base("ranked-choice-vote-tabulator", {
    fields: [
      { key: "ballots", label: "Ranked ballots", type: "textarea", default: "A > B > C\nA > C > B\nB > C > A\nC > B > A\nC > A > B", hint: "One ballot per line, highest to lowest separated by >" },
      { key: "tie", label: "Tie-break order", type: "text", default: "A, B, C" },
    ],
    presets: [{ label: "Five ballots", values: { ballots: "A > B > C\nA > C > B\nB > C > A\nC > B > A\nC > A > B", tie: "A, B, C" } }],
    compute: `(values) => {
      const ballots=String(values.ballots||"").split(/\\r?\\n/).map((line)=>line.split(">").map((x)=>x.trim()).filter(Boolean)).filter((x)=>x.length), tie=String(values.tie||"").split(",").map((x)=>x.trim()), active=new Set(ballots.flat()), rounds=[];
      while(active.size>1){ const counts=new Map([...active].map((x)=>[x,0])); let valid=0; ballots.forEach((ballot)=>{const pick=ballot.find((x)=>active.has(x));if(pick){counts.set(pick,counts.get(pick)+1);valid+=1;}}); const sorted=[...counts].sort((a,b)=>b[1]-a[1]||tie.indexOf(a[0])-tie.indexOf(b[0])); const winner=sorted.find((x)=>x[1]>valid/2); rounds.push(...sorted.map((x)=>[rounds.filter((row)=>row[0]===rounds.length+1).length+1,x[0],x[1],valid?(x[1]/valid*100).toFixed(2)+"%":"0%"])); if(winner)return {result:winner[0]+" wins",caption:"Majority in round "+(new Set(rounds.map((r)=>r[0])).size),table:{headers:["Round","Candidate","Votes","Share"],rows:rounds}}; const low=Math.min(...sorted.map((x)=>x[1])), losers=sorted.filter((x)=>x[1]===low).sort((a,b)=>tie.indexOf(b[0])-tie.indexOf(a[0])); active.delete(losers[0][0]); rounds.push([new Set(rounds.map((r)=>r[0])).size,"Eliminated",losers[0][0],"—"]); }
      return {result:[...active][0]||"No winner",caption:ballots.length+" ballot(s)",table:{headers:["Round","Candidate","Votes","Share"],rows:rounds}};
    }`,
  }),
  base("condorcet-election-judge", {
    fields: [{ key: "ballots", label: "Ranked ballots", type: "textarea", default: "A > B > C\nA > C > B\nB > C > A\nC > B > A\nC > A > B" }],
    presets: [{ label: "Five ballots", values: { ballots: "A > B > C\nA > C > B\nB > C > A\nC > B > A\nC > A > B" } }],
    compute: `(values) => {
      const ballots=String(values.ballots||"").split(/\\r?\\n/).map((line)=>line.split(">").map((x)=>x.trim()).filter(Boolean)).filter((x)=>x.length), candidates=[...new Set(ballots.flat())], wins=new Map(candidates.map((x)=>[x,0])), rows=[];
      for(let i=0;i<candidates.length;i+=1)for(let j=i+1;j<candidates.length;j+=1){const a=candidates[i],b=candidates[j];let av=0,bv=0;ballots.forEach((vote)=>{const ai=vote.indexOf(a),bi=vote.indexOf(b);if(ai>=0&&(bi<0||ai<bi))av+=1;else if(bi>=0)bv+=1;});const winner=av>bv?a:bv>av?b:"Tie";if(winner!=="Tie")wins.set(winner,wins.get(winner)+1);rows.push([a,b,av,bv,winner]);}
      const needed=Math.max(0,candidates.length-1), winner=[...wins].find((x)=>x[1]===needed);
      return {result:winner?winner[0]+" is Condorcet winner":"No Condorcet winner (tie or cycle)",caption:candidates.length+" candidates · "+ballots.length+" ballots",table:{headers:["Candidate A","Candidate B","A preferred","B preferred","Pair winner"],rows}};
    }`,
  }),
  base("swiss-pairing-engine", {
    fields: [
      { key: "players", label: "Standings", type: "textarea", default: "Asha | 3 | Ben,Dia\nBen | 2 | Asha\nChirag | 2 | Dia\nDia | 1 | Asha,Chirag\nEli | 1 |\nFaye | 0 |", hint: "Player | score | previous opponents comma-separated" },
      { key: "round", label: "Round", type: "number", min: 1, default: 4 },
    ],
    presets: [{ label: "Six-player round", values: { players: "Asha | 3 | Ben,Dia\nBen | 2 | Asha\nChirag | 2 | Dia\nDia | 1 | Asha,Chirag\nEli | 1 |\nFaye | 0 |", round: 4 } }],
    compute: `(values) => {
      const players=String(values.players||"").split(/\\r?\\n/).map((line)=>{const [name,score,old]=line.split("|").map((x)=>x.trim());return {name,score:Number(score)||0,old:new Set(String(old||"").split(",").map((x)=>x.trim()).filter(Boolean))};}).filter((x)=>x.name).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)), rows=[], pool=[...players];
      while(pool.length>1){const a=pool.shift();let index=pool.findIndex((b)=>!a.old.has(b.name));if(index<0)index=0;const b=pool.splice(index,1)[0];rows.push([a.name,a.score,b.name,b.score,a.old.has(b.name)?"Rematch unavoidable":"No prior match"]);}if(pool.length)rows.push([pool[0].name,pool[0].score,"BYE","—","Unpaired"]);
      return {result:rows.length+" pairing(s) for round "+values.round,caption:"Score-adjacent greedy pairing",table:{headers:["Player A","Score","Player B","Score","Check"],rows}};
    }`,
  }),
  base("tournament-bracket-builder", {
    fields: [
      { key: "entrants", label: "Entrants in seed order", type: "textarea", default: "Asha\nBen\nChirag\nDia\nEli\nFaye" },
      { key: "format", label: "Format", type: "select", default: "single", choices: [{ value: "single", label: "Single elimination" }, { value: "double", label: "Double elimination outline" }] },
    ],
    presets: [{ label: "Six entrants", values: { entrants: "Asha\nBen\nChirag\nDia\nEli\nFaye", format: "single" } }],
    compute: `(values) => {
      const entrants=String(values.entrants||"").split(/\\r?\\n/).map((x)=>x.trim()).filter(Boolean), size=Math.pow(2,Math.ceil(Math.log2(Math.max(2,entrants.length)))), seeded=[...entrants,...Array(size-entrants.length).fill("BYE")], rows=[];
      for(let i=0;i<size/2;i+=1){const a=seeded[i],b=seeded[size-1-i];rows.push([1,i+1,a,b,a==="BYE"?b:b==="BYE"?a:"TBD"]);} const rounds=Math.log2(size); for(let r=2;r<=rounds;r+=1)for(let m=1;m<=size/Math.pow(2,r);m+=1)rows.push([r,m,"Winner R"+(r-1)+"M"+(m*2-1),"Winner R"+(r-1)+"M"+(m*2),"TBD"]); if(values.format==="double")rows.push(["L","Outline","Losers-bracket seeding","depends on results","Use live results"]);
      return {result:rounds+" winner-bracket round(s)",caption:(size-entrants.length)+" bye(s) · "+values.format+" format",table:{headers:["Round","Match","Side A","Side B","Advances"],rows}};
    }`,
  }),
  base("speed-date-rotation-planner", {
    fields: [
      { key: "participants", label: "Participants", type: "textarea", default: "Asha\nBen\nChirag\nDia\nEli\nFaye" },
      { key: "minutes", label: "Minutes per meeting", type: "number", min: 1, default: 5 },
      { key: "break_minutes", label: "Break between rounds", type: "number", min: 0, default: 1 },
    ],
    presets: [{ label: "Six participants", values: { participants: "Asha\nBen\nChirag\nDia\nEli\nFaye", minutes: 5, break_minutes: 1 } }],
    compute: `(values) => {
      let list=String(values.participants||"").split(/\\r?\\n/).map((x)=>x.trim()).filter(Boolean);if(list.length%2)list.push("BYE");const fixed=list[0], rotating=list.slice(1), rows=[], rounds=list.length-1;
      for(let round=0;round<rounds;round+=1){const current=[fixed,...rotating];for(let i=0;i<current.length/2;i+=1)rows.push([round+1,round*(Number(values.minutes)+Number(values.break_minutes))+" min",current[i],current[current.length-1-i],current[i]==="BYE"||current[current.length-1-i]==="BYE"?"Break":"Meet"]);rotating.unshift(rotating.pop());}
      return {result:rounds+" non-repeating round(s)",caption:(rounds*Number(values.minutes)+(rounds-1)*Number(values.break_minutes))+" minutes total",table:{headers:["Round","Starts","Participant A","Participant B","Type"],rows}};
    }`,
  }),
  base("group-veto-picker", {
    fields: [
      { key: "options", label: "Options", type: "textarea", default: "Movie A\nMovie B\nMovie C\nMovie D" },
      { key: "vetoes", label: "Member vetoes", type: "textarea", default: "Asha | Movie D\nBen | Movie A\nChirag | Movie D", hint: "Member | option, option" },
      { key: "max", label: "Vetoes allowed per member", type: "number", min: 0, default: 1 },
    ],
    presets: [{ label: "Four options", values: { options: "Movie A\nMovie B\nMovie C\nMovie D", vetoes: "Asha | Movie D\nBen | Movie A\nChirag | Movie D", max: 1 } }],
    compute: `(values) => {
      const options=String(values.options||"").split(/\\r?\\n/).map((x)=>x.trim()).filter(Boolean), max=Math.max(0,Math.round(Number(values.max)||0)), counts=new Map(options.map((x)=>[x,0])), rows=[];
      String(values.vetoes||"").split(/\\r?\\n/).forEach((line)=>{const [member,raw]=line.split("|").map((x)=>x.trim()), vetoes=String(raw||"").split(",").map((x)=>x.trim()).filter(Boolean);vetoes.slice(0,max).forEach((option)=>{if(counts.has(option))counts.set(option,counts.get(option)+1);});rows.push([member,vetoes.slice(0,max).join(", ")||"None",Math.max(0,vetoes.length-max)]);});
      const ranked=[...counts].sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0])), minimum=ranked[0]?.[1];
      return {result:ranked.filter((x)=>x[1]===minimum).map((x)=>x[0]).join(", ")||"No options",caption:"Fewest vetoes: "+(minimum??0),rows:[["Options",options.length],["Member rows",rows.length]],table:{headers:["Option","Veto count","Status"],rows:ranked.map((x)=>[x[0],x[1],x[1]===minimum?"Finalist":"Narrowed out"])}};
    }`,
  }),
  base("potluck-dish-assigner", {
    fields: [
      { key: "people", label: "People and dietary needs", type: "textarea", default: "Asha | vegetarian\nBen | nut-free\nChirag | vegan\nDia | none", hint: "Person | dietary tags" },
      { key: "courses", label: "Needed courses", type: "text", default: "starter, main, side, dessert" },
      { key: "offers", label: "Dish offers", type: "textarea", default: "Asha | lentil salad | starter | vegan,nut-free\nBen | rice bake | main | vegetarian,nut-free\nChirag | fruit tart | dessert | vegan,nut-free\nDia | roasted vegetables | side | vegan,nut-free", hint: "Person | dish | course | dietary tags" },
    ],
    presets: [{ label: "Balanced potluck", values: { people: "Asha | vegetarian\nBen | nut-free\nChirag | vegan\nDia | none", courses: "starter, main, side, dessert", offers: "Asha | lentil salad | starter | vegan,nut-free\nBen | rice bake | main | vegetarian,nut-free\nChirag | fruit tart | dessert | vegan,nut-free\nDia | roasted vegetables | side | vegan,nut-free" } }],
    note: "Planning aid only. Confirm ingredients, allergens, cross-contact, preparation, storage, transport, labelling, and individual medical needs directly with attendees.",
    compute: `(values) => {
      const needs=String(values.people||"").split(/\\r?\\n/).flatMap((line)=>String(line.split("|")[1]||"").split(",")).map((x)=>x.trim()).filter((x)=>x&&x!=="none"), required=[...new Set(String(values.courses||"").split(",").map((x)=>x.trim()).filter(Boolean))], rows=String(values.offers||"").split(/\\r?\\n/).map((line)=>line.split("|").map((x)=>x.trim())).filter((x)=>x[0]);
      const table=rows.map((row)=>{const tags=String(row[3]||"").split(",").map((x)=>x.trim()), missing=[...new Set(needs)].filter((need)=>!tags.includes(need));return [row[0],row[1],row[2],tags.join(", ")||"Unlabelled",missing.join(", ")||"Covers entered tags"];}), courses=new Set(rows.map((x)=>x[2]));
      return {result:required.every((x)=>courses.has(x))?"All entered courses covered":"Course gaps: "+required.filter((x)=>!courses.has(x)).join(", "),caption:rows.length+" dish offer(s)",table:{headers:["Person","Dish","Course","Tags","Dietary review"],rows:table}};
    }`,
  }),
  base("adjusted-winner-splitter", {
    fields: [
      { key: "items", label: "Items and point allocations", type: "textarea", default: "Car | 40 | 20\nSavings | 30 | 50\nFurniture | 20 | 20\nArt | 10 | 10", hint: "Item | Person A points | Person B points (each person should total 100)" },
      { key: "names", label: "Names", type: "text", default: "Asha, Ben" },
    ],
    presets: [{ label: "Four assets", values: { items: "Car | 40 | 20\nSavings | 30 | 50\nFurniture | 20 | 20\nArt | 10 | 10", names: "Asha, Ben" } }],
    note: "Educational adjusted-winner style allocation. Fractional items may be impractical; legal ownership, valuation, tax, debt, consent, and binding settlements require professional advice.",
    compute: `(values) => {
      const names=String(values.names||"A,B").split(",").map((x)=>x.trim()), items=String(values.items||"").split(/\\r?\\n/).map((line)=>{const [name,a,b]=line.split("|").map((x)=>x.trim());return {name,a:Number(a)||0,b:Number(b)||0};}).filter((x)=>x.name), allocation=items.map((x)=>({...x,owner:x.a>=x.b?0:1}));let totals=[allocation.filter((x)=>x.owner===0).reduce((s,x)=>s+x.a,0),allocation.filter((x)=>x.owner===1).reduce((s,x)=>s+x.b,0)];
      const richer=totals[0]>=totals[1]?0:1, poorer=1-richer, candidates=allocation.filter((x)=>x.owner===richer).sort((x,y)=>((richer?x.b/x.a:x.a/x.b)||0)-((richer?y.b/y.a:y.a/y.b)||0));let split=null;if(candidates.length){const x=candidates[0],rp=richer?x.b:x.a,rr=richer?x.a:x.b,richOther=totals[richer]-rr,poorTotal=totals[poorer],fraction=(poorTotal+rp-richOther)/(rr+rp);split={x,fraction:Math.max(0,Math.min(1,fraction)),richer};}
      const rows=allocation.map((x)=>{if(split&&x===split.x)return [x.name,x.a,x.b,names[split.richer],(split.fraction*100).toFixed(2)+"% to "+names[split.richer]+", "+((1-split.fraction)*100).toFixed(2)+"% to "+names[1-split.richer]];return [x.name,x.a,x.b,names[x.owner],"100%"];});
      return {result:"Adjusted allocation generated",caption:"Verify each person allocated 100 points",table:{headers:["Item",names[0]+" points",names[1]+" points","Initial owner","Final share"],rows}};
    }`,
  }),
  base("carpool-rotation-scheduler", {
    fields: [
      { key: "members", label: "Members and driver availability", type: "textarea", default: "Asha | yes | 4\nBen | yes | 3\nChirag | no | 0\nDia | yes | 4", hint: "Member | can drive yes/no | seats including driver" },
      { key: "trips", label: "Trip dates", type: "textarea", default: "2026-08-01\n2026-08-08\n2026-08-15\n2026-08-22" },
    ],
    presets: [{ label: "Four trips", values: { members: "Asha | yes | 4\nBen | yes | 3\nChirag | no | 0\nDia | yes | 4", trips: "2026-08-01\n2026-08-08\n2026-08-15\n2026-08-22" } }],
    note: "Rotation organizer only. Confirm licence, insurance, vehicle safety, child restraints, accessibility, fatigue, sobriety, emergency plans, pickup consent, and local transport rules.",
    compute: `(values) => {
      const members=String(values.members||"").split(/\\r?\\n/).map((line)=>{const [name,can,seats]=line.split("|").map((x)=>x.trim());return {name,can:/^y/i.test(can),seats:Number(seats)||0,count:0};}).filter((x)=>x.name), drivers=members.filter((x)=>x.can&&x.seats>1), trips=String(values.trips||"").split(/\\r?\\n/).map((x)=>x.trim()).filter(Boolean), rows=[];
      trips.forEach((date)=>{drivers.sort((a,b)=>a.count-b.count||b.seats-a.seats||a.name.localeCompare(b.name));const d=drivers[0];if(d)d.count+=1;rows.push([date,d?.name||"No eligible driver",d?.seats||0,members.filter((x)=>x!==d).map((x)=>x.name).join(", "),d&&d.seats>=members.length?"Seats fit":"Capacity review"]);});
      return {result:rows.length+" trip(s) scheduled",caption:drivers.length+" eligible driver(s)",table:{headers:["Date","Driver","Seats","Passengers","Check"],rows}};
    }`,
  }),
  base("friend-elo-ladder", {
    fields: [
      { key: "ratings", label: "Starting ratings", type: "textarea", default: "Asha | 1200\nBen | 1200\nChirag | 1200" },
      { key: "matches", label: "Matches in order", type: "textarea", default: "Asha | Ben | 1\nChirag | Asha | 0.5\nBen | Chirag | 0", hint: "Player A | Player B | A score (1 win, 0.5 draw, 0 loss)" },
      { key: "k", label: "K-factor", type: "number", min: 1, default: 32 },
    ],
    presets: [{ label: "Three matches", values: { ratings: "Asha | 1200\nBen | 1200\nChirag | 1200", matches: "Asha | Ben | 1\nChirag | Asha | 0.5\nBen | Chirag | 0", k: 32 } }],
    compute: `(values) => {
      const ratings=new Map(String(values.ratings||"").split(/\\r?\\n/).map((line)=>{const [name,rating]=line.split("|").map((x)=>x.trim());return [name,Number(rating)||1200];}).filter((x)=>x[0])), k=Math.max(1,Number(values.k)||32), history=[];
      String(values.matches||"").split(/\\r?\\n/).forEach((line,index)=>{const [a,b,scoreRaw]=line.split("|").map((x)=>x.trim()),score=Math.max(0,Math.min(1,Number(scoreRaw)));if(!a||!b||!Number.isFinite(score))return;if(!ratings.has(a))ratings.set(a,1200);if(!ratings.has(b))ratings.set(b,1200);const ra=ratings.get(a),rb=ratings.get(b),expected=1/(1+Math.pow(10,(rb-ra)/400)),newA=ra+k*(score-expected),newB=rb+k*((1-score)-(1-expected));ratings.set(a,newA);ratings.set(b,newB);history.push([index+1,a,b,score,newA.toFixed(1),newB.toFixed(1)]);});
      const ladder=[...ratings].sort((a,b)=>b[1]-a[1]).map((x,index)=>[index+1,x[0],x[1].toFixed(1)]);
      return {result:ladder[0]?.[1]||"No players",caption:"Current ladder leader · "+history.length+" match(es)",table:{headers:["Rank","Player","Elo"],rows:ladder},list:history.map((x)=>"Match "+x[0]+": "+x[1]+" vs "+x[2]+" → "+x[4]+" / "+x[5])};
    }`,
  }),
  base("availability-time-zone-finder", {
    fields: [
      { key: "members", label: "Members and UTC offsets", type: "textarea", default: "Asha | 5.5 | 09:00-18:00\nBen | -4 | 09:00-17:00\nChirag | 1 | 10:00-19:00", hint: "Name | UTC offset hours | local availability" },
      { key: "duration", label: "Meeting duration (minutes)", type: "number", min: 15, max: 480, default: 60 },
      { key: "step", label: "Search step (minutes)", type: "number", min: 15, max: 120, default: 30 },
    ],
    presets: [{ label: "Three time zones", values: { members: "Asha | 5.5 | 09:00-18:00\nBen | -4 | 09:00-17:00\nChirag | 1 | 10:00-19:00", duration: 60, step: 30 } }],
    compute: `(values) => {
      const toMin=(time)=>{const [h,m]=String(time).split(":").map(Number);return h*60+(m||0);}, fmt=(minutes)=>{const m=((minutes%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");};
      const members=String(values.members||"").split(/\\r?\\n/).map((line)=>{const [name,offset,range]=line.split("|").map((x)=>x.trim()),[start,end]=String(range||"").split("-");return {name,offset:Number(offset)||0,start:toMin(start),end:toMin(end)};}).filter((x)=>x.name&&Number.isFinite(x.start)&&Number.isFinite(x.end)), duration=Math.max(15,Number(values.duration)||60),step=Math.max(15,Number(values.step)||30),slots=[];
      for(let utc=0;utc<1440;utc+=step){const ok=members.every((x)=>{const local=((utc+x.offset*60)%1440+1440)%1440;return local>=x.start&&local+duration<=x.end;});if(ok)slots.push([fmt(utc)+" UTC",...members.map((x)=>fmt(utc+x.offset*60)+"–"+fmt(utc+x.offset*60+duration))]);}
      return {result:slots.length+" common start time(s)",caption:duration+"-minute meeting",table:{headers:["UTC",...members.map((x)=>x.name+" local")],rows:slots.slice(0,100)}};
    }`,
  }),
  base("shift-rotation-fairness-auditor", {
    fields: [
      { key: "shifts", label: "Assigned shifts", type: "textarea", default: "2026-07-01 | Asha | night | 8\n2026-07-02 | Ben | day | 8\n2026-07-05 | Asha | weekend | 8\n2026-07-06 | Ben | weekend | 6\n2026-07-07 | Chirag | night | 10", hint: "Date | member | type | hours" },
      { key: "night_weight", label: "Night burden weight", type: "number", min: 0, default: 1.5 },
      { key: "weekend_weight", label: "Weekend burden weight", type: "number", min: 0, default: 1.25 },
    ],
    presets: [{ label: "Five shifts", values: { shifts: "2026-07-01 | Asha | night | 8\n2026-07-02 | Ben | day | 8\n2026-07-05 | Asha | weekend | 8\n2026-07-06 | Ben | weekend | 6\n2026-07-07 | Chirag | night | 10", night_weight: 1.5, weekend_weight: 1.25 } }],
    note: "Descriptive workload audit only. Fair scheduling must also account for contracts, availability, disability/accommodation, rest, leave, seniority rules, safety, preferences, protected status, and local labour law.",
    compute: `(values) => {
      const map=new Map();String(values.shifts||"").split(/\\r?\\n/).forEach((line)=>{const [date,name,type,hoursRaw]=line.split("|").map((x)=>x.trim()),hours=Math.max(0,Number(hoursRaw)||0),weight=/night/i.test(type)?Number(values.night_weight):/weekend/i.test(type)?Number(values.weekend_weight):1;if(!name)return;const row=map.get(name)||{hours:0,nights:0,weekends:0,burden:0,count:0};row.hours+=hours;row.count+=1;row.nights+=/night/i.test(type)?1:0;row.weekends+=/weekend/i.test(type)?1:0;row.burden+=hours*weight;map.set(name,row);});
      const rows=[...map].map(([name,x])=>[name,x.count,x.hours.toFixed(2),x.nights,x.weekends,x.burden.toFixed(2)]),burdens=rows.map((x)=>Number(x[5])),mean=burdens.reduce((a,b)=>a+b,0)/Math.max(1,burdens.length),spread=burdens.length?Math.max(...burdens)-Math.min(...burdens):0;
      return {result:spread.toFixed(2)+" weighted-hour spread",caption:"Mean burden "+mean.toFixed(2),table:{headers:["Member","Shifts","Hours","Nights","Weekends","Weighted burden"],rows}};
    }`,
  }),
  base("shared-resource-conflict-resolver", {
    fields: [
      { key: "bookings", label: "Requested bookings", type: "textarea", default: "Room A | 2026-07-25 09:00 | 2026-07-25 10:00 | Asha | 2\nRoom A | 2026-07-25 09:30 | 2026-07-25 11:00 | Ben | 1\nCar 1 | 2026-07-25 08:00 | 2026-07-25 09:00 | Chirag | 1", hint: "Resource | start | end | requester | priority (lower wins)" },
      { key: "buffer", label: "Buffer between bookings (minutes)", type: "number", min: 0, default: 0 },
    ],
    presets: [{ label: "One conflict", values: { bookings: "Room A | 2026-07-25 09:00 | 2026-07-25 10:00 | Asha | 2\nRoom A | 2026-07-25 09:30 | 2026-07-25 11:00 | Ben | 1\nCar 1 | 2026-07-25 08:00 | 2026-07-25 09:00 | Chirag | 1", buffer: 0 } }],
    compute: `(values) => {
      const buffer=Math.max(0,Number(values.buffer)||0)*60000,items=String(values.bookings||"").split(/\\r?\\n/).map((line,index)=>{const [resource,start,end,requester,priority]=line.split("|").map((x)=>x.trim());return {index,resource,start:new Date(start).getTime(),end:new Date(end).getTime(),startText:start,endText:end,requester,priority:Number(priority)||999};}).filter((x)=>x.resource&&Number.isFinite(x.start)&&Number.isFinite(x.end)&&x.end>x.start).sort((a,b)=>a.resource.localeCompare(b.resource)||a.start-b.start||a.priority-b.priority),accepted=[],rows=[];
      items.forEach((item)=>{const conflicts=accepted.filter((x)=>x.resource===item.resource&&item.start<x.end+buffer&&item.end+buffer>x.start);if(!conflicts.length){accepted.push(item);rows.push([item.resource,item.startText,item.endText,item.requester,"Accepted","No conflict"]);}else{const best=[item,...conflicts].sort((a,b)=>a.priority-b.priority||a.start-b.start||a.index-b.index)[0];if(best===item){conflicts.forEach((old)=>{const index=accepted.indexOf(old);if(index>=0)accepted.splice(index,1);});accepted.push(item);rows.push([item.resource,item.startText,item.endText,item.requester,"Accepted","Replaces lower-priority conflict"]);}else rows.push([item.resource,item.startText,item.endText,item.requester,"Needs reschedule","Conflicts with "+best.requester]);}});
      return {result:accepted.length+"/"+items.length+" requests accepted",caption:(items.length-accepted.length)+" conflict(s) need review",table:{headers:["Resource","Start","End","Requester","Decision","Reason"],rows}};
    }`,
  }),
];

for (const raw of specs) {
  const entry = bySlug.get(raw.slug);
  const validation = await validateRawSpec(
    { slug: raw.slug, name: raw.title, description: raw.description, category: raw.category },
    raw,
  );
  if (!validation.ok) throw new Error(`${raw.slug}: ${validation.error}`);
  const quality = qualityLint(validation.spec);
  if (quality.grade === "poor") throw new Error(`${raw.slug}: quality ${quality.score}`);
  if (!dryRun) emitTool(validation.spec, toolsDir);
  console.log(`${dryRun ? "Validated" : "Built"} ${entry.id} ${raw.slug} · quality ${quality.score}`);
}
console.log(`${dryRun ? "Validated" : "Built"} ${specs.length} fair-decision tools.`);

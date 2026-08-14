// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "potluck-dish-assigner",
  "title": "Potluck Dish Assigner",
  "description": "Assign potluck dishes across guests, balancing courses and dietary constraints.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "people",
      "label": "People and dietary needs",
      "type": "textarea",
      "default": "Asha | vegetarian\nBen | nut-free\nChirag | vegan\nDia | none",
      "hint": "Person | dietary tags"
    },
    {
      "key": "courses",
      "label": "Needed courses",
      "type": "text",
      "default": "starter, main, side, dessert"
    },
    {
      "key": "offers",
      "label": "Dish offers",
      "type": "textarea",
      "default": "Asha | lentil salad | starter | vegan,nut-free\nBen | rice bake | main | vegetarian,nut-free\nChirag | fruit tart | dessert | vegan,nut-free\nDia | roasted vegetables | side | vegan,nut-free",
      "hint": "Person | dish | course | dietary tags"
    }
  ],
  "presets": [
    {
      "label": "Balanced potluck",
      "values": {
        "people": "Asha | vegetarian\nBen | nut-free\nChirag | vegan\nDia | none",
        "courses": "starter, main, side, dessert",
        "offers": "Asha | lentil salad | starter | vegan,nut-free\nBen | rice bake | main | vegetarian,nut-free\nChirag | fruit tart | dessert | vegan,nut-free\nDia | roasted vegetables | side | vegan,nut-free"
      }
    }
  ],
  "note": "Planning aid only. Confirm ingredients, allergens, cross-contact, preparation, storage, transport, labelling, and individual medical needs directly with attendees."
},
  compute: (values) => {
      const needs=String(values.people||"").split(/\r?\n/).flatMap((line)=>String(line.split("|")[1]||"").split(",")).map((x)=>x.trim()).filter((x)=>x&&x!=="none"), required=[...new Set(String(values.courses||"").split(",").map((x)=>x.trim()).filter(Boolean))], rows=String(values.offers||"").split(/\r?\n/).map((line)=>line.split("|").map((x)=>x.trim())).filter((x)=>x[0]);
      const table=rows.map((row)=>{const tags=String(row[3]||"").split(",").map((x)=>x.trim()), missing=[...new Set(needs)].filter((need)=>!tags.includes(need));return [row[0],row[1],row[2],tags.join(", ")||"Unlabelled",missing.join(", ")||"Covers entered tags"];}), courses=new Set(rows.map((x)=>x[2]));
      return {result:required.every((x)=>courses.has(x))?"All entered courses covered":"Course gaps: "+required.filter((x)=>!courses.has(x)).join(", "),caption:rows.length+" dish offer(s)",table:{headers:["Person","Dish","Course","Tags","Dietary review"],rows:table}};
    },
};

export default spec;

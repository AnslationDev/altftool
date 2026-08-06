// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "adjusted-winner-splitter",
  "title": "Adjusted-Winner Splitter",
  "description": "Divide shared assets fairly between two people using point allocation.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "items",
      "label": "Items and point allocations",
      "type": "textarea",
      "default": "Car | 40 | 20\nSavings | 30 | 50\nFurniture | 20 | 20\nArt | 10 | 10",
      "hint": "Item | Person A points | Person B points (each person should total 100)"
    },
    {
      "key": "names",
      "label": "Names",
      "type": "text",
      "default": "Asha, Ben"
    }
  ],
  "presets": [
    {
      "label": "Four assets",
      "values": {
        "items": "Car | 40 | 20\nSavings | 30 | 50\nFurniture | 20 | 20\nArt | 10 | 10",
        "names": "Asha, Ben"
      }
    }
  ],
  "note": "Educational adjusted-winner style allocation. Fractional items may be impractical; legal ownership, valuation, tax, debt, consent, and binding settlements require professional advice."
},
  compute: (values) => {
      const names=String(values.names||"A,B").split(",").map((x)=>x.trim()), items=String(values.items||"").split(/\r?\n/).map((line)=>{const [name,a,b]=line.split("|").map((x)=>x.trim());return {name,a:Number(a)||0,b:Number(b)||0};}).filter((x)=>x.name), allocation=items.map((x)=>({...x,owner:x.a>=x.b?0:1}));let totals=[allocation.filter((x)=>x.owner===0).reduce((s,x)=>s+x.a,0),allocation.filter((x)=>x.owner===1).reduce((s,x)=>s+x.b,0)];
      const richer=totals[0]>=totals[1]?0:1, poorer=1-richer, candidates=allocation.filter((x)=>x.owner===richer).sort((x,y)=>((richer?x.b/x.a:x.a/x.b)||0)-((richer?y.b/y.a:y.a/y.b)||0));let split=null;if(candidates.length){const x=candidates[0],rp=richer?x.b:x.a,rr=richer?x.a:x.b,richOther=totals[richer]-rr,poorTotal=totals[poorer],fraction=(poorTotal+rp-richOther)/(rr+rp);split={x,fraction:Math.max(0,Math.min(1,fraction)),richer};}
      const rows=allocation.map((x)=>{if(split&&x===split.x)return [x.name,x.a,x.b,names[split.richer],(split.fraction*100).toFixed(2)+"% to "+names[split.richer]+", "+((1-split.fraction)*100).toFixed(2)+"% to "+names[1-split.richer]];return [x.name,x.a,x.b,names[x.owner],"100%"];});
      return {result:"Adjusted allocation generated",caption:"Verify each person allocated 100 points",table:{headers:["Item",names[0]+" points",names[1]+" points","Initial owner","Final share"],rows}};
    },
};

export default spec;

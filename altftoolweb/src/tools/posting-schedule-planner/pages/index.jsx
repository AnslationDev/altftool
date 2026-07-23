"use client";

import { useState, useMemo, useRef, useEffect } from "react";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const PLATFORMS  = ["Instagram","Twitter/X","LinkedIn","Facebook","TikTok","YouTube","Pinterest","Threads"];
const CTYPES     = ["Image","Video","Reel / Short","Story","Carousel","Text Post","Blog","Podcast","Infographic","Live Stream"];
const STATUSES   = ["Draft","Scheduled","Published","Needs Review","Archived"];
const GOALS      = ["Brand Awareness","Lead Generation","Engagement","Sales","Education","Community","Announcement"];
const DAYS_S     = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const PLT = {
  "Instagram" :{ color:"#E1306C", abbr:"IG"  },
  "Twitter/X" :{ color:"#1DA1F2", abbr:"X"   },
  "LinkedIn"  :{ color:"#0A66C2", abbr:"in"  },
  "Facebook"  :{ color:"#1877F2", abbr:"fb"  },
  "TikTok"    :{ color:"#ff2d55", abbr:"TK"  },
  "YouTube"   :{ color:"#FF0000", abbr:"YT"  },
  "Pinterest" :{ color:"#E60023", abbr:"PT"  },
  "Threads"   :{ color:"#878787", abbr:"TH"  },
};

const ST_LIGHT = {
  "Draft"        :{ bg:"#f1f5f9", text:"#64748b", bar:"#94a3b8" },
  "Scheduled"    :{ bg:"#ecfdf5", text:"#065f46", bar:"#10b981" },
  "Published"    :{ bg:"#eff6ff", text:"#1e40af", bar:"#3b82f6" },
  "Needs Review" :{ bg:"#fffbeb", text:"#92400e", bar:"#f59e0b" },
  "Archived"     :{ bg:"#faf5ff", text:"#6d28d9", bar:"#8b5cf6" },
};
const ST_DARK = {
  "Draft"        :{ bg:"#1e293b", text:"#94a3b8", bar:"#475569" },
  "Scheduled"    :{ bg:"#064e3b", text:"#6ee7b7", bar:"#10b981" },
  "Published"    :{ bg:"#1e3a5f", text:"#93c5fd", bar:"#3b82f6" },
  "Needs Review" :{ bg:"#451a03", text:"#fcd34d", bar:"#f59e0b" },
  "Archived"     :{ bg:"#2e1065", text:"#c4b5fd", bar:"#8b5cf6" },
};

const SEEDS = [
  {
    id:1, title:"Product Launch Teaser", platform:"Instagram", ctype:"Reel / Short",
    date:"2026-05-22", time:"10:00", status:"Scheduled",
    caption:"Something incredible is on its way. Mark your calendars — you won't want to miss this.",
    hashtags:"#launch #comingsoon #product #newrelease #excited",
    goal:"Brand Awareness", notes:"Use trending audio. Get final b-roll approved.",
    coverColor:"#E1306C",
    likes:0, comments:0, shares:0,
  },
  {
    id:2, title:"Industry Insight Thread", platform:"Twitter/X", ctype:"Text Post",
    date:"2026-05-23", time:"09:30", status:"Draft",
    caption:"5 trends reshaping our industry in 2026 — a thread worth bookmarking.",
    hashtags:"#insights #industry #2026trends #thread",
    goal:"Education", notes:"Link to the blog post at the end of the thread.",
    coverColor:"#1DA1F2",
    likes:0, comments:0, shares:0,
  },
  {
    id:3, title:"Behind the Scenes Day", platform:"TikTok", ctype:"Video",
    date:"2026-05-24", time:"15:00", status:"Needs Review",
    caption:"A full day in our studio — the chaos, the creativity, all of it.",
    hashtags:"#BTS #behindthescenes #studio #authentic #team",
    goal:"Engagement", notes:"Sarah must approve the final edit before this goes live.",
    coverColor:"#ff2d55",
    likes:0, comments:0, shares:0,
  },
  {
    id:4, title:"Q2 Results Announcement", platform:"LinkedIn", ctype:"Text Post",
    date:"2026-05-26", time:"08:00", status:"Scheduled",
    caption:"We are proud to share our Q2 results. Record growth, incredible team effort.",
    hashtags:"#Q2 #results #growth #company #milestone",
    goal:"Announcement", notes:"CEO must review and approve before publishing.",
    coverColor:"#0A66C2",
    likes:0, comments:0, shares:0,
  },
  {
    id:5, title:"Getting Started Tutorial", platform:"YouTube", ctype:"Video",
    date:"2026-05-28", time:"14:00", status:"Published",
    caption:"The ultimate beginner's guide to getting started with our platform.",
    hashtags:"#tutorial #howto #beginners #guide #learnwithus",
    goal:"Education", notes:"Pin the top comment with the resource link.",
    coverColor:"#FF0000",
    likes:124, comments:18, shares:9,
  },
];

const BLANK = {
  title:"", platform:"Instagram", ctype:"Image", date:"", time:"12:00",
  status:"Draft", caption:"", hashtags:"", goal:"Brand Awareness", notes:"",
  coverColor:"#6366f1",
  likes:"", comments:"", shares:"",
};

/* ─── Theme tokens ───────────────────────────────────────────────────────── */
const TK = {
  pageBg   :{ l:"#f0f4f8",  d:"#080f1a" },
  cardBg   :{ l:"#ffffff",  d:"#111827" },
  panelBg  :{ l:"#f8fafc",  d:"#0f172a" },
  border   :{ l:"#e2e8f0",  d:"#1e293b" },
  text     :{ l:"#0f172a",  d:"#f1f5f9" },
  sub      :{ l:"#475569",  d:"#94a3b8" },
  muted    :{ l:"#94a3b8",  d:"#475569" },
  accent   :{ l:"#4f46e5",  d:"#818cf8" },
  accentBg :{ l:"#eef2ff",  d:"#1e1b4b" },
  input    :{ l:"#f8fafc",  d:"#0f172a" },
  inpBdr   :{ l:"#cbd5e1",  d:"#1e293b" },
  divider  :{ l:"#e2e8f0",  d:"#1e293b" },
  hover    :{ l:"#f1f5f9",  d:"#1e293b" },
};
const tk = (k, d) => TK[k][d?"d":"l"];

function useDark() {
  const [d, setD] = useState(() => window.matchMedia?.("(prefers-color-scheme:dark)").matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h = e => setD(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return d;
}

const fmtDate = d => d ? new Date(d+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}) : "—";

/* ─── Tiny icon set (SVG, no emoji) ─────────────────────────────────────── */
const Icon = ({ n, size=16, color="currentColor", style={} }) => {
  const paths = {
    plus     :"M12 5v14M5 12h14",
    edit     :"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    trash    :"M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
    copy     :"M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M13 21h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z",
    chevDown :"M6 9l6 6 6-6",
    chevUp   :"M18 15l-6-6-6 6",
    x        :"M18 6L6 18M6 6l12 12",
    check    :"M20 6L9 17l-5-5",
    calendar :"M3 9h18M8 3v3M16 3v3M4 5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
    bar      :"M18 20V10M12 20V4M6 20v-6",
    search   :"M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
    list     :"M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
    image    :"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
    hash     :"M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
    clock    :"M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2",
    tag      :"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
    zap      :"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    eye      :"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    heart    :"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    msg      :"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    share    :"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
    palette  :"M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2v-.5c0-.28.22-.5.5-.5H16a4 4 0 0 0 0-8h-1.26A10.01 10.01 0 0 0 12 2z",
    file     :"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
    flag     :"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[n]||paths.file} />
    </svg>
  );
};

/* ─── Cover preview ─────────────────────────────────────────────────────── */
const CoverPreview = ({ color="#4f46e5", title="", platform="Instagram", size=56 }) => {
  const abbr = PLT[platform]?.abbr || "?";
  return (
    <div style={{ width:size, height:size, borderRadius:10, background:`${color}22`, border:`2px solid ${color}44`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${color}33 0%,transparent 100%)` }} />
      <div style={{ fontSize:size*0.22, fontWeight:800, color, lineHeight:1, zIndex:1 }}>{abbr}</div>
    </div>
  );
};

/* ─── Color swatch picker ────────────────────────────────────────────────── */
const SWATCHES = ["#6366f1","#E1306C","#1DA1F2","#0A66C2","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#14b8a6","#f97316"];
const ColorPicker = ({ value, onChange, dk }) => (
  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
    {SWATCHES.map(c => (
      <button key={c} onClick={()=>onChange(c)} style={{ width:24, height:24, borderRadius:6, background:c, border:value===c?`3px solid ${tk("text",dk)}`:"3px solid transparent", cursor:"pointer", padding:0, flexShrink:0 }} />
    ))}
    <input type="color" value={value} onChange={e=>onChange(e.target.value)} style={{ width:24, height:24, borderRadius:6, border:"none", padding:0, cursor:"pointer", background:"none" }} title="Custom color" />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const dk = useDark();
  const sm = dk ? ST_DARK : ST_LIGHT;
  const [posts,    setPosts]    = useState(SEEDS);
  const [view,     setView]     = useState("board");  // board | calendar | analytics | form
  const [form,     setForm]     = useState(BLANK);
  const [editId,   setEditId]   = useState(null);
  const [ftab,     setFtab]     = useState("info");   // info | content | schedule | metrics
  const [filter,   setFilter]   = useState({ platform:"All", status:"All", goal:"All" });
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("date");
  const [expId,    setExpId]    = useState(null);
  const [toast,    setToast]    = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const nextId = useRef(SEEDS.length+1);

  const notify = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  const sf = (k,v) => setForm(f=>({...f,[k]:v}));

  /* filtered posts */
  const filtered = useMemo(()=>{
    return posts.filter(p=>{
      if(filter.platform!=="All"&&p.platform!==filter.platform) return false;
      if(filter.status!=="All"&&p.status!==filter.status) return false;
      if(filter.goal!=="All"&&p.goal!==filter.goal) return false;
      if(search){
        const q=search.toLowerCase();
        if(![p.title,p.caption,p.hashtags].some(x=>x.toLowerCase().includes(q))) return false;
      }
      return true;
    }).sort((a,b)=>{
      if(sort==="date") return new Date(a.date+"T"+a.time)-new Date(b.date+"T"+b.time);
      if(sort==="title") return a.title.localeCompare(b.title);
      if(sort==="platform") return a.platform.localeCompare(b.platform);
      if(sort==="status") return a.status.localeCompare(b.status);
      return 0;
    });
  },[posts,filter,search,sort]);

  /* week dates */
  const weekDates = useMemo(()=>{
    const t=new Date(), s=new Date(t); s.setDate(t.getDate()-t.getDay());
    return Array.from({length:7},(_,i)=>{ const d=new Date(s); d.setDate(s.getDate()+i); return d; });
  },[]);

  /* analytics */
  const stats = useMemo(()=>{
    const byP={},byS={},byG={},byCT={};
    let likes=0,comments=0,shares=0;
    posts.forEach(p=>{
      byP[p.platform]=(byP[p.platform]||0)+1;
      byS[p.status]=(byS[p.status]||0)+1;
      byG[p.goal]=(byG[p.goal]||0)+1;
      byCT[p.ctype]=(byCT[p.ctype]||0)+1;
      likes+=+p.likes||0; comments+=+p.comments||0; shares+=+p.shares||0;
    });
    return {byP,byS,byG,byCT,likes,comments,shares};
  },[posts]);

  /* CRUD */
  const openAdd  = () => { setEditId(null); setForm(BLANK); setFtab("info"); setView("form"); };
  const openEdit = p  => { setEditId(p.id); setForm({...p,likes:p.likes||"",comments:p.comments||"",shares:p.shares||""}); setFtab("info"); setView("form"); };
  const save = () => {
    if(!form.title.trim()||!form.date){ notify("Title and date are required","err"); return; }
    const entry={...form,likes:+form.likes||0,comments:+form.comments||0,shares:+form.shares||0};
    if(editId){ setPosts(p=>p.map(x=>x.id===editId?{...entry,id:editId}:x)); notify("Post updated"); }
    else      { setPosts(p=>[...p,{...entry,id:nextId.current++}]);           notify("Post added");   }
    setView("board");
  };
  const del       = id => { setPosts(p=>p.filter(x=>x.id!==id)); setConfirm(null); notify("Deleted","info"); };
  const setStatus = (id,s) => setPosts(p=>p.map(x=>x.id===id?{...x,status:s}:x));
  const dupe      = p  => { setPosts(prev=>[...prev,{...p,id:nextId.current++,title:p.title+" (copy)",status:"Draft"}]); notify("Duplicated"); };

  /* ── shared style helpers ── */
  const cardBox = { background:tk("cardBg",dk), border:`1px solid ${tk("border",dk)}`, borderRadius:16, overflow:"hidden", boxSizing:"border-box" };
  const inp  = { background:tk("input",dk), border:`1px solid ${tk("inpBdr",dk)}`, borderRadius:9, color:tk("text",dk), fontFamily:"inherit", fontSize:13, padding:"9px 12px", outline:"none", width:"100%", boxSizing:"border-box", colorScheme:dk?"dark":"light" };
  const lbl  = { display:"flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, color:tk("accent",dk), letterSpacing:1.8, textTransform:"uppercase", marginBottom:6 };
  const iBtn = (col=tk("muted",dk)) => ({ background:"transparent", border:"none", cursor:"pointer", color:col, display:"flex", alignItems:"center", justifyContent:"center", padding:6, borderRadius:7 });
  const pBtn = (variant) => ({
    display:"inline-flex", alignItems:"center", gap:6,
    borderRadius:9, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"none",
    background: variant==="primary"?tk("accent",dk):variant==="danger"?"#dc2626":variant==="ghost"?"transparent":tk("input",dk),
    color:      variant==="primary"||variant==="danger"?"#fff":tk("sub",dk),
    ...(variant==="outline"?{border:`1.5px solid ${tk("accent",dk)}`,background:"transparent",color:tk("accent",dk)}:{}),
  });

  /* ══════════ RENDER ══════════ */
  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif", background:tk("pageBg",dk), color:tk("text",dk), minHeight:"100vh", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 12px 56px", boxSizing:"border-box" }}>

      {/* ── Toast ── */}
      {toast&&(
        <div style={{ position:"fixed",top:20,right:20,zIndex:9999,borderRadius:10,padding:"11px 18px",fontSize:13,fontWeight:600, boxShadow:"0 8px 24px #0003",
          background:toast.type==="err"?"#fef2f2":toast.type==="info"?"#eff6ff":"#f0fdf4",
          color:toast.type==="err"?"#991b1b":toast.type==="info"?"#1d4ed8":"#166534",
          border:`1px solid ${toast.type==="err"?"#fca5a5":toast.type==="info"?"#93c5fd":"#86efac"}` }}>
          {toast.msg}
        </div>
      )}

      {/* ── Delete confirm ── */}
      {confirm&&(
        <div style={{position:"fixed",inset:0,background:"#00000088",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{...cardBox,padding:"28px 32px",maxWidth:300,width:"90%",textAlign:"center"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Icon n="trash" color="#dc2626" size={20}/></div>
            <div style={{fontWeight:700,fontSize:16,color:tk("text",dk),marginBottom:6}}>Delete this post?</div>
            <div style={{fontSize:13,color:tk("sub",dk),marginBottom:22}}>This action cannot be undone.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setConfirm(null)} style={pBtn()}>Cancel</button>
              <button onClick={()=>del(confirm)}     style={pBtn("danger")}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MAIN CARD
      ══════════════════════════════════════════════ */}
      <div style={{...cardBox, width:"100%", maxWidth:940, borderRadius:22}}>

        {/* ── App Header ── */}
        <div style={{background:tk("cardBg",dk),borderBottom:`1px solid ${tk("border",dk)}`,padding:"22px 28px 0"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:18}}>
            <div>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:4,color:tk("accent",dk),textTransform:"uppercase",marginBottom:4}}>Content Ops</div>
              <h1 style={{fontSize:24,fontWeight:800,color:tk("text",dk),margin:0,lineHeight:1.2,letterSpacing:-0.5}}>Posting Schedule Planner</h1>
              <p style={{fontSize:13,color:tk("sub",dk),margin:"4px 0 0"}}>Plan, schedule and track all your social media content in one place.</p>
            </div>
            <button onClick={openAdd} style={{...pBtn("primary"),padding:"10px 20px",flexShrink:0}}>
              <Icon n="plus" size={15} color="#fff"/> New Post
            </button>
          </div>

          {/* Nav tabs */}
          <div style={{display:"flex",gap:0}}>
            {[["board","list","Board"],["calendar","calendar","Calendar"],["analytics","bar","Analytics"]].map(([v,ico,label])=>(
              <button key={v} onClick={()=>setView(v)} style={{
                display:"flex",alignItems:"center",gap:7,padding:"9px 16px",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit",
                borderRadius:"10px 10px 0 0", background:view===v?tk("panelBg",dk):"transparent",
                color:view===v?tk("accent",dk):tk("sub",dk),
                borderBottom:view===v?`2.5px solid ${tk("accent",dk)}`:"2.5px solid transparent",
              }}>
                <Icon n={ico} size={14} color={view===v?tk("accent",dk):tk("muted",dk)}/>{label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats strip ── */}
        {view!=="form"&&(
          <div style={{display:"flex",borderBottom:`1px solid ${tk("border",dk)}`,background:tk("panelBg",dk)}}>
            {[
              {l:"Total",  v:posts.length,                    c:tk("accent",dk)},
              {l:"Scheduled", v:stats.byS["Scheduled"]||0,   c:"#10b981"},
              {l:"Published", v:stats.byS["Published"]||0,   c:"#3b82f6"},
              {l:"Draft",     v:stats.byS["Draft"]||0,       c:"#94a3b8"},
              {l:"Review",    v:stats.byS["Needs Review"]||0,c:"#f59e0b"},
              {l:"Archived",  v:stats.byS["Archived"]||0,    c:"#8b5cf6"},
            ].map((s,i,a)=>(
              <div key={s.l} style={{flex:1,minWidth:68,textAlign:"center",padding:"11px 4px",borderRight:i<a.length-1?`1px solid ${tk("border",dk)}`:"none"}}>
                <div style={{fontSize:20,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:9,color:tk("muted",dk),marginTop:2,letterSpacing:0.5,textTransform:"uppercase"}}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════
            FORM VIEW
        ════════════════════════════════════ */}
        {view==="form"&&(
          <div>
            {/* Form header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 28px",borderBottom:`1px solid ${tk("border",dk)}`}}>
              <div style={{fontWeight:800,fontSize:16,color:tk("text",dk)}}>{editId?"Edit Post":"Create New Post"}</div>
              <button onClick={()=>setView("board")} style={iBtn(tk("sub",dk))}><Icon n="x" size={18}/></button>
            </div>

            {/* Two-column layout: left = preview, right = form */}
            <div style={{display:"grid",gridTemplateColumns:"220px 1fr",minHeight:0}}>

              {/* Left: live preview panel */}
              <div style={{background:tk("panelBg",dk),borderRight:`1px solid ${tk("border",dk)}`,padding:"22px 20px",display:"flex",flexDirection:"column",gap:16}}>
                <div style={{fontSize:11,fontWeight:700,color:tk("muted",dk),letterSpacing:1.5,textTransform:"uppercase"}}>Live Preview</div>

                {/* Cover card preview */}
                <div style={{background:tk("cardBg",dk),border:`1px solid ${tk("border",dk)}`,borderRadius:14,overflow:"hidden"}}>
                  {/* Cover image area */}
                  <div style={{height:120,background:`linear-gradient(135deg,${form.coverColor}33,${form.coverColor}66)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(45deg,${form.coverColor}11 0px,${form.coverColor}11 1px,transparent 1px,transparent 8px)` }} />
                    <div style={{zIndex:1,textAlign:"center"}}>
                      <div style={{width:40,height:40,borderRadius:10,background:form.coverColor,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"}}>
                        <Icon n="image" size={18} color="#fff"/>
                      </div>
                      <div style={{fontSize:10,color:form.coverColor,fontWeight:700}}>{PLT[form.platform]?.abbr||"?"}</div>
                    </div>
                  </div>
                  {/* Card body */}
                  <div style={{padding:"12px"}}>
                    <div style={{fontSize:12,fontWeight:700,color:tk("text",dk),marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{form.title||"Post title"}</div>
                    <div style={{fontSize:10,color:tk("sub",dk),lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{form.caption||"Your caption will appear here..."}</div>
                    {form.hashtags&&(
                      <div style={{marginTop:6,fontSize:9,color:tk("accent",dk),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{form.hashtags}</div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,paddingTop:8,borderTop:`1px solid ${tk("border",dk)}`}}>
                      <span style={{fontSize:9,fontWeight:700,color:PLT[form.platform]?.color||tk("accent",dk)}}>{form.platform}</span>
                      <span style={{fontSize:9,color:tk("muted",dk)}}>{form.date?fmtDate(form.date):"No date"} {form.time}</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                {form.status&&(
                  <div style={{display:"flex",justifyContent:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,background:sm[form.status]?.bg,color:sm[form.status]?.text,borderRadius:20,padding:"5px 14px"}}>
                      {form.status}
                    </span>
                  </div>
                )}

                {/* Platform color dot */}
                <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:tk("sub",dk)}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:PLT[form.platform]?.color||"#888"}} />
                  {form.platform} — {form.ctype}
                </div>
              </div>

              {/* Right: tabbed form */}
              <div>
                {/* Form section tabs */}
                <div style={{display:"flex",borderBottom:`1px solid ${tk("border",dk)}`,background:tk("cardBg",dk)}}>
                  {[["info","file","Post Info"],["content","hash","Caption & Tags"],["schedule","clock","Schedule"],["metrics","heart","Metrics"]].map(([k,ico,label])=>(
                    <button key={k} onClick={()=>setFtab(k)} style={{
                      display:"flex",alignItems:"center",gap:6,padding:"11px 14px",fontSize:12,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit",
                      background:"transparent",marginBottom:"-1px",
                      color:ftab===k?tk("accent",dk):tk("sub",dk),
                      borderBottom:ftab===k?`2.5px solid ${tk("accent",dk)}`:"2.5px solid transparent",
                    }}>
                      <Icon n={ico} size={13} color={ftab===k?tk("accent",dk):tk("muted",dk)}/>{label}
                    </button>
                  ))}
                </div>

                <div style={{padding:"22px 24px",overflowY:"auto",maxHeight:"calc(100vh - 280px)"}}>

                  {/* ── Tab: Post Info ── */}
                  {ftab==="info"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:18}}>

                      <div>
                        <label style={lbl}><Icon n="file" size={12} color={tk("accent",dk)}/>Post Title</label>
                        <input style={{...inp,fontSize:15,fontWeight:600,padding:"11px 13px"}} placeholder="Enter a clear, descriptive title" value={form.title} onChange={e=>sf("title",e.target.value)} />
                      </div>

                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                        <div>
                          <label style={lbl}><Icon n="zap" size={12} color={tk("accent",dk)}/>Platform</label>
                          <select style={inp} value={form.platform} onChange={e=>sf("platform",e.target.value)}>
                            {PLATFORMS.map(p=><option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}><Icon n="image" size={12} color={tk("accent",dk)}/>Content Type</label>
                          <select style={inp} value={form.ctype} onChange={e=>sf("ctype",e.target.value)}>
                            {CTYPES.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}><Icon n="flag" size={12} color={tk("accent",dk)}/>Campaign Goal</label>
                          <select style={inp} value={form.goal} onChange={e=>sf("goal",e.target.value)}>
                            {GOALS.map(g=><option key={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}><Icon n="eye" size={12} color={tk("accent",dk)}/>Status</label>
                          <select style={inp} value={form.status} onChange={e=>sf("status",e.target.value)}>
                            {STATUSES.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={lbl}><Icon n="palette" size={12} color={tk("accent",dk)}/>Cover Color</label>
                        <ColorPicker value={form.coverColor} onChange={v=>sf("coverColor",v)} dk={dk}/>
                        <div style={{fontSize:11,color:tk("muted",dk),marginTop:6}}>Represents your cover image color in the preview.</div>
                      </div>

                      <div>
                        <label style={lbl}><Icon n="tag" size={12} color={tk("accent",dk)}/>Notes / Next Steps</label>
                        <textarea style={{...inp,resize:"vertical",minHeight:72}} placeholder="Approvals needed, reminders, action items..." value={form.notes} onChange={e=>sf("notes",e.target.value)} rows={3}/>
                      </div>
                    </div>
                  )}

                  {/* ── Tab: Caption & Tags ── */}
                  {ftab==="content"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:18}}>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <label style={{...lbl,marginBottom:0}}><Icon n="file" size={12} color={tk("accent",dk)}/>Caption</label>
                          <span style={{fontSize:11,color:form.caption.length>2000?"#ef4444":tk("muted",dk)}}>{form.caption.length} chars</span>
                        </div>
                        <textarea style={{...inp,resize:"vertical",minHeight:120}} placeholder="Write your post caption here. Keep it engaging, clear and on-brand." value={form.caption} onChange={e=>sf("caption",e.target.value)} rows={6}/>
                      </div>

                      <div>
                        <label style={lbl}><Icon n="hash" size={12} color={tk("accent",dk)}/>Hashtags</label>
                        <textarea style={{...inp,resize:"vertical",minHeight:72}} placeholder="#marketing #socialmedia #content #brand" value={form.hashtags} onChange={e=>sf("hashtags",e.target.value)} rows={3}/>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:11,color:tk("muted",dk)}}>
                          <span>{(form.hashtags.match(/#\S+/g)||[]).length} hashtags</span>
                          <span>Tip: 5–10 hashtags perform best</span>
                        </div>
                      </div>

                      {/* Platform char limits */}
                      <div style={{background:tk("panelBg",dk),border:`1px solid ${tk("border",dk)}`,borderRadius:10,padding:"14px 16px"}}>
                        <div style={{fontSize:12,fontWeight:700,color:tk("sub",dk),marginBottom:10}}>Platform caption limits</div>
                        {[["Instagram","2,200 chars"],["Twitter/X","280 chars"],["LinkedIn","3,000 chars"],["TikTok","2,200 chars"],["YouTube","5,000 chars"],["Facebook","63,206 chars"]].map(([p,l],i,a)=>{
                          const pc=PLT[p]?.color||"#888";
                          return (
                            <div key={p} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<a.length-1?`1px solid ${tk("divider",dk)}`:"none"}}>
                              <div style={{width:4,height:4,borderRadius:"50%",background:pc,flexShrink:0}} />
                              <span style={{fontSize:12,color:tk("sub",dk),flex:1}}>{p}</span>
                              <span style={{fontSize:12,fontWeight:700,color:tk("text",dk)}}>{l}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Tab: Schedule ── */}
                  {ftab==="schedule"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:18}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                        <div>
                          <label style={lbl}><Icon n="calendar" size={12} color={tk("accent",dk)}/>Publish Date</label>
                          <input type="date" style={inp} value={form.date} onChange={e=>sf("date",e.target.value)}/>
                        </div>
                        <div>
                          <label style={lbl}><Icon n="clock" size={12} color={tk("accent",dk)}/>Publish Time</label>
                          <input type="time" style={inp} value={form.time} onChange={e=>sf("time",e.target.value)}/>
                        </div>
                      </div>

                      {/* Best time guide */}
                      <div style={{background:tk("panelBg",dk),border:`1px solid ${tk("border",dk)}`,borderRadius:10,padding:"14px 16px"}}>
                        <div style={{fontSize:12,fontWeight:700,color:tk("sub",dk),marginBottom:10}}>Best posting times</div>
                        {[
                          ["Instagram","Tue–Fri","09:00 – 11:00"],
                          ["Twitter/X", "Mon–Fri","08:00 – 10:00"],
                          ["LinkedIn", "Tue–Thu","07:30 – 09:00"],
                          ["TikTok",   "Tue,Thu","19:00 – 21:00"],
                          ["Facebook", "Wed–Fri","13:00 – 15:00"],
                          ["YouTube",  "Sat–Sun","15:00 – 17:00"],
                        ].map(([p,days,times],i,a)=>{
                          const active=p===form.platform;
                          const pc=PLT[p]?.color||"#888";
                          return (
                            <div key={p} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<a.length-1?`1px solid ${tk("divider",dk)}`:"none",background:active?`${pc}11`:"transparent",borderRadius:active?6:0,paddingLeft:active?8:0}}>
                              <div style={{width:3,height:28,borderRadius:99,background:active?pc:tk("border",dk),flexShrink:0}} />
                              <div style={{flex:1}}>
                                <div style={{fontSize:12,fontWeight:active?700:500,color:active?pc:tk("sub",dk)}}>{p}</div>
                                <div style={{fontSize:10,color:tk("muted",dk)}}>{days}</div>
                              </div>
                              <div style={{fontSize:11,fontWeight:700,color:active?pc:tk("muted",dk)}}>{times}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Countdown */}
                      {form.date&&(()=>{
                        const diff=Math.ceil((new Date(form.date+"T"+form.time)-new Date())/(1000*60*60*24));
                        const color=diff<0?"#ef4444":diff<=2?"#f59e0b":"#10b981";
                        return (
                          <div style={{background:`${color}15`,border:`1px solid ${color}33`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                            <Icon n="clock" size={16} color={color}/>
                            <div style={{fontSize:13,fontWeight:600,color}}>
                              {diff<0?`${Math.abs(diff)} days overdue`:diff===0?"Scheduled for today":`${diff} day${diff!==1?"s":""} until publish`}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ── Tab: Metrics ── */}
                  {ftab==="metrics"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:18}}>
                      <div style={{fontSize:13,color:tk("sub",dk)}}>Record engagement metrics once the post is published.</div>
                      {[["likes","heart","Likes"],["comments","msg","Comments"],["shares","share","Shares / Reposts"]].map(([k,ico,label])=>(
                        <div key={k}>
                          <label style={lbl}><Icon n={ico} size={12} color={tk("accent",dk)}/>{label}</label>
                          <input type="number" min="0" style={inp} value={form[k]||""} onChange={e=>sf(k,e.target.value)} placeholder="0"/>
                        </div>
                      ))}
                      {(+form.likes||+form.comments||+form.shares)?(
                        <div style={{background:tk("panelBg",dk),border:`1px solid ${tk("border",dk)}`,borderRadius:10,padding:"14px"}}>
                          <div style={{fontSize:12,fontWeight:700,color:tk("sub",dk),marginBottom:10}}>Total engagement</div>
                          <div style={{fontSize:28,fontWeight:800,color:tk("accent",dk)}}>{(+form.likes||0)+(+form.comments||0)+(+form.shares||0)}</div>
                        </div>
                      ):null}
                    </div>
                  )}

                  {/* Save/cancel */}
                  <div style={{display:"flex",gap:10,marginTop:24,justifyContent:"flex-end"}}>
                    <button onClick={()=>setView("board")} style={pBtn()}>Cancel</button>
                    <button onClick={save} style={pBtn("primary")}><Icon n="check" size={14} color="#fff"/>{editId?"Update Post":"Save Post"}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            BOARD VIEW
        ════════════════════════════════════ */}
        {view==="board"&&(
          <div style={{padding:"18px 28px 28px"}}>
            {/* Filters */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",display:"flex"}}><Icon n="search" size={14} color={tk("muted",dk)}/></span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, caption or hashtag..." style={{...inp,paddingLeft:32}}/>
              </div>
              {[{key:"platform",opts:["All",...PLATFORMS]},{key:"status",opts:["All",...STATUSES]},{key:"goal",opts:["All",...GOALS]}].map(({key,opts})=>(
                <select key={key} style={inp} value={filter[key]} onChange={e=>setFilter(f=>({...f,[key]:e.target.value}))}>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              ))}
              <select style={inp} value={sort} onChange={e=>setSort(e.target.value)}>
                {[["date","Date"],["title","Title"],["platform","Platform"],["status","Status"]].map(([v,l])=><option key={v} value={v}>Sort: {l}</option>)}
              </select>
            </div>

            <div style={{fontSize:12,color:tk("muted",dk),marginBottom:12}}>{filtered.length} of {posts.length} posts</div>

            {filtered.length===0&&(
              <div style={{textAlign:"center",padding:"56px 0",color:tk("muted",dk)}}>
                <Icon n="search" size={36} color={tk("border",dk)} style={{margin:"0 auto 12px",display:"block"}}/>
                <div style={{fontWeight:700,color:tk("sub",dk),fontSize:15,marginBottom:4}}>No posts found</div>
                <div style={{fontSize:13}}>Adjust your filters or create a new post.</div>
              </div>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filtered.map(post=>{
                const pc  = PLT[post.platform]?.color||"#888";
                const stm = sm[post.status]||sm["Draft"];
                const isExp = expId===post.id;
                const totalEng = (+post.likes||0)+(+post.comments||0)+(+post.shares||0);
                const diff = Math.ceil((new Date(post.date+"T"+post.time)-new Date())/(1000*60*60*24));
                const urgent = diff>=0&&diff<=2&&post.status==="Scheduled";

                return (
                  <div key={post.id} style={{border:`1.5px solid ${urgent?"#f59e0b44":tk("border",dk)}`,borderRadius:14,overflow:"hidden",background:tk("cardBg",dk),transition:"border-color 0.2s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",flexWrap:"wrap"}}>

                      {/* Cover preview */}
                      <CoverPreview color={post.coverColor||pc} title={post.title} platform={post.platform} size={48}/>

                      {/* Main info */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14,color:tk("text",dk),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.title}</div>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:11,color:pc,fontWeight:700}}>{post.platform}</span>
                          <span style={{color:tk("border",dk),fontSize:10}}>·</span>
                          <span style={{fontSize:11,color:tk("sub",dk)}}>{post.ctype}</span>
                          <span style={{color:tk("border",dk),fontSize:10}}>·</span>
                          <span style={{fontSize:11,color:tk("sub",dk)}}>{fmtDate(post.date)} at {post.time}</span>
                          {urgent&&<span style={{fontSize:10,fontWeight:700,color:"#f59e0b",background:"#fffbeb",borderRadius:10,padding:"2px 7px"}}>Due soon</span>}
                          {totalEng>0&&<><span style={{color:tk("border",dk),fontSize:10}}>·</span><span style={{fontSize:11,color:tk("muted",dk)}}>{totalEng} engagements</span></>}
                        </div>
                      </div>

                      {/* Hashtags preview */}
                      {post.hashtags&&(
                        <div style={{fontSize:10,color:tk("accent",dk),maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0,display:"none"}} className="hide-sm">
                          {post.hashtags.split(" ").slice(0,3).join(" ")}
                        </div>
                      )}

                      {/* Goal */}
                      <span style={{fontSize:10,fontWeight:700,color:tk("accent",dk),background:tk("accentBg",dk),borderRadius:20,padding:"3px 10px",whiteSpace:"nowrap",flexShrink:0}}>{post.goal}</span>

                      {/* Status select */}
                      <select value={post.status} onChange={e=>setStatus(post.id,e.target.value)} style={{background:stm.bg,color:stm.text,border:"none",borderRadius:20,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",outline:"none",fontFamily:"inherit",flexShrink:0}}>
                        {STATUSES.map(s=><option key={s}>{s}</option>)}
                      </select>

                      {/* Action buttons */}
                      <div style={{display:"flex",gap:2,flexShrink:0}}>
                        <button onClick={()=>setExpId(isExp?null:post.id)} style={iBtn(tk("muted",dk))} title="Expand"><Icon n={isExp?"chevUp":"chevDown"} size={15}/></button>
                        <button onClick={()=>openEdit(post)} style={iBtn(tk("sub",dk))} title="Edit"><Icon n="edit" size={15}/></button>
                        <button onClick={()=>dupe(post)} style={iBtn(tk("sub",dk))} title="Duplicate"><Icon n="copy" size={15}/></button>
                        <button onClick={()=>setConfirm(post.id)} style={iBtn("#dc2626")} title="Delete"><Icon n="trash" size={15}/></button>
                      </div>
                    </div>

                    {/* Expanded panel */}
                    {isExp&&(
                      <div style={{borderTop:`1px solid ${tk("border",dk)}`,background:tk("panelBg",dk),padding:"16px 18px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

                        {/* Cover + caption */}
                        <div style={{gridColumn:"1/-1",display:"flex",gap:16}}>
                          {/* Cover art */}
                          <div style={{width:80,height:80,borderRadius:12,background:`linear-gradient(135deg,${post.coverColor||pc}33,${post.coverColor||pc}66)`,border:`2px solid ${post.coverColor||pc}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontSize:11,fontWeight:800,color:post.coverColor||pc}}>{PLT[post.platform]?.abbr||"?"}</div>
                              <div style={{fontSize:9,color:post.coverColor||pc,marginTop:2}}>{post.ctype}</div>
                            </div>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:10,fontWeight:700,color:tk("accent",dk),letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>Caption</div>
                            <div style={{fontSize:13,color:tk("sub",dk),lineHeight:1.65}}>{post.caption||"—"}</div>
                          </div>
                        </div>

                        {/* Hashtags */}
                        {post.hashtags&&(
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:tk("accent",dk),letterSpacing:1.5,textTransform:"uppercase",marginBottom:6,display:"flex",alignItems:"center",gap:4}}><Icon n="hash" size={11} color={tk("accent",dk)}/>Hashtags</div>
                            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                              {post.hashtags.trim().split(/\s+/).filter(h=>h.startsWith("#")).map(h=>(
                                <span key={h} style={{fontSize:11,background:tk("accentBg",dk),color:tk("accent",dk),borderRadius:20,padding:"2px 9px",fontWeight:600}}>{h}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Scheduled time */}
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:tk("accent",dk),letterSpacing:1.5,textTransform:"uppercase",marginBottom:6,display:"flex",alignItems:"center",gap:4}}><Icon n="clock" size={11} color={tk("accent",dk)}/>Scheduled</div>
                          <div style={{fontSize:13,color:tk("sub",dk)}}>{fmtDate(post.date)} at {post.time}</div>
                        </div>

                        {/* Engagement */}
                        {(+post.likes||+post.comments||+post.shares)?(
                          <div style={{gridColumn:"1/-1"}}>
                            <div style={{fontSize:10,fontWeight:700,color:tk("accent",dk),letterSpacing:1.5,textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><Icon n="heart" size={11} color={tk("accent",dk)}/>Engagement</div>
                            <div style={{display:"flex",gap:20}}>
                              {[["heart",post.likes,"Likes"],["msg",post.comments,"Comments"],["share",post.shares,"Shares"]].map(([ico,val,label])=>(
                                <div key={label} style={{textAlign:"center"}}>
                                  <div style={{fontSize:20,fontWeight:800,color:tk("text",dk)}}>{val}</div>
                                  <div style={{fontSize:10,color:tk("muted",dk),marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><Icon n={ico} size={10} color={tk("muted",dk)}/>{label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ):null}

                        {/* Notes */}
                        {post.notes&&(
                          <div style={{gridColumn:"1/-1"}}>
                            <div style={{fontSize:10,fontWeight:700,color:tk("accent",dk),letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Next Steps</div>
                            <div style={{fontSize:13,color:tk("sub",dk),background:"#f59e0b15",border:"1px solid #f59e0b33",borderLeft:"3px solid #f59e0b",borderRadius:8,padding:"8px 12px"}}>{post.notes}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            CALENDAR VIEW
        ════════════════════════════════════ */}
        {view==="calendar"&&(
          <div style={{padding:"18px 28px 28px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:tk("muted",dk),marginBottom:14}}>
              {weekDates[0].toLocaleDateString("en-US",{month:"long",day:"numeric"})} — {weekDates[6].toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:6}}>
              {weekDates.map((date,i)=>{
                const ds=date.toISOString().slice(0,10);
                const dp=posts.filter(p=>p.date===ds).sort((a,b)=>a.time.localeCompare(b.time));
                const isToday=date.toDateString()===new Date().toDateString();
                return (
                  <div key={i} style={{border:`1.5px solid ${isToday?tk("accent",dk):tk("border",dk)}`,borderRadius:12,minHeight:130,background:isToday?tk("accentBg",dk):tk("cardBg",dk),overflow:"hidden"}}>
                    <div style={{padding:"7px 8px",borderBottom:`1px solid ${tk("border",dk)}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:9,fontWeight:700,color:tk("muted",dk),letterSpacing:1,textTransform:"uppercase"}}>{DAYS_S[date.getDay()]}</span>
                      <span style={{fontSize:13,fontWeight:800,color:isToday?tk("accent",dk):tk("sub",dk)}}>{date.getDate()}</span>
                    </div>
                    <div style={{padding:"4px 4px 6px"}}>
                      {dp.length===0&&<div style={{fontSize:9,color:tk("muted",dk),textAlign:"center",marginTop:14,opacity:0.5}}>—</div>}
                      {dp.map(p=>{
                        const pc2=PLT[p.platform]?.color||"#888";
                        return (
                          <div key={p.id} onClick={()=>openEdit(p)} style={{fontSize:9,padding:"4px 6px",borderRadius:6,marginBottom:3,cursor:"pointer",background:`${p.coverColor||pc2}22`,borderLeft:`2.5px solid ${p.coverColor||pc2}`,overflow:"hidden"}}>
                            <div style={{fontWeight:700,color:p.coverColor||pc2,marginBottom:1,fontSize:8}}>{p.time} · {PLT[p.platform]?.abbr}</div>
                            <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:tk("text",dk),fontWeight:600}}>{p.title}</div>
                            {p.hashtags&&<div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:tk("accent",dk),fontSize:8,marginTop:1}}>{p.hashtags.split(" ")[0]}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            ANALYTICS VIEW
        ════════════════════════════════════ */}
        {view==="analytics"&&(
          <div style={{padding:"18px 28px 28px",display:"flex",flexDirection:"column",gap:16}}>

            {/* Engagement KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[["heart","Total Likes",stats.likes,tk("accent",dk)],["msg","Comments",stats.comments,"#10b981"],["share","Shares",stats.shares,"#f59e0b"]].map(([ico,label,val,col])=>(
                <div key={label} style={{background:tk("panelBg",dk),border:`1px solid ${tk("border",dk)}`,borderRadius:14,padding:"16px",textAlign:"center"}}>
                  <Icon n={ico} size={18} color={col} style={{margin:"0 auto 6px",display:"block"}}/>
                  <div style={{fontSize:26,fontWeight:800,color:col}}>{val}</div>
                  <div style={{fontSize:11,color:tk("muted",dk),marginTop:2}}>{label}</div>
                </div>
              ))}
            </div>

            {/* Posts by Platform */}
            <div style={{border:`1px solid ${tk("border",dk)}`,borderRadius:14,padding:"18px"}}>
              <div style={{fontWeight:700,fontSize:14,color:tk("text",dk),marginBottom:14,display:"flex",alignItems:"center",gap:8}}><Icon n="bar" size={16} color={tk("accent",dk)}/>Posts by Platform</div>
              {Object.entries(stats.byP).sort((a,b)=>b[1]-a[1]).map(([platform,count])=>{
                const pc2=PLT[platform]?.color||"#888";
                const pct=Math.round((count/posts.length)*100);
                return (
                  <div key={platform} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12}}>
                      <span style={{color:tk("sub",dk),fontWeight:600,display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:"50%",background:pc2}}/>{platform}</span>
                      <span style={{color:tk("muted",dk)}}>{count} · {pct}%</span>
                    </div>
                    <div style={{height:7,borderRadius:99,background:tk("panelBg",dk),border:`1px solid ${tk("border",dk)}`,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:99,background:pc2,width:`${pct}%`,transition:"width 0.5s ease"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {/* By Status */}
              <div style={{border:`1px solid ${tk("border",dk)}`,borderRadius:14,padding:"16px"}}>
                <div style={{fontWeight:700,fontSize:13,color:tk("text",dk),marginBottom:12}}>By Status</div>
                {STATUSES.map(s=>{
                  const stm=sm[s];
                  const n=stats.byS[s]||0;
                  if(!n) return null;
                  return (
                    <div key={s} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${tk("divider",dk)}`}}>
                      <span style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}>
                        <span style={{width:8,height:8,borderRadius:"50%",background:stm.bar,flexShrink:0,display:"inline-block"}}/>
                        <span style={{color:tk("sub",dk)}}>{s}</span>
                      </span>
                      <span style={{fontWeight:800,color:stm.bar,fontSize:13}}>{n}</span>
                    </div>
                  );
                })}
              </div>

              {/* By Goal */}
              <div style={{border:`1px solid ${tk("border",dk)}`,borderRadius:14,padding:"16px"}}>
                <div style={{fontWeight:700,fontSize:13,color:tk("text",dk),marginBottom:12}}>By Goal</div>
                {Object.entries(stats.byG).sort((a,b)=>b[1]-a[1]).map(([goal,n])=>(
                  <div key={goal} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${tk("divider",dk)}`}}>
                    <span style={{fontSize:12,color:tk("sub",dk)}}>{goal}</span>
                    <span style={{fontWeight:800,color:tk("accent",dk),fontSize:13}}>{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div style={{border:`1px solid ${tk("border",dk)}`,borderRadius:14,padding:"16px"}}>
              <div style={{fontWeight:700,fontSize:13,color:tk("text",dk),marginBottom:12,display:"flex",alignItems:"center",gap:8}}><Icon n="calendar" size={15} color={tk("accent",dk)}/>Upcoming This Week</div>
              {(()=>{
                const today=new Date(); today.setHours(0,0,0,0);
                const end=new Date(today); end.setDate(today.getDate()+7);
                const up=posts.filter(p=>{const d=new Date(p.date+"T12:00"); return d>=today&&d<=end;}).sort((a,b)=>new Date(a.date)-new Date(b.date));
                if(!up.length) return <div style={{fontSize:13,color:tk("muted",dk),textAlign:"center",padding:"14px 0"}}>Nothing scheduled this week.</div>;
                return up.map(p=>{
                  const pc2=PLT[p.platform]?.color||"#888";
                  const stm=sm[p.status]||sm["Draft"];
                  return (
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${tk("divider",dk)}`}}>
                      <CoverPreview color={p.coverColor||pc2} platform={p.platform} size={36}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:tk("text",dk),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div>
                        <div style={{fontSize:11,color:tk("muted",dk)}}>{fmtDate(p.date)} at {p.time} · {p.ctype}</div>
                      </div>
                      <span style={{fontSize:10,background:stm.bg,color:stm.text,borderRadius:20,padding:"3px 9px",fontWeight:700,flexShrink:0}}>{p.status}</span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Content type mix */}
            <div style={{border:`1px solid ${tk("border",dk)}`,borderRadius:14,padding:"16px"}}>
              <div style={{fontWeight:700,fontSize:13,color:tk("text",dk),marginBottom:12}}>Content Type Mix</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {Object.entries(stats.byCT).sort((a,b)=>b[1]-a[1]).map(([type,n])=>(
                  <div key={type} style={{background:tk("accentBg",dk),borderRadius:20,padding:"5px 13px",fontSize:12,color:tk("accent",dk),fontWeight:700}}>
                    {type} <span style={{opacity:0.6,fontWeight:400}}>×{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {view!=="form"&&(
          <div style={{borderTop:`1px solid ${tk("border",dk)}`,padding:"12px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,background:tk("panelBg",dk)}}>
            <div style={{fontSize:11,color:tk("muted",dk)}}>{posts.length} posts tracked</div>
            <button onClick={openAdd} style={{...pBtn("outline"),padding:"7px 16px",fontSize:12,display:"flex",alignItems:"center",gap:6}}>
              <Icon n="plus" size={13} color={tk("accent",dk)}/> Quick Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

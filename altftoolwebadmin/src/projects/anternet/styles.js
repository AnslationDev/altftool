/** Self-contained premium stylesheet (prefixed .mla-*), themed via host design tokens. */
const css = `
.mla-root{--p:var(--primary,#5b5cff);--p2:var(--accent,#7c3aed);--bg:var(--background,#f4f5fa);--card:var(--surface,#ffffff);--soft:var(--surface-soft,#f6f7fb);--line:var(--border,#e4e6ef);--txt:var(--foreground,#12141f);--mut:var(--muted,#6b7280);
  --ok:#059669;--warn:#d97706;--bad:#e11d48;--r:12px;--shadow:0 1px 2px rgba(16,18,40,.05),0 8px 24px -12px rgba(16,18,40,.10);
  min-height:100vh;background:var(--bg);color:var(--txt);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;-webkit-font-smoothing:antialiased}
.mla-root *{box-sizing:border-box}
.mla-embed{display:block;min-height:auto;background:transparent;padding:18px 20px 48px}

@keyframes mlaUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes mlaPop{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}
@keyframes mlaFade{from{opacity:0}to{opacity:1}}
@keyframes mlaShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

/* ------------------------------- Buttons ------------------------------- */
.mla-btn{display:inline-flex;align-items:center;gap:7px;border:0;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;
  background:linear-gradient(120deg,var(--p),var(--p2));color:#fff;box-shadow:0 2px 8px -2px color-mix(in srgb,var(--p) 55%,transparent);transition:transform .15s,box-shadow .15s,opacity .15s}
.mla-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px -4px color-mix(in srgb,var(--p) 60%,transparent)}
.mla-btn:active{transform:none}
.mla-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.mla-btn-ghost{background:var(--card);color:var(--txt);border:1px solid var(--line);box-shadow:none}
.mla-btn-ghost:hover{border-color:var(--p);color:var(--p);box-shadow:none}
.mla-btn-danger{background:var(--bad);box-shadow:0 2px 8px -2px rgba(225,29,72,.5)}
.mla-btn-danger:hover{box-shadow:0 6px 16px -4px rgba(225,29,72,.55)}
.mla-btn-sm{padding:6px 11px;font-size:12px;border-radius:8px}

/* ------------------------------- Toolbar ------------------------------- */
.mla-pagehead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;animation:mlaUp .3s ease both}
.mla-pagehead h1{margin:0;font-size:20px;line-height:1.25;font-weight:800;color:var(--txt)}
.mla-pagehead p{margin:4px 0 0;font-size:12px;line-height:1.5;color:var(--mut)}
.mla-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:14px;animation:mlaUp .35s ease both}
.mla-search{flex:1;max-width:360px;height:40px;border:1px solid var(--line);border-radius:10px;padding:0 14px;font-size:13px;background:var(--card);color:var(--txt);transition:border .15s,box-shadow .15s}
.mla-search:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 18%,transparent)}
.mla-count{font-size:12px;color:var(--mut);font-weight:600;margin-right:auto;padding-left:2px}

/* -------------------------------- Table -------------------------------- */
.mla-tablewrap{background:var(--card);border:1px solid var(--line);border-radius:var(--r);overflow:auto;box-shadow:var(--shadow);animation:mlaUp .4s ease both}
.mla-table{width:100%;border-collapse:collapse;font-size:13px}
.mla-table th{position:sticky;top:0;z-index:1;text-align:left;padding:11px 14px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);background:var(--soft);border-bottom:1px solid var(--line);white-space:nowrap}
.mla-table td{padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:middle;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mla-table tbody tr{transition:background .12s}
.mla-table tbody tr:hover{background:color-mix(in srgb,var(--p) 4%,var(--card))}
.mla-table tr:last-child td{border-bottom:0}
.mla-mono{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--p);background:color-mix(in srgb,var(--p) 8%,transparent);border-radius:6px;padding:2.5px 7px}
.mla-rowactions{display:flex;gap:6px;justify-content:flex-end;opacity:.45;transition:opacity .15s}
.mla-table tbody tr:hover .mla-rowactions{opacity:1}
.mla-rowmain{display:flex;align-items:center;gap:10px;min-width:0}
.mla-thumb{height:36px;width:36px;flex-shrink:0;border-radius:9px;object-fit:contain;background:var(--soft);border:1px solid var(--line);padding:2px}
.mla-thumb-empty{display:inline-flex;height:36px;width:36px;flex-shrink:0;align-items:center;justify-content:center;border-radius:9px;background:linear-gradient(120deg,color-mix(in srgb,var(--p) 14%,transparent),color-mix(in srgb,var(--p2) 14%,transparent));color:var(--p);font-size:13px;font-weight:800}
.mla-pill{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:700;line-height:1.4}
.mla-pill-on{background:color-mix(in srgb,var(--ok) 13%,transparent);color:var(--ok)}
.mla-pill-off{background:var(--soft);color:var(--mut)}
.mla-pill-brand{background:color-mix(in srgb,var(--p) 12%,transparent);color:var(--p)}

/* ---------------------------- Cards / panels ---------------------------- */
.mla-empty{background:var(--card);border:1.5px dashed var(--line);border-radius:var(--r);padding:44px 28px;text-align:center;font-size:13.5px;animation:mlaUp .4s ease both}
.mla-empty-icon{display:inline-flex;height:52px;width:52px;align-items:center;justify-content:center;border-radius:16px;background:linear-gradient(120deg,color-mix(in srgb,var(--p) 14%,transparent),color-mix(in srgb,var(--p2) 14%,transparent));color:var(--p);margin-bottom:12px}
.mla-muted{color:var(--mut);font-size:12px}
.mla-ok{color:var(--ok);font-size:13px;font-weight:600}
.mla-panelcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;margin-bottom:16px;box-shadow:var(--shadow);animation:mlaUp .4s ease both}
.mla-panelcard h3{margin:0 0 6px;font-size:15px;font-weight:800}
.mla-health{margin:10px 0 0;padding:0;list-style:none;font-size:13px;display:flex;flex-direction:column;gap:8px}
.mla-health li{display:flex;gap:8px;align-items:flex-start;background:color-mix(in srgb,var(--warn) 8%,transparent);border:1px solid color-mix(in srgb,var(--warn) 22%,transparent);color:var(--txt);border-radius:9px;padding:9px 12px}
.mla-log{background:#0e1120;color:#a7f3d0;border-radius:10px;padding:14px;font-size:12px;line-height:1.7;margin-top:14px;max-height:240px;overflow:auto}

/* ------------------------------ Stat cards ------------------------------ */
.mla-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;margin-bottom:18px}
.mla-statcard{position:relative;overflow:hidden;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:16px;text-align:left;cursor:pointer;display:flex;gap:13px;align-items:center;box-shadow:var(--shadow);transition:transform .15s,border-color .15s;animation:mlaUp .4s ease both}
.mla-statcard:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--p) 45%,var(--line))}
.mla-staticon{display:flex;height:44px;width:44px;flex-shrink:0;align-items:center;justify-content:center;border-radius:13px;background:linear-gradient(120deg,var(--p),var(--p2));color:#fff;box-shadow:0 6px 14px -6px color-mix(in srgb,var(--p) 70%,transparent)}
.mla-statbody{display:flex;flex-direction:column;gap:1px;min-width:0}
.mla-statnum{font-size:22px;font-weight:800;letter-spacing:-.02em;color:var(--txt);line-height:1.1}
.mla-statlabel{font-size:12px;font-weight:700;color:var(--txt)}
.mla-statextra{font-size:10.5px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ----------------------------- Modal / form ----------------------------- */
.mla-overlay{position:fixed;inset:0;background:rgba(10,12,24,.5);backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding:4vh 16px;z-index:60;overflow:auto;animation:mlaFade .18s ease both}
.mla-modal{background:var(--card);border-radius:16px;width:100%;max-width:540px;box-shadow:0 32px 80px -12px rgba(0,0,0,.35);animation:mlaPop .22s cubic-bezier(.16,1,.3,1) both}
.mla-modal-wide{max-width:880px}
.mla-modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--line)}
.mla-modal-head h3{margin:0;font-size:15px;font-weight:800}
.mla-x{display:flex;height:30px;width:30px;align-items:center;justify-content:center;border:0;border-radius:8px;background:var(--soft);font-size:13px;cursor:pointer;color:var(--mut);transition:background .12s,color .12s}
.mla-x:hover{background:color-mix(in srgb,var(--bad) 12%,transparent);color:var(--bad)}
.mla-modal-body{padding:20px;max-height:70vh;overflow:auto}
.mla-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid var(--line);background:var(--soft);border-radius:0 0 16px 16px}
.mla-form{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
.mla-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.mla-field-full{grid-column:1/-1}
.mla-field>label{font-size:11px;font-weight:800;letter-spacing:.02em;color:var(--txt)}
.mla-field>label em{color:var(--bad);font-style:normal}
.mla-field input[type=text],.mla-field input[type=number],.mla-field input[type=email],.mla-field input[type=password],.mla-field textarea,.mla-field select,.mla-kv input,.mla-tags input,.mla-img-ctl input{border:1.5px solid var(--line);border-radius:9px;padding:9px 11px;font-size:13px;background:var(--card);color:var(--txt);width:100%;transition:border .15s,box-shadow .15s}
.mla-field input:focus,.mla-field textarea:focus,.mla-field select:focus,.mla-kv input:focus,.mla-img-ctl input:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 16%,transparent)}
.mla-field input:disabled{background:var(--soft);color:var(--mut)}
.mla-hint{margin:0;font-size:10.5px;color:var(--mut);line-height:1.5}
.mla-err{margin:0;font-size:11px;color:var(--bad);font-weight:700}
.mla-switch{display:inline-flex;align-items:center;gap:9px;font-size:13px;font-weight:600;padding:5px 0;cursor:pointer;user-select:none}
.mla-switch input{appearance:none;width:38px;height:22px;border-radius:999px;background:var(--line);position:relative;cursor:pointer;transition:background .18s;flex-shrink:0}
.mla-switch input:checked{background:linear-gradient(120deg,var(--p),var(--p2))}
.mla-switch input::after{content:"";position:absolute;top:3px;left:3px;height:16px;width:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .18s}
.mla-switch input:checked::after{transform:translateX(16px)}

/* --------------------------- Composite inputs --------------------------- */
.mla-tags{display:flex;flex-wrap:wrap;gap:6px;border:1.5px solid var(--line);border-radius:9px;padding:7px;background:var(--card)}
.mla-tags:focus-within{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 16%,transparent)}
.mla-tags input{border:0!important;box-shadow:none!important;flex:1;min-width:110px;padding:4px!important;background:transparent!important}
.mla-chip{display:inline-flex;align-items:center;gap:6px;background:color-mix(in srgb,var(--p) 11%,transparent);color:var(--p);border-radius:7px;padding:4px 9px;font-size:12px;font-weight:700}
.mla-chip button{display:flex;border:0;background:transparent;cursor:pointer;color:inherit;font-size:10px;opacity:.7}
.mla-chip button:hover{opacity:1}
.mla-list{display:flex;flex-direction:column;gap:8px}
.mla-list-row{display:flex;gap:6px}
.mla-list-row textarea{flex:1}
.mla-list-ctl{display:flex;flex-direction:column;gap:3px}
.mla-list-ctl button{border:1px solid var(--line);background:var(--card);border-radius:7px;width:25px;height:23px;font-size:11px;cursor:pointer;color:var(--mut);transition:all .12s}
.mla-list-ctl button:hover:not(:disabled){border-color:var(--p);color:var(--p)}
.mla-list-ctl button:disabled{opacity:.3}
.mla-kv{display:flex;gap:6px}
.mla-kv button{border:1px solid var(--line);background:var(--card);border-radius:7px;width:32px;cursor:pointer;color:var(--mut)}
.mla-kv button:hover{border-color:var(--bad);color:var(--bad)}
.mla-img{display:flex;flex-direction:column;gap:8px}
.mla-img-preview{height:88px;width:88px;object-fit:contain;border:1.5px solid var(--line);border-radius:12px;background:var(--soft);padding:6px}
.mla-img-empty{display:flex;height:88px;width:88px;align-items:center;justify-content:center;border:1.5px dashed var(--line);border-radius:12px;font-size:11px;color:var(--mut);background:var(--soft)}
.mla-img-ctl{display:flex;gap:8px;align-items:center}
.mla-img-ctl label{white-space:nowrap;display:inline-flex;align-items:center;cursor:pointer}
.mla-video-field{display:flex;flex-direction:column;gap:8px}
.mla-video-box{width:100%;max-width:420px;aspect-ratio:16/9;border:1.5px solid var(--line);border-radius:12px;background:var(--soft);overflow:hidden;display:flex;align-items:center;justify-content:center}
.mla-video-box video,.mla-video-box iframe{width:100%;height:100%;border:0;display:block}
.mla-video-empty{display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:var(--mut);text-align:center;padding:10px}
.mla-progress{height:6px;border-radius:999px;background:var(--line);overflow:hidden}
.mla-progress>span{display:block;height:100%;background:linear-gradient(120deg,var(--p),var(--p2));transition:width .2s ease}
.mla-objlist{display:flex;flex-direction:column;gap:10px}
.mla-objrow{display:flex;gap:10px;border:1px solid var(--line);border-radius:11px;padding:12px;background:var(--soft)}
.mla-objfields{flex:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.mla-field-inline label{font-size:10px;color:var(--mut);font-weight:700}
.mla-group{display:grid;grid-template-columns:1fr 1fr;gap:12px;border:1px solid var(--line);border-radius:11px;padding:14px;background:var(--soft)}
.mla-color{display:flex;gap:8px;align-items:center}
.mla-color input[type=color]{width:38px;height:38px;padding:2px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);cursor:pointer;flex-shrink:0}
.mla-color input[type=text]{flex:1}
.mla-bgfield{display:flex;flex-direction:column;gap:0;border:1px solid var(--line);border-radius:11px;padding:14px;background:var(--soft)}
.mla-bgfield>select{border:1.5px solid var(--line);border-radius:9px;padding:9px 11px;font-size:13px;background:var(--card);color:var(--txt)}
.mla-field-spaced{margin-top:8px}

/* ------------------------------ Settings tabs --------------------------- */
.mla-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;animation:mlaUp .35s ease both}
.mla-tabs button{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--card);color:var(--mut);border-radius:10px;padding:9px 15px;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s}
.mla-tabs button:hover{border-color:var(--p);color:var(--p)}
.mla-tabs button.on{background:linear-gradient(120deg,var(--p),var(--p2));color:#fff;border-color:transparent;box-shadow:0 4px 12px -4px color-mix(in srgb,var(--p) 60%,transparent)}
.mla-settings{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;box-shadow:var(--shadow);animation:mlaUp .4s ease both}

/* ------------------------------- Skeleton ------------------------------- */
.mla-skel{border-radius:9px;background:linear-gradient(90deg,var(--soft) 25%,color-mix(in srgb,var(--line) 55%,var(--soft)) 50%,var(--soft) 75%);background-size:200% 100%;animation:mlaShimmer 1.4s linear infinite}

/* -------------------------------- Toast --------------------------------- */
.mla-toast{position:fixed;bottom:22px;right:22px;z-index:80;display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:700;color:#fff;box-shadow:0 16px 40px -8px rgba(0,0,0,.35);animation:mlaPop .25s cubic-bezier(.16,1,.3,1) both}
.mla-toast-ok{background:linear-gradient(120deg,#059669,#10b981)}
.mla-toast-err{background:linear-gradient(120deg,#e11d48,#f43f5e)}

/* -------------------------------- Login --------------------------------- */
.mla-login{margin:auto;width:100%;max-width:390px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:30px;box-shadow:var(--shadow);animation:mlaPop .3s ease both}
.mla-login h2{margin:14px 0 4px;font-size:18px;font-weight:800}
.mla-login p{margin:0 0 18px;font-size:12.5px;color:var(--mut);line-height:1.6}
.mla-login form{display:flex;flex-direction:column;gap:10px}
.mla-login input{border:1.5px solid var(--line);border-radius:10px;padding:11px 13px;font-size:13px;background:var(--card);color:var(--txt)}
.mla-login input:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 16%,transparent)}
.mla-logo{width:40px;height:40px;border-radius:12px;background:linear-gradient(120deg,var(--p),var(--p2));display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 8px 18px -6px color-mix(in srgb,var(--p) 65%,transparent)}
.mla-skip{margin-top:14px;text-align:center}

@media(max-width:900px){.mla-form{grid-template-columns:1fr}.mla-cards{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.mla-embed{padding:12px 12px 40px}.mla-search{max-width:none;min-width:100%}.mla-count{order:3}.mla-toolbar .mla-btn{margin-left:auto}}
`;
export default css;

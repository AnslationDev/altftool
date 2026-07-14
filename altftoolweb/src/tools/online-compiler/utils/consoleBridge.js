// Returns an IIFE script string that forwards console output and runtime
// errors from the preview iframe to the parent window via postMessage.
export function buildBridgeScript(token) {
  return `(function(){
  var TOKEN = ${JSON.stringify(token)};
  function serialize(a){
    try {
      if (typeof a === "string") return a;
      if (a instanceof Error) return a.stack || a.message;
      return JSON.stringify(a, null, 2);
    } catch (e) { return String(a); }
  }
  function post(level, args){
    try {
      var text = Array.prototype.map.call(args, serialize).join(" ");
      parent.postMessage({ __oc: TOKEN, type: "console", level: level, text: text, time: Date.now() }, "*");
    } catch (e) {}
  }
  ["log","info","debug","warn","error"].forEach(function(m){
    var orig = console[m] ? console[m].bind(console) : function(){};
    console[m] = function(){ post(m === "debug" ? "log" : m, arguments); orig.apply(console, arguments); };
  });
  window.addEventListener("error", function(e){
    var msg = (e.message || "Error");
    if (e.lineno) msg += " (line " + e.lineno + ":" + (e.colno || 0) + ")";
    parent.postMessage({ __oc: TOKEN, type: "error", level: "error", text: msg, time: Date.now() }, "*");
  });
  window.addEventListener("unhandledrejection", function(e){
    var r = e.reason;
    parent.postMessage({ __oc: TOKEN, type: "error", level: "error", text: "Unhandled rejection: " + (r && r.message ? r.message : String(r)), time: Date.now() }, "*");
  });
})();`;
}

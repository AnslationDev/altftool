/**
 * Apache .htaccess to NGINX configuration converter.
 *
 * What the rules are based on
 * ---------------------------
 * 1. Apache mod_rewrite matches a RewriteRule pattern against the URL path *without* the leading
 *    slash when the rule sits in a .htaccess file (per-directory context), while NGINX `rewrite`
 *    matches against the normalised URI which always starts with "/". Every anchored pattern
 *    therefore gains a slash after the "^".
 * 2. mod_rewrite server variables (%{HTTP_HOST}, %{REQUEST_URI} ...) map onto NGINX embedded
 *    variables ($host, $request_uri ...). The mapping table below is the documented equivalence.
 * 3. RewriteRule flags map onto NGINX rewrite flags: [R=301] -> permanent, [R] or [R=302] ->
 *    redirect, [L] -> last, [F] -> return 403, [G] -> return 410.
 * 4. NGINX appends the original query string to a rewritten URI automatically unless the
 *    replacement itself contains a "?", which is what Apache's [QSA] flag does explicitly.
 * 5. NGINX has no way to AND several conditions in one `if`, and `if` cannot be nested. Multiple
 *    RewriteCond lines are therefore reported instead of silently mistranslated.
 * 6. The "file does not exist, hand it to a front controller" idiom
 *      RewriteCond %{REQUEST_FILENAME} !-f
 *      RewriteCond %{REQUEST_FILENAME} !-d
 *      RewriteRule . index.php [L]
 *    has an exact NGINX equivalent in `try_files`, which is preferred over an `if`.
 *
 * The converter is deliberately conservative: anything it cannot translate faithfully is emitted
 * as a comment plus a warning rather than as a guess.
 */

/** Longest input accepted, to keep the single-pass parser responsive in the browser. */
export const MAX_INPUT_LENGTH = 200000;

/** mod_rewrite server variables and their NGINX embedded-variable equivalents. */
export const APACHE_VARIABLE_MAP = {
  "HTTP_HOST": "$host",
  "HTTP_USER_AGENT": "$http_user_agent",
  "HTTP_REFERER": "$http_referer",
  "HTTP_COOKIE": "$http_cookie",
  "HTTP_ACCEPT": "$http_accept",
  "REQUEST_URI": "$request_uri",
  "REQUEST_METHOD": "$request_method",
  "REQUEST_FILENAME": "$request_filename",
  "QUERY_STRING": "$args",
  "SERVER_NAME": "$server_name",
  "SERVER_ADDR": "$server_addr",
  "SERVER_PORT": "$server_port",
  "REMOTE_ADDR": "$remote_addr",
  "REMOTE_HOST": "$remote_addr",
  "DOCUMENT_ROOT": "$document_root",
  "THE_REQUEST": "$request",
  "HTTPS": "$scheme",
};

/** Apache "access plus N unit" expiry words and their NGINX `expires` suffixes. */
export const EXPIRES_UNIT_MAP = {
  second: "s",
  seconds: "s",
  minute: "m",
  minutes: "m",
  hour: "h",
  hours: "h",
  day: "d",
  days: "d",
  week: "w",
  weeks: "w",
  month: "M",
  months: "M",
  year: "y",
  years: "y",
};

/**
 * mod_expires works on MIME types; NGINX `expires` lives in a location, which matches on the URI.
 * These are the file extensions NGINX itself maps to each MIME type in the default mime.types.
 */
export const MIME_EXTENSION_MAP = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
  "image/svg+xml": ["svg", "svgz"],
  "image/x-icon": ["ico"],
  "image/vnd.microsoft.icon": ["ico"],
  "text/css": ["css"],
  "text/html": ["html", "htm"],
  "text/plain": ["txt"],
  "text/javascript": ["js", "mjs"],
  "application/javascript": ["js", "mjs"],
  "application/x-javascript": ["js"],
  "application/json": ["json"],
  "application/pdf": ["pdf"],
  "application/font-woff": ["woff"],
  "font/woff": ["woff"],
  "font/woff2": ["woff2"],
  "font/ttf": ["ttf"],
  "application/x-font-ttf": ["ttf"],
  "video/mp4": ["mp4"],
  "audio/mpeg": ["mp3"],
};

const INDENT = "    ";

/** Split a directive line into whitespace-separated arguments, honouring double quotes. */
export function splitArgs(line) {
  const args = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (!quoted && /\s/.test(char)) {
      if (current !== "") {
        args.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }
  if (current !== "") args.push(current);
  return args;
}

/** Replace %{VAR} references with the matching NGINX variable. Unknown names are left visible. */
export function mapApacheVariables(text) {
  return String(text).replace(/%\{(?:HTTP:)?([A-Za-z0-9_-]+)\}/g, (match, name) => {
    const key = name.toUpperCase();
    if (APACHE_VARIABLE_MAP[key]) return APACHE_VARIABLE_MAP[key];
    if (match.startsWith("%{HTTP:")) return `$http_${name.toLowerCase().replace(/-/g, "_")}`;
    return `$${name.toLowerCase()}`;
  });
}

/** Apache backreferences %1..%9 (from RewriteCond) become NGINX $1..$9 from the last regex. */
function mapCondBackreferences(text) {
  return String(text).replace(/%([1-9])/g, "$$$1");
}

/** Parse the bracketed flag list of a RewriteRule into a lookup object. */
export function parseRewriteFlags(raw) {
  const flags = {};
  if (!raw) return flags;
  const inner = raw.replace(/^\[/, "").replace(/\]$/, "");
  for (const piece of inner.split(",")) {
    const token = piece.trim();
    if (!token) continue;
    const [key, value] = token.split("=");
    flags[key.toUpperCase()] = value === undefined ? true : value;
  }
  return flags;
}

/**
 * Turn an Apache per-directory rewrite pattern into an NGINX URI pattern.
 * "^(.*)$" becomes "^/(.*)$" because NGINX always sees the leading slash.
 */
export function normaliseRewritePattern(pattern, caseInsensitive) {
  let next = String(pattern);
  if (next.startsWith("^") && !next.startsWith("^/")) {
    next = `^/${next.slice(1)}`;
  }
  if (caseInsensitive && !next.startsWith("(?i)")) {
    next = `(?i)${next}`;
  }
  return next;
}

/** Ensure a rewrite target is absolute (leading slash) unless it is a full URL. */
export function normaliseSubstitution(substitution) {
  const value = String(substitution);
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value;
  if (value === "-") return value;
  return value.startsWith("/") ? value : `/${value}`;
}

function isFrontControllerCond(cond) {
  return (
    /%\{REQUEST_FILENAME\}/i.test(cond.test) && (cond.pattern === "!-f" || cond.pattern === "!-d")
  );
}

function isHttpsOffCond(cond) {
  const test = cond.test.toUpperCase();
  if (test !== "%{HTTPS}") return false;
  const pattern = cond.pattern.toLowerCase();
  return pattern === "off" || pattern === "!on" || pattern === "^off$";
}

function condToNginxIf(cond) {
  const negatedFileTest = /^!?-[fdsl]$/.test(cond.pattern);
  if (negatedFileTest) {
    const variable = mapApacheVariables(cond.test);
    const negated = cond.pattern.startsWith("!");
    const test = cond.pattern.replace("!", "");
    return `if (${negated ? "!" : ""}${test} ${variable})`;
  }
  const variable = mapApacheVariables(cond.test);
  const noCase = /\[.*NC.*\]/i.test(cond.flags || "");
  const negated = cond.pattern.startsWith("!");
  const pattern = negated ? cond.pattern.slice(1) : cond.pattern;
  const operator = `${negated ? "!" : ""}${noCase ? "~*" : "~"}`;
  return `if (${variable} ${operator} "${pattern}")`;
}

function convertExpires(value) {
  const match = String(value).match(/access\s+plus\s+(\d+)\s+([a-z]+)/i);
  if (!match) return null;
  const suffix = EXPIRES_UNIT_MAP[match[2].toLowerCase()];
  if (!suffix) return null;
  return `${match[1]}${suffix}`;
}

/**
 * Convert an .htaccess file into starter NGINX directives.
 *
 * @param {string} source            The .htaccess text.
 * @param {object} [options]
 * @param {boolean} [options.wrapServer]  Wrap the output in a server { } block.
 * @param {string}  [options.serverName]
 * @param {string}  [options.root]
 * @param {boolean} [options.keepComments] Carry the original # comments through.
 * @returns {{ config: string, warnings: string[], directiveCount: number, unsupported: string[] }}
 *          or { error } when there is nothing to convert.
 */
export function convertHtaccess(source, options = {}) {
  const {
    wrapServer = true,
    serverName = "example.com",
    root = "/var/www/html",
    keepComments = true,
  } = options;

  if (typeof source !== "string") {
    return { error: "Paste the contents of an .htaccess file to convert." };
  }
  const text = source.trim();
  if (text === "") {
    return { error: "Paste the contents of an .htaccess file to convert." };
  }
  if (source.length > MAX_INPUT_LENGTH) {
    return {
      error: `That file is ${source.length} characters. Split it up — this converter handles up to ${MAX_INPUT_LENGTH}.`,
    };
  }

  const warnings = [];
  const unsupported = [];
  const body = [];
  const locationBlocks = [];
  let directiveCount = 0;

  let pendingConds = [];
  let containerStack = [];

  const pushWarning = (message) => {
    if (!warnings.includes(message)) warnings.push(message);
  };

  const emit = (line) => {
    if (containerStack.length > 0) {
      containerStack[containerStack.length - 1].lines.push(line);
    } else {
      body.push(line);
    }
  };

  const lines = source.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") continue;

    if (line.startsWith("#")) {
      if (keepComments) emit(line);
      continue;
    }

    // Container close tags.
    const closeMatch = line.match(/^<\/([A-Za-z]+)\s*>$/);
    if (closeMatch) {
      const container = containerStack.pop();
      if (container && container.kind === "location" && container.lines.length > 0) {
        locationBlocks.push(container);
      } else if (container && container.lines.length > 0) {
        for (const inner of container.lines) emit(inner);
      }
      continue;
    }

    // Container open tags.
    const openMatch = line.match(/^<([A-Za-z]+)\s*([^>]*)>$/);
    if (openMatch) {
      const tag = openMatch[1].toLowerCase();
      const argument = openMatch[2].trim().replace(/^"|"$/g, "");
      if (tag === "ifmodule" || tag === "directory" || tag === "ifversion") {
        // Transparent: NGINX has no equivalent guard, the contents still apply.
        containerStack.push({ kind: "transparent", lines: [] });
      } else if (tag === "files" || tag === "filesmatch") {
        const selector =
          tag === "files"
            ? `location ~ ${argument.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`
            : `location ~ ${argument}`;
        containerStack.push({ kind: "location", selector, lines: [] });
      } else if (tag === "limit" || tag === "limitexcept") {
        pushWarning(
          `<${openMatch[1]}> was skipped. In NGINX use "limit_except" inside the relevant location block.`,
        );
        containerStack.push({ kind: "drop", lines: [] });
      } else {
        unsupported.push(line);
        containerStack.push({ kind: "drop", lines: [] });
      }
      continue;
    }

    const args = splitArgs(line);
    const directive = args[0].toLowerCase();

    switch (directive) {
      case "rewriteengine":
      case "rewritebase":
      case "options": {
        if (directive === "options") {
          const value = (args[1] || "").toLowerCase();
          if (value.includes("indexes")) {
            emit(`autoindex ${value.startsWith("-") ? "off" : "on"};`);
            directiveCount += 1;
          } else {
            emit(`# ${line}  (no NGINX equivalent)`);
          }
        } else if (directive === "rewritebase") {
          pushWarning(
            `RewriteBase ${args[1] || "/"} has no NGINX equivalent — rewrite targets below are already absolute paths.`,
          );
        }
        continue;
      }

      case "rewritecond": {
        pendingConds.push({
          test: args[1] || "",
          pattern: args[2] || "",
          flags: args[3] || "",
        });
        continue;
      }

      case "rewriterule": {
        const pattern = args[1] || "";
        const substitution = args[2] || "";
        const flags = parseRewriteFlags(args[3] || "");
        const conds = pendingConds;
        pendingConds = [];

        // 1. HTTPS redirect idiom.
        if (conds.length === 1 && isHttpsOffCond(conds[0]) && /^https:\/\//i.test(substitution)) {
          emit("if ($scheme = http) {");
          emit(`${INDENT}return 301 https://$host$request_uri;`);
          emit("}");
          directiveCount += 1;
          pushWarning(
            "The HTTPS redirect was emitted as a return 301. On NGINX it is cheaper to give port 80 its own server block that only does this redirect.",
          );
          continue;
        }

        // 2. Strip-www idiom: the host capture is what NGINX can reach inside the if.
        if (
          conds.length === 1 &&
          /%\{HTTP_HOST\}/i.test(conds[0].test) &&
          /^\^?www\\?\./i.test(conds[0].pattern) &&
          /%1/.test(substitution)
        ) {
          const scheme = /^https:\/\//i.test(substitution) ? "https" : "$scheme";
          emit('if ($host ~* "^www\\.(.+)$") {');
          emit(`${INDENT}return ${flags.R === "301" ? "301" : "302"} ${scheme}://$1$request_uri;`);
          emit("}");
          directiveCount += 1;
          pushWarning(
            "The strip-www rule became a return using $1 from the host match, because inside an NGINX if block $1 refers to that if's own capture, not the rule's.",
          );
          continue;
        }

        // 3. Front-controller idiom -> try_files.
        if (conds.length > 0 && conds.every(isFrontControllerCond)) {
          const target = normaliseSubstitution(substitution);
          emit(`try_files $uri $uri/ ${target}${flags.QSA ? "?$query_string" : ""};`);
          directiveCount += 1;
          pushWarning(
            "The !-f / !-d front-controller rules became a single try_files, which is the idiomatic NGINX form.",
          );
          continue;
        }

        const noCase = Boolean(flags.NC);
        const nginxPattern = normaliseRewritePattern(pattern, noCase);
        const target = mapCondBackreferences(mapApacheVariables(normaliseSubstitution(substitution)));

        // Forbidden / gone become their own location, so the URI pattern is honoured.
        if (flags.F || flags.G) {
          locationBlocks.push({
            kind: "location",
            selector: `location ~ ${nginxPattern}`,
            lines: [`return ${flags.F ? "403" : "410"};`],
          });
          directiveCount += 1;
          if (conds.length > 0) {
            pushWarning(
              `The RewriteCond lines in front of "${pattern}" were dropped: a ${flags.F ? "403" : "410"} became a location block, which cannot carry them. Re-add them by hand.`,
            );
          }
          continue;
        }

        if (/%[1-9]/.test(substitution)) {
          pushWarning(
            "Apache %1 (a RewriteCond capture) and $1 (a RewriteRule capture) both look like $1 in NGINX, and inside an if block $1 is the if's own capture. Check every backreference in the output.",
          );
        }

        const ifLines = conds.map(condToNginxIf);
        if (conds.length > 1) {
          pushWarning(
            "Several RewriteCond lines applied to one rule. NGINX cannot AND conditions in a single if, and if blocks cannot nest — merge them by hand, usually with a map block.",
          );
        }

        const openIf = ifLines.length > 0;
        if (openIf) {
          for (const ifLine of ifLines) emit(`${ifLine} {`);
        }
        const pad = openIf ? INDENT.repeat(ifLines.length) : "";

        if (flags.P) {
          emit(`${pad}# ${line}`);
          pushWarning(
            "The [P] proxy flag has no rewrite equivalent — use proxy_pass inside a location block instead.",
          );
        } else if (substitution === "-") {
          emit(`${pad}# ${line}  (no substitution; only the flags mattered)`);
        } else {
          const redirectCode = flags.R === true ? "302" : flags.R;
          let suffix = "";
          if (redirectCode === "301") suffix = " permanent";
          else if (redirectCode) suffix = " redirect";
          else if (flags.L || flags.END) suffix = " last";
          emit(`${pad}rewrite ${nginxPattern} ${target}${suffix};`);
        }
        directiveCount += 1;

        if (openIf) {
          for (let index = ifLines.length - 1; index >= 0; index -= 1) {
            emit(`${INDENT.repeat(index)}}`);
          }
        }
        if (flags.QSA && target.includes("?")) {
          pushWarning(
            "[QSA] with a query string in the target: NGINX drops the original query string once the replacement contains a ?, so append $args yourself.",
          );
        }
        continue;
      }

      case "redirect":
      case "redirectpermanent":
      case "redirectmatch": {
        let code = "302";
        let from;
        let to;
        if (directive === "redirectpermanent") {
          code = "301";
          from = args[1];
          to = args[2];
        } else if (/^\d{3}$/.test(args[1] || "")) {
          code = args[1];
          from = args[2];
          to = args[3];
        } else {
          from = args[1];
          to = args[2];
        }
        if (!from || !to) {
          unsupported.push(line);
          continue;
        }
        if (directive === "redirectmatch") {
          emit(`rewrite ${normaliseRewritePattern(from, false)} ${to} ${code === "301" ? "permanent" : "redirect"};`);
        } else {
          emit(`location = ${normaliseSubstitution(from)} { return ${code} ${to}; }`);
        }
        directiveCount += 1;
        continue;
      }

      case "errordocument": {
        const code = args[1];
        const target = args[2];
        if (!code || !target) {
          unsupported.push(line);
          continue;
        }
        emit(`error_page ${code} ${normaliseSubstitution(target)};`);
        directiveCount += 1;
        continue;
      }

      case "directoryindex": {
        emit(`index ${args.slice(1).join(" ")};`);
        directiveCount += 1;
        continue;
      }

      case "addtype": {
        const type = args[1];
        const extensions = args.slice(2).map((item) => item.replace(/^\./, ""));
        if (!type || extensions.length === 0) {
          unsupported.push(line);
          continue;
        }
        emit(`types { ${type} ${extensions.join(" ")}; }`);
        directiveCount += 1;
        continue;
      }

      case "adddefaultcharset": {
        emit(`charset ${args[1]};`);
        directiveCount += 1;
        continue;
      }

      case "header": {
        const parts = args.slice(1);
        const always = parts[0]?.toLowerCase() === "always";
        const rest = always ? parts.slice(1) : parts;
        const action = (rest[0] || "").toLowerCase();
        if (action !== "set" && action !== "append" && action !== "add") {
          emit(`# ${line}  (only Header set/add/append convert cleanly)`);
          continue;
        }
        const name = rest[1];
        const value = rest.slice(2).join(" ");
        if (!name) {
          unsupported.push(line);
          continue;
        }
        emit(`add_header ${name} "${value}"${always ? " always" : ""};`);
        directiveCount += 1;
        continue;
      }

      case "expiresactive": {
        continue;
      }

      case "expiresdefault": {
        const value = convertExpires(args.slice(1).join(" "));
        if (!value) {
          unsupported.push(line);
          continue;
        }
        emit(`expires ${value};`);
        directiveCount += 1;
        continue;
      }

      case "expiresbytype": {
        const value = convertExpires(args.slice(2).join(" "));
        if (!value) {
          unsupported.push(line);
          continue;
        }
        const mime = (args[1] || "").toLowerCase();
        const extensions = MIME_EXTENSION_MAP[mime];
        if (!extensions) {
          pushWarning(
            `ExpiresByType ${args[1]} was skipped: NGINX matches locations on the URI, not the MIME type, and this type has no obvious file extension.`,
          );
          unsupported.push(line);
          continue;
        }
        locationBlocks.push({
          kind: "location",
          selector: `location ~* \\.(${extensions.join("|")})$`,
          lines: [`expires ${value};`],
        });
        pushWarning(
          `ExpiresByType ${args[1]} became a location matching .${extensions.join(" / .")} files, because NGINX matches on the URI rather than on the MIME type.`,
        );
        directiveCount += 1;
        continue;
      }

      case "fileetag": {
        emit(`etag ${(args[1] || "").toLowerCase() === "none" ? "off" : "on"};`);
        directiveCount += 1;
        continue;
      }

      case "deny": {
        const target = args[args.length - 1];
        emit(`deny ${target === "all" ? "all" : target};`);
        directiveCount += 1;
        continue;
      }

      case "allow": {
        const target = args[args.length - 1];
        emit(`allow ${target === "all" ? "all" : target};`);
        directiveCount += 1;
        continue;
      }

      case "require": {
        const kind = (args[1] || "").toLowerCase();
        if (kind === "all" && (args[2] || "").toLowerCase() === "denied") {
          emit("deny all;");
        } else if (kind === "all") {
          emit("allow all;");
        } else if (kind === "ip") {
          emit(`allow ${args.slice(2).join(" ")};`);
        } else if (kind === "valid-user") {
          emit('auth_basic "Restricted";');
        } else {
          unsupported.push(line);
          continue;
        }
        directiveCount += 1;
        continue;
      }

      case "order":
      case "satisfy": {
        emit(`# ${line}  (NGINX evaluates allow/deny top to bottom, first match wins)`);
        continue;
      }

      case "authname": {
        emit(`auth_basic "${args.slice(1).join(" ")}";`);
        directiveCount += 1;
        continue;
      }

      case "authuserfile": {
        emit(`auth_basic_user_file ${args[1]};`);
        directiveCount += 1;
        continue;
      }

      case "authtype": {
        continue;
      }

      case "limitrequestbody": {
        emit(`client_max_body_size ${args[1]};`);
        directiveCount += 1;
        continue;
      }

      case "serversignature": {
        emit(`server_tokens ${(args[1] || "").toLowerCase() === "off" ? "off" : "on"};`);
        directiveCount += 1;
        continue;
      }

      case "php_value":
      case "php_flag":
      case "php_admin_value":
      case "php_admin_flag": {
        pushWarning(
          `${args[0]} settings cannot live in NGINX config — set them in php.ini, in the PHP-FPM pool, or pass them with fastcgi_param PHP_VALUE.`,
        );
        unsupported.push(line);
        continue;
      }

      default: {
        unsupported.push(line);
        continue;
      }
    }
  }

  // Any container left open at EOF is still flushed so nothing is silently lost.
  while (containerStack.length > 0) {
    const container = containerStack.pop();
    if (container.kind === "location" && container.lines.length > 0) {
      locationBlocks.push(container);
    } else if (container.kind === "transparent") {
      for (const inner of container.lines) body.push(inner);
    }
  }

  if (pendingConds.length > 0) {
    pushWarning("A RewriteCond at the end of the file had no RewriteRule after it, so it was dropped.");
  }
  if (unsupported.length > 0) {
    pushWarning(
      unsupported.length === 1
        ? "1 line had no safe NGINX equivalent and was left as a comment at the bottom."
        : `${unsupported.length} lines had no safe NGINX equivalent and were left as comments at the bottom.`,
    );
  }

  const inner = [];
  if (wrapServer) {
    inner.push("listen 80;");
    inner.push(`server_name ${serverName};`);
    inner.push(`root ${root};`);
    inner.push("");
  }
  inner.push(...body);
  for (const block of locationBlocks) {
    inner.push("");
    inner.push(`${block.selector} {`);
    for (const blockLine of block.lines) inner.push(`${INDENT}${blockLine}`);
    inner.push("}");
  }
  if (unsupported.length > 0) {
    inner.push("");
    inner.push("# --- not converted, no safe NGINX equivalent ---");
    for (const item of unsupported) inner.push(`# ${item}`);
  }

  const header = [
    "# Converted from .htaccess. Review every line before reloading NGINX.",
    "# NGINX reads config once at start-up, so there is no per-directory .htaccess equivalent:",
    "# these directives belong in the server or location block, not in the web root.",
  ];

  const config = wrapServer
    ? [...header, "server {", ...inner.map((item) => (item === "" ? "" : `${INDENT}${item}`)), "}"].join("\n")
    : [...header, ...inner].join("\n");

  return {
    config: `${config}\n`,
    warnings,
    unsupported,
    directiveCount,
    locationCount: locationBlocks.length,
  };
}

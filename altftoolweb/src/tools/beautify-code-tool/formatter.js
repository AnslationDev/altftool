/**
 * Logic for formatting and minifying code.
 * (Pure JavaScript, no UI dependencies)
 */

export const formatters = {
  json: {
    beautify: (code) => {
      try { return JSON.stringify(JSON.parse(code), null, 2); }
      catch (e) { return "Error: Invalid JSON"; }
    },
    minify: (code) => {
      try { return JSON.stringify(JSON.parse(code)); }
      catch (e) { return "Error: Invalid JSON"; }
    }
  },
  html: {
    beautify: (code) => {
      let formatted = '', pad = 0;
      const xmlString = code.replace(/>\s*</g, "><").trim();
      xmlString.split(/(?=<)|(?<=>)/).forEach((node) => {
         let indent = 0;
         if (node.match(/.+<\/\w[^>]*>$/)) indent = 0;
         else if (node.match(/^<\/\w/)) { if (pad !== 0) pad -= 1; }
         else if (node.match(/^<\w[^>]*[^\/]>.*$/)) indent = 1;

         formatted += '  '.repeat(pad) + node + '\r\n';
         pad += indent;
      });
      return formatted.trim();
    },
    minify: (code) => code.replace(/\>[\r\n ]+\</g, "><").replace(/(<.*?>)|\s+/g, (m, $1) => $1 ? $1 : ' ').trim()
  },
  xml: {
    beautify: (code) => {
        let formatted = '', pad = 0;
        const xmlString = code.replace(/>\s*</g, "><").trim();
        xmlString.split(/(?=<)|(?<=>)/).forEach((node) => {
           let indent = 0;
           if (node.match(/.+<\/\w[^>]*>$/)) indent = 0;
           else if (node.match(/^<\/\w/)) { if (pad !== 0) pad -= 1; }
           else if (node.match(/^<\w[^>]*[^\/]>.*$/)) indent = 1;

           formatted += '  '.repeat(pad) + node + '\r\n';
           pad += indent;
        });
        return formatted.trim();
    },
    minify: (code) => code.replace(/\>[\r\n ]+\</g, "><").replace(/(<.*?>)|\s+/g, (m, $1) => $1 ? $1 : ' ').trim()
  },
  sql: {
    beautify: (code) => {
      return code
        .replace(/\s+/g, ' ')
        .replace(/\s+(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|LIMIT|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|JOIN|LEFT JOIN|INNER JOIN|ON|HAVING|CREATE TABLE|ALTER TABLE)\s+/gi, (match) => "\n" + match.trim().toUpperCase() + " ")
        .replace(/\s*(,)\s*/g, ",\n  ")
        .replace(/\(\s*/g, "(\n  ")
        .replace(/\s*\)/g, "\n)").trim();
    },
    minify: (code) => code.replace(/\s+/g, ' ').trim()
  },
  css: {
    beautify: (code) => code.replace(/\s*\{\s*/g, " {\n  ").replace(/;\s*/g, ";\n  ").replace(/\s*\}\s*/g, "\n}\n").replace(/\n\s*\n/g, "\n"),
    minify: (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*\{\s*/g, "{").replace(/\s*\}\s*/g, "}").replace(/\s*:\s*/g, ":").replace(/\s*;\s*/g, ";").trim()
  },
  js: {
    beautify: (code) => {
      let indent = 0;
      return code.replace(/\s*\{\s*/g, " {\n").replace(/\s*\}\s*/g, "\n}").replace(/\s*;\s*/g, ";\n").split('\n').map(line => {
        line = line.trim();
        if (line.includes('}')) indent = Math.max(0, indent - 1);
        const prefix = '  '.repeat(indent);
        if (line.includes('{')) indent++;
        return prefix + line;
      }).join('\n').replace(/^\s*[\r\n]/gm, "");
    },
    minify: (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "").replace(/\s+/g, " ").replace(/\s*([=+\-*/%&|!<>={};(),])\s*/g, "$1").trim()
  }
};

export const detectLanguage = (code) => {
  const trimmed = code.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && !trimmed.includes('body'))) return 'xml';
  if (trimmed.startsWith('<')) return 'html';
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)/i.test(trimmed)) return 'sql';
  if (trimmed.includes('{') && trimmed.includes(';') && !trimmed.includes('<')) return 'css';
  return 'js';
};

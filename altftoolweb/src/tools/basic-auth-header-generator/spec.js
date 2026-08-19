// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "basic-auth-header-generator",
  "title": "Basic Auth Header Generator",
  "description": "Generates a basic authentication header based on provided credentials",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "code",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "username",
      "label": "Username",
      "type": "text",
      "default": "admin"
    },
    {
      "key": "password",
      "label": "Password",
      "type": "password",
      "default": "password123",
      "sensitive": true,
      "autoComplete": "off",
      "required": false
    },
    {
      "key": "realm",
      "label": "Realm",
      "type": "text",
      "default": "Restricted Area",
      "required": false
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "username": "user",
        "password": "pass",
        "realm": "Example Realm"
      }
    }
  ],
  "note": "Encodes username:password as UTF-8 in the format 'Basic <base64 credentials>'. Treat the output as a credential.",
  "exportResultOnly": true
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const username = String(values.username ?? "");
      const password = String(values.password ?? "");
      const realm = String(values.realm ?? "");
      if (username.includes(":")) return { result: "", error: "Username cannot contain a colon." };
      const auth = `${username}:${password}`;
      const bytes = new TextEncoder().encode(auth);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      const encodedAuth = btoa(binary);
      const authHeader = `Basic ${encodedAuth}`;
      return {
         result: authHeader,
         rows: [['Username', username], ['Password', password ? '********' : '(empty)'], ['Realm', realm], ['Authorization Header', authHeader]]
      };
   },
};

export default spec;

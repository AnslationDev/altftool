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
      "type": "text",
      "default": "password123"
    },
    {
      "key": "realm",
      "label": "Realm",
      "type": "text",
      "default": "Restricted Area"
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
  "note": "Generated headers are in the format 'Basic <base64 encoded credentials>'"
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const username = values.username;
      const password = values.password;
      const realm = values.realm;
      const auth = `${username}:${password}`;
      const encodedAuth = btoa(auth);
      const authHeader = `Basic ${encodedAuth}`;
      return {
         result: authHeader,
         rows: [['Username', username], ['Password', '********'], ['Realm', realm], ['Authorization Header', authHeader]]
      };
   },
};

export default spec;

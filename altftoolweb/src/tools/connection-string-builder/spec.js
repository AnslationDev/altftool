// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "connection-string-builder",
  "title": "Database Connection String Builder",
  "description": "Build a database connection URI for Postgres, MySQL, MongoDB, Redis and more — with the right scheme and default port.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "database",
  "iconColor": "text-blue-600",
  "fields": [
    {
      "key": "database_type",
      "label": "Database",
      "type": "select",
      "default": "postgresql",
      "choices": [
        {
          "value": "postgresql",
          "label": "PostgreSQL"
        },
        {
          "value": "mysql",
          "label": "MySQL"
        },
        {
          "value": "mariadb",
          "label": "MariaDB"
        },
        {
          "value": "mongodb",
          "label": "MongoDB"
        },
        {
          "value": "redis",
          "label": "Redis"
        },
        {
          "value": "mssql",
          "label": "SQL Server"
        }
      ]
    },
    {
      "key": "host",
      "label": "Host",
      "type": "text",
      "default": "localhost"
    },
    {
      "key": "port",
      "label": "Port (blank = default)",
      "type": "number",
      "default": "",
      "required": false
    },
    {
      "key": "username",
      "label": "Username",
      "type": "text",
      "default": "admin",
      "required": false
    },
    {
      "key": "password",
      "label": "Password",
      "type": "text",
      "default": "",
      "required": false
    },
    {
      "key": "database",
      "label": "Database name",
      "type": "text",
      "default": "mydb",
      "required": false
    }
  ],
  "presets": [
    {
      "label": "Postgres local",
      "values": {
        "database_type": "postgresql",
        "host": "localhost",
        "username": "admin",
        "password": "secret",
        "database": "app"
      }
    },
    {
      "label": "MongoDB",
      "values": {
        "database_type": "mongodb",
        "host": "db.example.com",
        "username": "root",
        "database": "prod"
      }
    }
  ],
  "note": "The password is shown in plain text — never paste production secrets into any online tool."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const schemes = { postgresql: "postgresql", mysql: "mysql", mariadb: "mysql", mongodb: "mongodb", redis: "redis", mssql: "sqlserver" };
      const ports = { postgresql: 5432, mysql: 3306, mariadb: 3306, mongodb: 27017, redis: 6379, mssql: 1433 };
      const db = values.database_type;
      const scheme = schemes[db] || db;
      const port = values.port === "" || values.port == null ? ports[db] : values.port;
      const host = values.host || "localhost";
      const auth = values.username ? values.username + (values.password ? ":" + values.password : "") + "@" : "";
      const dbname = values.database ? "/" + values.database : "";
      const cs = scheme + "://" + auth + host + (port ? ":" + port : "") + dbname;
      return { result: cs, rows: [["Scheme", scheme], ["Host", host], ["Port", String(port)], ["Database", values.database || "(none)"]] };
    },
};

export default spec;

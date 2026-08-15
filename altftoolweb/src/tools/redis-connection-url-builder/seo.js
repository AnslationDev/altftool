const seo = {
  title: "Redis Connection URL Builder (redis:// & rediss://)",
  metaDescription:
    "Build redis:// or rediss:// URLs with DB index, ACL username and percent-encoded password, plus a matching redis-cli -u test command.",
  steps: [
    "Tick 'Use TLS — rediss://' if needed, then fill Host, Port (blank = default 6379), Database index (0–15 by default), the optional ACL username (Redis 6+) and the password, which is percent-encoded for you.",
    "There is no build button — the Connection URL panel rewrites as you type, and a database index of 16 or higher shows a warning that the server must raise the default 'databases' setting.",
    "Press 'Copy URL' for the redis:// or rediss:// string, or 'Copy command' under 'Test with redis-cli' for the ready redis-cli -u command; 'Reset' returns every field to localhost:6379/0.",
  ],
  intro:
    "This builder assembles a Redis connection URL in the standard redis:// / rediss:// scheme — redis://username:password@host:6379/db — with the logical database index as the path, Redis 6 ACL usernames or legacy password-only AUTH in the userinfo, and rediss:// for TLS. It also emits the matching redis-cli -u command for a quick connectivity test. Passwords are percent-encoded and everything is generated locally in the browser.",
  useCases: [
    "A developer pointing a worker at logical database 2 on a shared Redis instance without misplacing the /2 path segment",
    "A team switching to a managed Redis service that requires TLS and needs the rediss:// form with an ACL user",
    "An engineer whose Redis password contains @ or / and needs it percent-encoded so the client stops misparsing the host",
  ],
  benefits: [
    ["ACL and legacy auth", "Handles both Redis 6 username:password URLs and the older :password@ AUTH-only form correctly."],
    ["DB index sanity check", "Warns when the index is 16 or higher, which only works if the server raises the default databases 16 setting."],
    ["redis-cli included", "Copies a ready redis-cli -u command so you can verify the URL before wiring it into an app."],
  ],
  faqs: [
    [
      "What is the format of a Redis connection URL?",
      "redis://[username][:password]@host:port/db — for example redis://:mypass@localhost:6379/0. The default port is 6379, the trailing number is the logical database index (0 if omitted), and rediss:// is the same scheme over TLS. This is the format redis-cli -u and clients like node-redis, ioredis and redis-py accept.",
    ],
    [
      "How do I select a database number in a Redis URL?",
      "Append it as the path: redis://localhost:6379/2 selects logical database 2. Redis ships with 16 logical databases (indexes 0–15) by default, configurable via the databases directive in redis.conf; note that Redis Cluster only supports database 0.",
    ],
    [
      "What is the difference between redis:// and rediss://?",
      "The extra s means TLS: rediss:// encrypts the connection, exactly like https versus http. Most managed Redis providers only accept TLS connections, so their URLs start with rediss://; plain redis:// sends the password in cleartext and belongs only on trusted private networks.",
    ],
    [
      "How do I use a username in a Redis connection string?",
      "Put the ACL username before the colon: redis://myuser:mypass@host:6379. Usernames arrived with the ACL system in Redis 6; before that, AUTH took only a password, which the URL form expresses by leaving the username empty — redis://:mypass@host. Connecting as the user named default is equivalent to the legacy form.",
    ],
  ],
};

export default seo;

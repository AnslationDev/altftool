/**
 * Linux Common Command Query Tool — the command table and the search that
 * ranks it.
 *
 * COMMANDS is the data: name, category, one-line description, POSIX-style
 * usage synopsis, worked examples, search keywords and related commands. Every
 * synopsis follows the manual-page convention where `[…]` marks an optional
 * argument.
 *
 * `searchCommands` scores each entry against the query with the weights in
 * SCORE_WEIGHTS — an exact name match always outranks a description match, so
 * typing "cp" gives you cp rather than every command whose help text mentions
 * copying.
 *
 * Pure module: no React, no DOM, no clock reads, no storage.
 */

/**
 * Match weights, highest first. The numbers are arbitrary but ordered: any
 * single higher-tier hit must beat the sum of every lower tier, which is why
 * the gaps widen towards the top.
 */
export const SCORE_WEIGHTS = {
  exactName: 200,
  namePrefix: 90,
  nameContains: 60,
  alias: 45,
  keyword: 25,
  category: 18,
  description: 12,
  example: 8,
};

/** Cap on the result list so the page never renders hundreds of rows. */
export const DEFAULT_RESULT_LIMIT = 40;

/** The command table. */
export const COMMANDS = [
  { name: "ls", aliases: ["dir", "list"], category: "Files & directories", description: "List the files and directories in a path.", syntax: "ls [options] [path]", examples: ["ls -la", "ls -lh /var/log", "ls -R src"], keywords: ["files", "directories", "hidden", "permissions"], related: ["cd", "find", "stat"] },
  { name: "cd", aliases: ["chdir"], category: "Files & directories", description: "Change the shell's working directory.", syntax: "cd [directory]", examples: ["cd /etc", "cd ..", "cd -"], keywords: ["navigate", "directory", "move"], related: ["pwd", "ls", "pushd"] },
  { name: "pwd", aliases: [], category: "Files & directories", description: "Print the full path of the working directory.", syntax: "pwd [-LP]", examples: ["pwd", "pwd -P"], keywords: ["path", "where", "current"], related: ["cd", "ls"] },
  { name: "cp", aliases: ["copy"], category: "Files & directories", description: "Copy files and directories.", syntax: "cp [options] source destination", examples: ["cp notes.txt backup/", "cp -r site/ site-backup/", "cp -av a.log b.log"], keywords: ["copy", "duplicate", "recursive"], related: ["mv", "rsync", "scp"] },
  { name: "mv", aliases: ["move", "rename"], category: "Files & directories", description: "Move or rename files and directories.", syntax: "mv [options] source destination", examples: ["mv old.txt new.txt", "mv *.log archive/", "mv -i a b"], keywords: ["rename", "move", "relocate"], related: ["cp", "rm"] },
  { name: "rm", aliases: ["delete"], category: "Files & directories", description: "Remove files and directories permanently.", syntax: "rm [options] file...", examples: ["rm draft.txt", "rm -r build/", "rm -i *.tmp"], keywords: ["delete", "remove", "erase"], related: ["rmdir", "trash", "shred"] },
  { name: "mkdir", aliases: [], category: "Files & directories", description: "Create directories.", syntax: "mkdir [-p] directory...", examples: ["mkdir logs", "mkdir -p src/app/components"], keywords: ["create", "folder", "directory"], related: ["rmdir", "touch"] },
  { name: "touch", aliases: [], category: "Files & directories", description: "Create an empty file or update a file's timestamps.", syntax: "touch [options] file...", examples: ["touch .env", "touch -t 202601011200 report.txt"], keywords: ["create", "empty", "timestamp"], related: ["mkdir", "stat"] },
  { name: "ln", aliases: [], category: "Files & directories", description: "Create hard or symbolic links between files.", syntax: "ln [-s] target linkname", examples: ["ln -s /opt/app/bin/app /usr/local/bin/app", "ln data.csv data-hardlink.csv"], keywords: ["symlink", "link", "shortcut"], related: ["ls", "readlink"] },
  { name: "find", aliases: [], category: "Files & directories", description: "Search a directory tree by name, size, age or type.", syntax: "find [path] [expression]", examples: ["find . -name '*.log'", "find /var -size +100M", "find . -mtime -1 -type f"], keywords: ["search", "locate", "size", "modified"], related: ["grep", "locate", "xargs"] },
  { name: "stat", aliases: [], category: "Files & directories", description: "Show a file's size, permissions, inode and timestamps.", syntax: "stat [options] file", examples: ["stat report.pdf", "stat -c '%s %n' *.iso"], keywords: ["inode", "size", "metadata"], related: ["ls", "du"] },

  { name: "cat", aliases: [], category: "Text processing", description: "Print a file, or join several files together.", syntax: "cat [options] file...", examples: ["cat /etc/hostname", "cat -n script.sh", "cat a.txt b.txt > both.txt"], keywords: ["print", "read", "concatenate"], related: ["less", "head", "tail"] },
  { name: "less", aliases: ["more"], category: "Text processing", description: "Page through a file or a pipe one screen at a time.", syntax: "less [options] file", examples: ["less /var/log/syslog", "journalctl -u nginx | less"], keywords: ["pager", "scroll", "read"], related: ["cat", "head", "tail"] },
  { name: "head", aliases: [], category: "Text processing", description: "Show the first lines of a file.", syntax: "head [-n count] file", examples: ["head -n 20 access.log", "head -c 100 data.bin"], keywords: ["first", "top", "preview"], related: ["tail", "cat"] },
  { name: "tail", aliases: [], category: "Text processing", description: "Show the last lines of a file, optionally following new writes.", syntax: "tail [-n count] [-f] file", examples: ["tail -n 50 error.log", "tail -f /var/log/nginx/access.log"], keywords: ["last", "follow", "live", "logs"], related: ["head", "journalctl"] },
  { name: "grep", aliases: ["egrep", "fgrep"], category: "Text processing", description: "Search text for lines matching a pattern.", syntax: "grep [options] pattern [file...]", examples: ["grep -i error app.log", "grep -rn 'TODO' src/", "ps aux | grep node"], keywords: ["search", "pattern", "regex", "filter"], related: ["find", "sed", "awk"] },
  { name: "sed", aliases: [], category: "Text processing", description: "Stream editor for find-and-replace and line editing.", syntax: "sed [options] 'script' [file...]", examples: ["sed 's/foo/bar/g' file.txt", "sed -i '2d' list.txt", "sed -n '10,20p' log.txt"], keywords: ["replace", "substitute", "edit", "stream"], related: ["awk", "grep", "tr"] },
  { name: "awk", aliases: ["gawk"], category: "Text processing", description: "Field-aware text processing and reporting language.", syntax: "awk [options] 'program' [file...]", examples: ["awk '{print $1}' access.log", "awk -F: '$3 >= 1000 {print $1}' /etc/passwd"], keywords: ["columns", "fields", "report", "sum"], related: ["sed", "cut", "sort"] },
  { name: "sort", aliases: [], category: "Text processing", description: "Sort lines of text.", syntax: "sort [options] [file...]", examples: ["sort names.txt", "sort -nr sizes.txt", "sort -k2 -t, data.csv"], keywords: ["order", "numeric", "reverse"], related: ["uniq", "wc", "awk"] },
  { name: "uniq", aliases: [], category: "Text processing", description: "Filter or count adjacent duplicate lines — sort first.", syntax: "uniq [options] [file]", examples: ["sort ips.txt | uniq -c", "uniq -d entries.txt"], keywords: ["duplicate", "count", "distinct"], related: ["sort", "wc"] },
  { name: "wc", aliases: [], category: "Text processing", description: "Count lines, words and bytes.", syntax: "wc [-lwc] [file...]", examples: ["wc -l access.log", "cat *.md | wc -w"], keywords: ["count", "lines", "words"], related: ["sort", "uniq"] },
  { name: "diff", aliases: [], category: "Text processing", description: "Report the differences between two files.", syntax: "diff [options] file1 file2", examples: ["diff old.conf new.conf", "diff -u a.js b.js"], keywords: ["compare", "changes", "patch"], related: ["patch", "cmp"] },
  { name: "xargs", aliases: [], category: "Text processing", description: "Build and run command lines from standard input.", syntax: "command | xargs [options] utility", examples: ["find . -name '*.tmp' | xargs rm", "cat urls.txt | xargs -n1 curl -I"], keywords: ["pipe", "batch", "arguments"], related: ["find", "grep"] },

  { name: "chmod", aliases: [], category: "Permissions & ownership", description: "Change file mode bits (read, write, execute).", syntax: "chmod [options] mode file...", examples: ["chmod 644 index.html", "chmod +x deploy.sh", "chmod -R 750 /srv/app"], keywords: ["permissions", "executable", "755", "644"], related: ["chown", "umask", "ls"] },
  { name: "chown", aliases: [], category: "Permissions & ownership", description: "Change the owning user and group of a file.", syntax: "chown [options] user[:group] file...", examples: ["chown www-data:www-data /var/www", "chown -R deploy: /srv/app"], keywords: ["owner", "group", "user"], related: ["chmod", "chgrp"] },
  { name: "chgrp", aliases: [], category: "Permissions & ownership", description: "Change the owning group of a file.", syntax: "chgrp [options] group file...", examples: ["chgrp developers script.sh", "chgrp -R staff shared/"], keywords: ["group", "owner"], related: ["chown", "chmod"] },
  { name: "umask", aliases: [], category: "Permissions & ownership", description: "Show or set the default permission mask for new files.", syntax: "umask [mask]", examples: ["umask", "umask 022"], keywords: ["default", "permissions", "mask"], related: ["chmod"] },
  { name: "sudo", aliases: [], category: "Permissions & ownership", description: "Run a command as another user, usually root.", syntax: "sudo [options] command", examples: ["sudo apt update", "sudo -u postgres psql", "sudo -i"], keywords: ["root", "admin", "privilege"], related: ["su", "visudo"] },

  { name: "tar", aliases: [], category: "Compression", description: "Create or extract tar archives, optionally compressed.", syntax: "tar [-czxvf] archive.tar.gz [files]", examples: ["tar -czvf site.tar.gz site/", "tar -xzvf site.tar.gz", "tar -tf backup.tar"], keywords: ["archive", "backup", "gzip", "extract"], related: ["gzip", "zip", "unzip"] },
  { name: "zip", aliases: [], category: "Compression", description: "Create a ZIP archive.", syntax: "zip [options] archive.zip files...", examples: ["zip -r photos.zip photos/", "zip -e secret.zip data.csv"], keywords: ["archive", "compress", "windows"], related: ["unzip", "tar"] },
  { name: "unzip", aliases: [], category: "Compression", description: "Extract a ZIP archive.", syntax: "unzip [options] archive.zip [-d directory]", examples: ["unzip photos.zip", "unzip -l release.zip", "unzip app.zip -d /opt/app"], keywords: ["extract", "decompress"], related: ["zip", "tar"] },
  { name: "gzip", aliases: ["gunzip"], category: "Compression", description: "Compress or decompress a single file with DEFLATE.", syntax: "gzip [-dk] file", examples: ["gzip access.log", "gzip -d access.log.gz", "gzip -k report.csv"], keywords: ["compress", "gz", "deflate"], related: ["tar", "bzip2", "xz"] },
  { name: "bzip2", aliases: ["bunzip2"], category: "Compression", description: "Compress or decompress a file with the Burrows-Wheeler algorithm.", syntax: "bzip2 [-dk] file", examples: ["bzip2 dump.sql", "bzip2 -d dump.sql.bz2"], keywords: ["compress", "bz2"], related: ["gzip", "xz", "tar"] },
  { name: "xz", aliases: ["unxz"], category: "Compression", description: "Compress or decompress with LZMA2 — slower but smaller than gzip.", syntax: "xz [-dk] file", examples: ["xz -9 backup.tar", "xz -d backup.tar.xz"], keywords: ["compress", "lzma", "small"], related: ["gzip", "tar"] },

  { name: "ping", aliases: [], category: "Networking", description: "Send ICMP echo requests to test reachability and latency.", syntax: "ping [-c count] host", examples: ["ping -c 4 1.1.1.1", "ping example.com"], keywords: ["latency", "reachable", "icmp", "test"], related: ["traceroute", "ip", "dig"] },
  { name: "ssh", aliases: [], category: "Remote & transfer", description: "Open an encrypted shell session on a remote host.", syntax: "ssh [user@]host [-p port] [command]", examples: ["ssh deploy@10.0.0.5", "ssh -p 2222 admin@server", "ssh host 'systemctl status nginx'"], keywords: ["remote", "shell", "login", "secure"], related: ["scp", "rsync", "ssh-keygen"] },
  { name: "scp", aliases: [], category: "Remote & transfer", description: "Copy files between hosts over SSH.", syntax: "scp [options] source target", examples: ["scp app.tar.gz deploy@host:/tmp/", "scp -r host:/var/log ./logs"], keywords: ["copy", "remote", "transfer"], related: ["ssh", "rsync", "sftp"] },
  { name: "rsync", aliases: [], category: "Remote & transfer", description: "Sync directories locally or over SSH, transferring only differences.", syntax: "rsync [options] source destination", examples: ["rsync -avz site/ host:/var/www/site/", "rsync -av --delete src/ backup/"], keywords: ["sync", "backup", "mirror", "incremental"], related: ["scp", "ssh", "cp"] },
  { name: "curl", aliases: [], category: "Networking", description: "Transfer data to or from a URL.", syntax: "curl [options] url", examples: ["curl -I https://example.com", "curl -X POST -d '{\"a\":1}' -H 'Content-Type: application/json' url", "curl -O https://example.com/file.zip"], keywords: ["http", "download", "api", "request"], related: ["wget", "ping"] },
  { name: "wget", aliases: [], category: "Networking", description: "Download files over HTTP, HTTPS or FTP, with resume support.", syntax: "wget [options] url", examples: ["wget https://example.com/iso.img", "wget -c bigfile.zip", "wget -r -np site.com/docs/"], keywords: ["download", "http", "resume", "mirror"], related: ["curl"] },
  { name: "ip", aliases: [], category: "Networking", description: "Show and configure addresses, links and routes (replaces ifconfig).", syntax: "ip [object] [command]", examples: ["ip addr show", "ip route", "ip link set eth0 up"], keywords: ["address", "route", "interface", "network"], related: ["ifconfig", "ss", "ping"] },
  { name: "ifconfig", aliases: [], category: "Networking", description: "Legacy interface configuration tool, superseded by `ip`.", syntax: "ifconfig [interface] [options]", examples: ["ifconfig", "ifconfig eth0 up"], keywords: ["interface", "legacy", "address"], related: ["ip", "netstat"] },
  { name: "ss", aliases: ["netstat"], category: "Networking", description: "List sockets — listening ports and established connections.", syntax: "ss [options]", examples: ["ss -tulpn", "ss -tan state established"], keywords: ["ports", "sockets", "listening", "connections"], related: ["ip", "lsof"] },
  { name: "dig", aliases: ["nslookup"], category: "Networking", description: "Query DNS records for a name.", syntax: "dig [@server] name [type]", examples: ["dig example.com A", "dig @1.1.1.1 example.com MX", "dig +short example.com"], keywords: ["dns", "record", "resolve", "mx"], related: ["ping", "host"] },

  { name: "ps", aliases: [], category: "Processes", description: "Report a snapshot of running processes.", syntax: "ps [options]", examples: ["ps aux", "ps -ef | grep nginx", "ps -o pid,cmd -u deploy"], keywords: ["processes", "pid", "running"], related: ["top", "kill", "pgrep"] },
  { name: "top", aliases: ["htop"], category: "Processes", description: "Live view of processes ordered by CPU or memory use.", syntax: "top [options]", examples: ["top", "top -o %MEM", "top -u deploy"], keywords: ["cpu", "memory", "monitor", "live"], related: ["ps", "free", "vmstat"] },
  { name: "kill", aliases: ["pkill", "killall"], category: "Processes", description: "Send a signal to a process — TERM by default, KILL with -9.", syntax: "kill [-signal] pid", examples: ["kill 4821", "kill -9 4821", "pkill -f 'node server.js'"], keywords: ["stop", "terminate", "signal", "9"], related: ["ps", "top"] },
  { name: "nohup", aliases: [], category: "Processes", description: "Run a command immune to hangups so it survives logout.", syntax: "nohup command [&]", examples: ["nohup ./worker.sh &", "nohup python job.py > job.log 2>&1 &"], keywords: ["background", "detach", "persist"], related: ["screen", "tmux", "systemctl"] },
  { name: "systemctl", aliases: [], category: "Services", description: "Control systemd services and units.", syntax: "systemctl [command] [unit]", examples: ["systemctl status nginx", "systemctl restart docker", "systemctl enable --now app"], keywords: ["service", "restart", "enable", "systemd"], related: ["journalctl", "service"] },
  { name: "service", aliases: [], category: "Services", description: "SysV-style wrapper for starting and stopping services.", syntax: "service unit command", examples: ["service nginx restart", "service --status-all"], keywords: ["service", "init", "legacy"], related: ["systemctl"] },
  { name: "journalctl", aliases: [], category: "Services", description: "Read the systemd journal, filtered by unit, time or priority.", syntax: "journalctl [options]", examples: ["journalctl -u nginx -n 100", "journalctl -f", "journalctl --since '1 hour ago' -p err"], keywords: ["logs", "systemd", "errors", "follow"], related: ["systemctl", "tail"] },
  { name: "crontab", aliases: [], category: "Scheduling", description: "Edit or list the per-user schedule of recurring jobs.", syntax: "crontab [-e|-l|-r]", examples: ["crontab -l", "crontab -e", "0 3 * * * /usr/local/bin/backup.sh"], keywords: ["schedule", "cron", "recurring", "job"], related: ["systemctl", "at"] },

  { name: "apt", aliases: ["apt-get"], category: "Packages", description: "Install, upgrade and remove packages on Debian and Ubuntu.", syntax: "apt [command] [package]", examples: ["sudo apt update && sudo apt upgrade", "sudo apt install nginx", "apt list --installed"], keywords: ["install", "debian", "ubuntu", "package"], related: ["dpkg", "dnf", "snap"] },
  { name: "dnf", aliases: ["yum"], category: "Packages", description: "Package manager for Fedora, RHEL and CentOS Stream.", syntax: "dnf [command] [package]", examples: ["sudo dnf install nginx", "dnf search postgres", "sudo dnf upgrade"], keywords: ["install", "fedora", "rhel", "rpm"], related: ["rpm", "apt"] },
  { name: "pacman", aliases: [], category: "Packages", description: "Package manager for Arch Linux.", syntax: "pacman [operation] [package]", examples: ["sudo pacman -Syu", "sudo pacman -S neovim", "pacman -Qs python"], keywords: ["arch", "install", "upgrade"], related: ["apt", "dnf"] },

  { name: "df", aliases: [], category: "Disk & storage", description: "Report free and used space per mounted filesystem.", syntax: "df [-h] [path]", examples: ["df -h", "df -h /var", "df -i"], keywords: ["disk", "free", "space", "full"], related: ["du", "lsblk"] },
  { name: "du", aliases: [], category: "Disk & storage", description: "Show how much space a directory tree uses.", syntax: "du [options] [path]", examples: ["du -sh /var/log", "du -h --max-depth=1 /home | sort -h"], keywords: ["size", "usage", "directory", "large"], related: ["df", "find", "ncdu"] },
  { name: "lsblk", aliases: [], category: "Disk & storage", description: "List block devices, partitions and mount points.", syntax: "lsblk [options]", examples: ["lsblk", "lsblk -f"], keywords: ["disk", "partition", "device", "mount"], related: ["df", "mount", "fdisk"] },
  { name: "mount", aliases: ["umount"], category: "Disk & storage", description: "Attach a filesystem to a directory, or list what is mounted.", syntax: "mount [device] [mountpoint]", examples: ["mount", "sudo mount /dev/sdb1 /mnt/usb", "sudo umount /mnt/usb"], keywords: ["mount", "usb", "filesystem"], related: ["lsblk", "df", "fstab"] },

  { name: "useradd", aliases: ["adduser"], category: "Users", description: "Create a new user account.", syntax: "useradd [options] username", examples: ["sudo useradd -m -s /bin/bash deploy", "sudo useradd -G docker ci"], keywords: ["user", "create", "account"], related: ["usermod", "passwd", "userdel"] },
  { name: "usermod", aliases: [], category: "Users", description: "Modify an existing account — groups, shell, home directory.", syntax: "usermod [options] username", examples: ["sudo usermod -aG sudo deploy", "sudo usermod -s /bin/zsh alice"], keywords: ["group", "modify", "shell", "sudo"], related: ["useradd", "groups"] },
  { name: "passwd", aliases: [], category: "Users", description: "Change a user's password or lock an account.", syntax: "passwd [username]", examples: ["passwd", "sudo passwd deploy", "sudo passwd -l olduser"], keywords: ["password", "lock", "change"], related: ["useradd", "usermod"] },
  { name: "whoami", aliases: ["id"], category: "Users", description: "Print the effective user name, or full identity with `id`.", syntax: "whoami", examples: ["whoami", "id -u", "id deploy"], keywords: ["user", "uid", "identity"], related: ["sudo", "who"] },

  { name: "free", aliases: [], category: "System & monitoring", description: "Show total, used and available memory and swap.", syntax: "free [-h]", examples: ["free -h", "free -m -s 5"], keywords: ["memory", "ram", "swap"], related: ["top", "vmstat"] },
  { name: "uptime", aliases: [], category: "System & monitoring", description: "Show how long the system has run plus the load averages.", syntax: "uptime [-p]", examples: ["uptime", "uptime -p"], keywords: ["load", "boot", "running"], related: ["top", "who"] },
  { name: "vmstat", aliases: [], category: "System & monitoring", description: "Report virtual memory, CPU and I/O statistics over time.", syntax: "vmstat [delay] [count]", examples: ["vmstat 1 5", "vmstat -s"], keywords: ["cpu", "io", "memory", "stats"], related: ["top", "iostat", "free"] },
  { name: "uname", aliases: [], category: "System & monitoring", description: "Print kernel and machine information.", syntax: "uname [-a]", examples: ["uname -a", "uname -r"], keywords: ["kernel", "version", "architecture"], related: ["lsb_release", "hostnamectl"] },
  { name: "history", aliases: [], category: "System & monitoring", description: "List the shell's previously run commands.", syntax: "history [n]", examples: ["history", "history 20", "history | grep ssh"], keywords: ["previous", "recall", "shell"], related: ["grep"] },
  { name: "man", aliases: ["info"], category: "System & monitoring", description: "Open the manual page for a command.", syntax: "man [section] command", examples: ["man ls", "man 5 crontab", "man -k compress"], keywords: ["help", "manual", "docs"], related: ["help", "tldr"] },
];

/** Distinct categories in table order. */
export const COMMAND_CATEGORIES = Array.from(new Set(COMMANDS.map((command) => command.category)));

const lower = (value) => String(value ?? "").toLowerCase();

/**
 * Score one command against a query. Returns 0 when nothing matches.
 *
 * @param {object} command
 * @param {string} query already trimmed and lowercased
 * @returns {number}
 */
export function scoreCommand(command, query) {
  if (!query) return 1;
  const name = lower(command.name);
  let score = 0;

  if (name === query) score += SCORE_WEIGHTS.exactName;
  else if (name.startsWith(query)) score += SCORE_WEIGHTS.namePrefix;
  else if (name.includes(query)) score += SCORE_WEIGHTS.nameContains;

  if ((command.aliases ?? []).some((alias) => lower(alias).includes(query))) {
    score += SCORE_WEIGHTS.alias;
  }
  if ((command.keywords ?? []).some((keyword) => lower(keyword).includes(query))) {
    score += SCORE_WEIGHTS.keyword;
  }
  if (lower(command.category).includes(query)) score += SCORE_WEIGHTS.category;
  if (lower(command.description).includes(query)) score += SCORE_WEIGHTS.description;
  if ((command.examples ?? []).some((example) => lower(example).includes(query))) {
    score += SCORE_WEIGHTS.example;
  }

  return score;
}

/**
 * Rank the table against a query, optionally inside one category.
 *
 * @param {string} query
 * @param {{ category?: string, limit?: number, commands?: object[] }} [options]
 * @returns {{ results: Array<object>, total: number, query: string } | { error: string }}
 */
export function searchCommands(query, options = {}) {
  const { category = "All", limit = DEFAULT_RESULT_LIMIT, commands = COMMANDS } = options;
  if (typeof query !== "string" && query !== undefined && query !== null) {
    return { error: "Search with a text query." };
  }
  if (!Number.isFinite(limit) || limit <= 0) {
    return { error: "The result limit must be a positive number." };
  }

  const normalised = lower(query).trim();
  const pool =
    category && category !== "All"
      ? commands.filter((command) => command.category === category)
      : commands;

  const scored = pool
    .map((command) => ({ command, score: scoreCommand(command, normalised) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.command.name.localeCompare(b.command.name));

  return {
    query: normalised,
    total: scored.length,
    results: scored.slice(0, limit).map((entry) => ({ ...entry.command, score: entry.score })),
  };
}

/**
 * Look up one command by name or alias.
 *
 * @param {string} name
 * @returns {object | null}
 */
export function getCommand(name) {
  const needle = lower(name).trim();
  if (!needle) return null;
  return (
    COMMANDS.find((command) => lower(command.name) === needle) ??
    COMMANDS.find((command) => (command.aliases ?? []).some((alias) => lower(alias) === needle)) ??
    null
  );
}

/**
 * Resolve a command's `related` list into full entries.
 *
 * @param {string} name
 * @returns {object[]}
 */
export function relatedCommands(name) {
  const command = getCommand(name);
  if (!command) return [];
  return (command.related ?? []).map((related) => getCommand(related)).filter(Boolean);
}

/**
 * Render a plain-text cheat sheet for a set of commands.
 *
 * @param {object[]} commands
 * @param {string} [title]
 * @returns {string}
 */
export function buildCheatSheet(commands, title = "LINUX COMMAND CHEAT SHEET") {
  if (!Array.isArray(commands) || commands.length === 0) {
    return `${title}\n${"=".repeat(title.length)}\n\n(no commands selected)`;
  }
  const lines = [title, "=".repeat(title.length), ""];
  for (const command of commands) {
    lines.push(`${command.name} — ${command.description}`);
    lines.push(`  category: ${command.category}`);
    lines.push(`  usage:    ${command.syntax}`);
    for (const example of command.examples ?? []) lines.push(`  example:  ${example}`);
    if ((command.related ?? []).length) lines.push(`  see also: ${command.related.join(", ")}`);
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

/** Counts per category, for the filter chips. */
export function categoryCounts(commands = COMMANDS) {
  const counts = {};
  for (const command of commands) {
    counts[command.category] = (counts[command.category] ?? 0) + 1;
  }
  return counts;
}

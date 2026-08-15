const seo = {
  title: "UFW Rule Generator: Valid Rules & Safe Apply Order",
  metaDescription:
    "Build valid ufw allow, deny, reject or limit rules for ports, ranges or app profiles, with source CIDR and an apply order that puts SSH before ufw enable.",
  steps: [
    "Set 'Action' and 'Rule targets' ('A port or range' or 'An application profile'), then enter the port — 22, or 80,443, or 6000:6010.",
    "Restrict it with 'From (source address or CIDR)' and a 'Comment', and set the 'SSH port to protect first' in the Safe apply order section.",
    "Click 'Copy rule' for the sudo ufw command and follow the numbered apply-order steps ending with ufw enable.",
  ],
  intro:
    "This generator writes syntactically valid ufw rules — the simple `ufw allow 22/tcp` form and the extended `ufw allow from 10.0.0.0/8 to any port 5432 proto tcp` form — and validates the parts ufw is strict about, such as requiring an explicit protocol for port lists and ranges. It also produces the ordering that keeps you connected: default policies, then an SSH rule, then your rules, then enable. Aimed at anyone administering a single Ubuntu or Debian server without a configuration management tool.",
  useCases: [
    "Opening PostgreSQL to one application subnet instead of the whole internet",
    "Rate-limiting SSH with ufw limit before enabling the firewall on a fresh VPS",
    "Allowing an Nginx app profile rather than hand-listing ports 80 and 443",
  ],
  benefits: [
    ["Valid the first time", "Catches the mistakes ufw rejects, like a port range without a protocol or a /33 prefix."],
    ["Safe apply order", "Puts the SSH rule before `ufw enable`, which is the step that most often locks people out of a VPS."],
    ["Honest about gaps", "Points out that Docker publishes ports past ufw and that IPv6 rules need IPV6=yes in /etc/default/ufw."],
  ],
  faqs: [
    [
      "What is the difference between ufw deny and ufw reject?",
      "deny drops the packet with no reply, so the client hangs until it times out. reject sends an ICMP unreachable, so the connection fails at once. Use deny facing the internet to avoid confirming the host exists, and reject inside a trusted network where fast failure is friendlier.",
    ],
    [
      "What does ufw limit actually do?",
      "It allows the connection but blocks any source address that opens 6 or more connections within 30 seconds, which throttles SSH password-guessing. It relies on TCP connection tracking, so it cannot be applied to UDP services.",
    ],
    [
      "Why does ufw reject my port range?",
      "ufw requires an explicit protocol whenever the rule covers a range or a comma-separated list, because the underlying iptables multiport match needs one. Write ufw allow 6000:6010/tcp rather than ufw allow 6000:6010.",
    ],
    [
      "Why do my Docker containers stay reachable even though ufw denies the port?",
      "Docker inserts its own rules into the nat table, which is evaluated before ufw's filter chain, so published ports bypass ufw entirely. Publish to 127.0.0.1 with -p 127.0.0.1:8080:80, or add rules to the DOCKER-USER chain instead.",
    ],
  ],
};

export default seo;

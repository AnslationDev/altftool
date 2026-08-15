const seo = {
  title: "Ansible Inventory File Builder – INI & YAML Output",
  metaDescription:
    "Type groups, hosts and vars in INI style — [group:children], [group:vars], ranges like web[01:05] — and copy a validated inventory as INI or YAML.",
  steps: [
    "Type your spec into the 'Inventory spec' box in INI style — [group] headers, [group:children] nesting, [group:vars] blocks and host ranges like web[01:05].",
    "Pick the Output format: 'YAML (inventory.yml)' or 'INI (hosts)'; validation flags non key=value variables, self-referencing groups and circular :children chains as you type.",
    "Read the stats — Groups, Hosts (ranges expanded), Child links, Variables — then click 'Copy result' to copy the generated inventory.",
  ],
  intro:
    "This builder turns a plain INI-style spec into a validated Ansible inventory in both INI and YAML formats, complete with groups, [group:children] nesting, [group:vars] blocks and per-host variables. It follows the structure in Ansible's official inventory guide, expands numeric host ranges like web[01:05], and flags undefined child groups, duplicate hosts and circular children before ansible-inventory ever sees the file.",
  useCases: [
    "Converting a legacy INI hosts file to the YAML inventory format without hand-indenting every host",
    "Sketching a new environment's webservers, dbservers and prod parent group and counting hosts before provisioning",
    "Teaching teammates the difference between [group:children] and [group:vars] with instant side-by-side output",
  ],
  benefits: [
    ["Both formats from one spec", "Write INI-style once and copy either the INI hosts file or the equivalent all.children YAML tree."],
    ["Real validation", "Catches non key=value variables, self-referencing groups and circular :children chains as you type."],
    ["Range-aware host count", "Expands Ansible's inclusive [01:05] ranges so the host total reflects real machines."],
  ],
  faqs: [
    [
      "Should an Ansible inventory be INI or YAML?",
      "Both are fully supported; INI is terser for flat host lists while YAML handles nested groups and typed variables more cleanly. Ansible's documentation uses YAML for its main examples, and YAML avoids INI's quirk of parsing unquoted values like numbers as strings differently in vars sections.",
    ],
    [
      "What does [group:children] mean in an Ansible inventory?",
      "It declares other groups as members of a parent group, so [prod:children] containing webservers and dbservers makes every host in those two groups also part of prod. Variables set on prod then flow down to all child hosts, with child-group and host variables overriding parent values.",
    ],
    [
      "How do host ranges like web[01:05] work in Ansible?",
      "The range is inclusive and preserves zero padding, so web[01:05].example.com defines five hosts, web01 through web05. Alphabetic ranges such as db-[a:c] are also valid in Ansible; this tool counts numeric ranges when totalling hosts.",
    ],
    [
      "Where do ungrouped hosts go in an Ansible inventory?",
      "Hosts listed before the first group header belong to the implicit ungrouped group, and every host always belongs to the all group. That is why a playbook targeting all still hits hosts you never placed in a named group.",
    ],
  ],
};

export default seo;

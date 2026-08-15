const seo = {
  title: "DigitalOcean Cost Calculator: Droplets + Bandwidth",
  metaDescription:
    "Whole-bill estimate: Basic droplets billed at 1/672 per hour, volumes $0.10/GB, snapshots $0.06/GB, $12 load balancers and $0.01/GB bandwidth overage.",
  steps: [
    "Pick a 'Droplet plan (Basic, regular SSD)', the Number of droplets and 'Hours each droplet runs (672 = full month)'.",
    "Add block storage volume GB, snapshot GB, load balancer nodes and monthly outbound transfer — allowances pool account-wide, overage bills at $0.01/GB.",
    "Read the estimated monthly bill with per-line droplet, volume, snapshot, load balancer and bandwidth costs, then click Copy result.",
  ],
  intro:
    "This calculator estimates a full monthly DigitalOcean bill by combining Basic droplet prices with block storage at $0.10/GB, snapshots at $0.06/GB, load balancers at $12 per node and the $0.01/GB bandwidth overage that applies beyond the pooled transfer allowance. It is built for developers and small teams who run a few droplets and want the whole invoice — not just the headline droplet price — before they scale.",
  useCases: [
    "A developer running two 4 GB droplets with a load balancer who wants to know what 9 TB of monthly traffic adds in overage charges",
    "A startup sizing block storage and snapshot retention costs before setting up automated volume snapshots",
    "A student comparing whether the $4 or $6 droplet plan covers a side project once bandwidth is counted",
  ],
  benefits: [
    ["Whole-bill view", "Adds droplets, volumes, snapshots, load balancers and bandwidth overage into one monthly figure."],
    ["Pooled bandwidth modelled", "Each droplet's transfer allowance joins one account pool; only usage beyond it costs $0.01/GB."],
    ["Hourly billing respected", "Droplets are prorated at 1/672 of the monthly price per hour and capped at the monthly rate."],
  ],
  faqs: [
    [
      "How much does a DigitalOcean droplet cost per month?",
      "Basic shared-CPU droplets start at $4 per month for 512 MB RAM / 1 vCPU / 10 GB SSD, with common sizes at $6 (1 GB), $12 (2 GB), $24 (4 GB) and $48 (8 GB). Billing is hourly at 1/672 of the monthly price and stops accruing at 672 hours, so a droplet never costs more than its listed monthly rate.",
    ],
    [
      "How does DigitalOcean bandwidth billing work?",
      "Every droplet adds a monthly outbound transfer allowance (500 GB to several TB depending on size) to a single account-wide pool, and only outbound traffic beyond that pool is billed, at $0.01 per GiB. Inbound transfer is always free, and the allowance accrues hourly, so a droplet running half a month contributes half its allowance.",
    ],
    [
      "What do DigitalOcean volumes and snapshots cost?",
      "Block storage volumes cost $0.10 per GB per month and snapshots cost $0.06 per GB per month, both billed on the space actually provisioned or stored. A 100 GB volume therefore adds $10 per month and keeping 50 GB of snapshots adds $3.",
    ],
    [
      "Is a DigitalOcean load balancer worth $12 a month?",
      "A small load balancer node costs $12 per month and gives you health checks, TLS termination and traffic distribution across droplets, which you would otherwise run yourself on an extra droplet. For a two-droplet production setup it is usually cheaper than managing your own HAProxy droplet once your time is counted, but a single-droplet site does not need one.",
    ],
  ],
};

export default seo;

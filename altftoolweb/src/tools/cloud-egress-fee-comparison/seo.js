const seo = {
  title: "Cloud Egress Fee Comparison: AWS, Azure, GCP, Cloudflare",
  metaDescription:
    "Enter monthly GB to rank egress bills on AWS, Azure, GCP, Oracle, CloudFront, Bunny and Cloudflare, with free allowances and tiered list prices applied.",
  steps: [
    "Enter your Outbound traffic to the internet per month (GB), or tap a preset — 500 GB, 5 TB, 50 TB or 200 TB.",
    "Each provider's published free allowance and tiered list prices are applied to rank all seven from cheapest to dearest.",
    "Read the Monthly cost, Effective $/GB and the dearest-vs-cheapest spread, then click Copy result for a text summary.",
  ],
  intro:
    "This tool compares what one month of outbound internet traffic costs on AWS, Azure, Google Cloud, Oracle Cloud, Amazon CloudFront, Bunny CDN and Cloudflare, applying each provider's published free allowance and tiered per-GB list prices — for example AWS at $0.09/GB after 100 GB free versus Oracle's 10 TB free and Cloudflare's $0 egress. It is for engineers and founders deciding where to host bandwidth-heavy workloads, where egress often outweighs compute in the bill.",
  useCases: [
    "Estimating the bandwidth bill for a media site pushing 5 TB a month before choosing a host",
    "Quantifying the saving from fronting an S3 origin with CloudFront's 1 TB always-free tier",
    "Making the business case for moving downloads to Cloudflare R2 or Oracle to eliminate egress fees",
  ],
  benefits: [
    ["Seven providers, one view", "Clouds and CDNs ranked cheapest to dearest for your exact traffic volume."],
    ["Real tier maths", "Free allowances and volume-tier breakpoints are applied, not a single flat rate."],
    ["Effective $/GB", "Shows the blended per-gigabyte rate so odd tier boundaries do not mislead you."],
  ],
  faqs: [
    [
      "How much does cloud egress cost per GB?",
      "List prices for internet egress start around $0.09/GB on AWS, $0.087/GB on Azure and $0.12/GB on Google Cloud's premium tier, falling at volume tiers. Oracle Cloud gives 10 TB free then $0.0085/GB, Bunny CDN charges about $0.01/GB in EU/NA, and Cloudflare R2, Workers and Pages charge $0 for egress.",
    ],
    [
      "Is data transfer into the cloud free?",
      "Yes — ingress (data uploaded into AWS, Azure, GCP and most providers) is free. Charges apply when data leaves: to the internet, to another region, or across availability zones, each at its own rate, with internet egress usually the most expensive.",
    ],
    [
      "How much free egress do AWS, Azure and GCP give?",
      "AWS and Azure each include 100 GB of internet egress per month free across services; Amazon CloudFront adds an always-free 1 TB per month of CDN transfer. Google Cloud's premium-tier internet egress has no comparable blanket free allowance, which is why it usually ranks dearest in this comparison.",
    ],
    [
      "Why is Cloudflare egress free?",
      "Cloudflare prices R2, Workers and Pages with zero per-GB egress fees and recovers cost through storage, request and subscription pricing instead. The practical effect is that read-heavy or download-heavy workloads can be dramatically cheaper there — though you should compare request and storage fees too, not egress alone.",
    ],
  ],
};

export default seo;

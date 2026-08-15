const seo = {
  title: "AWS EBS Cost Calculator for gp3, gp2, io1, io2, st1, sc1",
  metaDescription:
    "Prices EBS volumes at us-east-1 list rates: gp3 $0.08/GB-month with 3,000 free IOPS, io2 tiered IOPS, plus snapshots — a line-item monthly breakdown.",
  steps: [
    "Choose a Volume type (gp3, gp2, io1, io2, st1 or sc1) and enter Volume size (GB), plus Provisioned IOPS and Provisioned throughput (MB/s) where the type supports them.",
    "Add the Number of identical volumes and Total snapshot storage (GB, standard tier) across the fleet.",
    "Read the estimated monthly EBS cost with storage, IOPS, throughput and snapshot line items, then press Copy result for the text summary.",
  ],
  intro:
    "This calculator estimates the monthly cost of Amazon EBS volumes by multiplying provisioned GB, IOPS and throughput by the published us-east-1 on-demand rates — for example gp3 at $0.08 per GB-month with the first 3,000 IOPS and 125 MB/s free, and io2 with tiered IOPS pricing. It is built for engineers and FinOps teams sizing EC2 storage who want a line-item breakdown of storage, IOPS, throughput and snapshot charges before they provision.",
  useCases: [
    "Comparing a 500 GB gp2 volume against gp3 with the same performance to see the saving from migrating",
    "Pricing an io2 database volume at 64,000 IOPS where the tiered IOPS schedule dominates the bill",
    "Estimating how much daily EBS snapshots retained for 30 days add to the monthly storage bill",
  ],
  benefits: [
    ["All six volume types", "gp3, gp2, io1, io2, st1 and sc1 with the correct per-type rate structure."],
    ["Free allowances applied", "gp3's 3,000 included IOPS and 125 MB/s throughput are deducted before charging."],
    ["io2 tier maths built in", "IOPS above 32,000 and 64,000 automatically bill at the lower tiered rates."],
  ],
  faqs: [
    [
      "How much does an EBS gp3 volume cost per month?",
      "In us-east-1, gp3 storage is $0.08 per GB-month, so a 100 GB volume costs $8.00 if you stay within the free 3,000 IOPS and 125 MB/s throughput. Extra IOPS cost $0.005 per provisioned IOPS-month and extra throughput $0.04 per MB/s-month.",
    ],
    [
      "Is gp3 cheaper than gp2?",
      "Yes, gp3 base storage is 20% cheaper — $0.08 versus $0.10 per GB-month in us-east-1 — and it includes 3,000 IOPS regardless of size. gp2 only reaches 3,000 IOPS at 1,000 GB (3 IOPS per GB), so most gp2 volumes can move to gp3 at equal or better performance for less money.",
    ],
    [
      "How are io2 IOPS charged?",
      "io2 IOPS bill on a tiered schedule in us-east-1: $0.065 per IOPS-month up to 32,000 IOPS, $0.046 for 32,001 to 64,000, and $0.032 above 64,000. Storage is a flat $0.125 per GB-month on top.",
    ],
    [
      "How much do EBS snapshots cost?",
      "Standard-tier EBS snapshots cost $0.05 per GB-month of stored data in us-east-1. Enter the total incremental snapshot GB stored across the fleet; the calculator does not multiply that total by volume count. The archive tier is cheaper per GB but has a 90-day minimum and slower restores.",
    ],
  ],
};

export default seo;

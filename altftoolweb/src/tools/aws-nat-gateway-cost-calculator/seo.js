const seo = {
  intro:
    "This calculator computes the true monthly cost of AWS NAT gateways as hourly charge + data processing + internet egress, using the published us-east-1 rates of $0.045 per gateway-hour and $0.045 per GB processed, plus tiered EC2 data-transfer-out starting at $0.09/GB. It is for platform and FinOps engineers who keep finding NAT as a surprise top-five line on the AWS bill and want to see which of the three components is driving it.",
  useCases: [
    "Budgeting a three-AZ production VPC where each AZ runs its own NAT gateway around the clock",
    "Explaining why 5 TB of container image pulls through NAT cost hundreds of dollars despite 'free' pulls",
    "Modelling the saving from adding an S3 gateway endpoint so backup traffic bypasses the NAT path",
  ],
  benefits: [
    ["All three charges", "Hourly, per-GB processing and the often-forgotten internet egress are summed together."],
    ["Effective $/GB", "Shows the blended cost per gigabyte moved so you can compare against PrivateLink at $0.01/GB."],
    ["Tiered egress maths", "Applies the 100 GB free allowance and the $0.09/$0.085/$0.07/$0.05 volume tiers automatically."],
  ],
  faqs: [
    [
      "How much does an AWS NAT gateway cost per month?",
      "About $32.85 per gateway just to exist — $0.045/hour for 730 hours in us-east-1 — before any traffic. Add $0.045 per GB processed, so a single gateway moving 1 TB a month costs roughly $78, plus internet data-transfer-out if the traffic leaves AWS.",
    ],
    [
      "Why is my NAT gateway bill so high?",
      "Because every gigabyte pays twice: $0.045/GB NAT data processing and, when it exits to the internet, data-transfer-out starting at $0.09/GB — about $0.135/GB combined. High-volume flows such as container image pulls, package downloads and S3 access routed through NAT multiply quickly.",
    ],
    [
      "Does traffic to S3 through a NAT gateway cost money?",
      "Yes — S3 traffic routed through a NAT gateway pays the $0.045/GB processing charge even though S3 transfer within the region is free. A gateway VPC endpoint for S3 or DynamoDB is free of charge and removes that cost entirely, which is the single most common NAT saving.",
    ],
    [
      "Do I need one NAT gateway per availability zone?",
      "For production, AWS recommends one per AZ so an AZ failure does not take out egress and you avoid cross-AZ data charges to reach the gateway. Each extra gateway adds about $32.85/month in hourly cost, so dev and test environments often share a single gateway to save money.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Peak Traffic Headroom Calculator: Size Servers for Spikes",
  metaDescription:
    "Project sale-day peak req/s from baseline x peak ratio x spike x growth, then get the instance count at your target utilization plus N+1 redundancy.",
  steps: [
    "Enter \"Baseline average traffic (req/s)\", the \"Daily peak-to-average ratio\", the \"Event spike multiplier\" and \"Growth until the event (%)\".",
    "Set \"Capacity of one instance (req/s)\", \"Target peak utilization (%)\" and \"Redundancy instances (N+R)\", plus \"Instances running today\" for the gap analysis.",
    "Read \"Instances to run for the event\", \"Current headroom at projected peak\" and \"Additional instances needed\", then click \"Copy result\".",
  ],
  intro:
    "This calculator computes the peak request rate a sale day, campaign or viral spike will produce and the number of instances needed to serve it at a safe utilization. It uses the standard capacity-planning chain — baseline traffic x daily peak-to-average ratio x event spike multiplier x growth, divided by a target peak utilization such as 60% — plus N+1 redundancy. It is built for engineers and SREs sizing a fleet before Black Friday, a product launch or a marketing push.",
  useCases: [
    "An e-commerce engineer expecting a 4x sale-day spike on a 200 req/s baseline who needs to know how many 250 req/s instances to run",
    "An SRE checking how much headroom the current fleet has left at the projected peak, and the largest spike it could absorb",
    "A startup planning a TV or influencer campaign who wants a defensible instance count to pre-scale to before autoscaling can react",
  ],
  benefits: [
    ["Utilization-aware sizing", "Divides projected peak by your target utilization so the buffer for retries, imbalance and GC pauses is explicit."],
    ["N+1 redundancy built in", "Adds configurable spare instances so losing one machine mid-spike does not consume the safety margin."],
    ["Gap analysis", "Shows current headroom, the peak utilization your fleet would actually hit, and exactly how many instances to add."],
  ],
  faqs: [
    [
      "How much server headroom do I need for a traffic spike?",
      "Plan so the projected peak lands at roughly 60% of total fleet capacity for latency-sensitive services, which leaves 40% headroom. The buffer absorbs uneven load balancing, retry storms and the loss of an instance; services that tolerate higher latency can target 70-80%.",
    ],
    [
      "How do I calculate peak traffic from average traffic?",
      "Multiply the daily average request rate by the peak-to-average ratio from your monitoring — typically 2 to 3 for consumer traffic — then by the event multiplier you expect and by (1 + growth). For example, 200 req/s average x 2.5 daily peak x 4 sale spike x 1.2 growth projects a 2,400 req/s peak.",
    ],
    [
      "Why not just rely on autoscaling for a sale day?",
      "Because most autoscalers react on a scale of minutes — metric collection, decision, instance boot and warm-up — while a flash sale or viral post arrives in seconds. The standard practice is to pre-scale to the calculated instance count before the event and let autoscaling handle drift afterwards.",
    ],
    [
      "What is N+1 redundancy in capacity planning?",
      "N+1 means running one more instance than the load calculation requires, so the failure (or deploy-time drain) of any single instance still leaves enough capacity to meet the target utilization. Larger fleets or stricter availability goals may use N+2 or a percentage-based buffer instead.",
    ],
  ],
};

export default seo;

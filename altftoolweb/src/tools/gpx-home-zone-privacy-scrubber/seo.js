const seo = {
  intro:
    "The GPX Home-Zone Privacy Scrubber strips the opening and closing track points from a GPX file so a shared ride or run no longer starts and ends at your front door, and rounds the remaining latitude and longitude values to a decimal precision you choose. You paste the GPX text, say how many points to cut from each end and how many decimal places to keep (2 to 7), and it rewrites the file in place while leaving every other tag untouched. It is for cyclists, runners and hikers who want to publish a route without publishing where they live.",
  useCases: [
    "You are about to upload a commute ride to a public activity feed and the trace currently begins in your driveway — trim the first few points so the visible route starts on the main road.",
    "You want to share a hiking GPX with a forum but not the exact parking spot of your car, so you drop coordinate precision from 6 decimals to 3, blurring each point to roughly 100 metres.",
    "A friend asked for the route of a group ride and you need to send a file that keeps the shape and elevation data intact but no longer resolves anyone's start address.",
  ],
  benefits: [
    [
      "Edits only the track points",
      "Elevation, timestamps, extensions and every surrounding tag pass through byte for byte; only the trkpt elements you asked to remove disappear and only lat/lon get rounded.",
    ],
    [
      "Two independent privacy levers",
      "Trimming hides where the route began and ended; rounding blurs the whole trace, so you can apply either or both depending on what you are protecting.",
    ],
    [
      "Shows exactly what was cut",
      "The output reports how many of the original track points survived, how many were removed from each end and the resulting file size, so you can verify before sharing.",
    ],
  ],
  faqs: [
    [
      "How many points should I trim from the start of a GPX file?",
      "Enough to cover the first few hundred metres of your route, which for a one-second recording usually means dozens of points, not one or two. Check the retained-points count the tool reports and open the result in a map viewer to confirm the new start is somewhere neutral, such as a junction or a park entrance.",
    ],
    [
      "What does rounding coordinates to fewer decimal places actually hide?",
      "Roughly: 5 decimal places locate a point to about 1 metre, 4 to about 11 metres, 3 to about 110 metres and 2 to about 1.1 kilometres. This tool accepts 2 to 7 decimals, so dropping from 6 to 3 turns a doorstep-precise trace into a neighbourhood-level one while keeping the route recognisable.",
    ],
    [
      "Is trimming the ends enough to stay anonymous?",
      "No — it removes the obvious clue, not every clue. A GPX can also carry waypoints, route elements, the creator device name, per-point timestamps and metadata, and a home location can still be inferred from many activities that all converge on the same block. Review those fields and consider whether repeated uploads reveal a pattern before you publish.",
    ],
    [
      "Does my GPX file get uploaded anywhere?",
      "No. The scrub is a text transformation that runs in your browser on the GPX you paste in; the file contents are never sent to a server. Nothing is stored after you close the tab.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Location History Cleaner: Redact Home and Work",
  metaDescription:
    "Deletes records inside a lat/lon/radius zone by haversine distance, then coarsens coordinates to 4, 3 or 2 decimals and times to 15 min, hour or day.",
  steps: [
    "Load a Google Takeout-style JSON, GeoJSON or CSV under History file, up to 25 MB, or paste it, then press Analyze locally.",
    "Under 2. Define private places give each zone a Label, latitude, longitude and radius in metres, adding more with Add another zone.",
    "Set Coordinate precision (4 decimals, roughly 11 m; 3, roughly 110 m; 2, roughly 1.1 km) and Timestamp precision, then Download sanitized JSON or CSV.",
  ],
  intro:
    "Location History Cleaner strips sensitive places out of an exported location file by deleting every record whose coordinates fall inside a privacy zone you define, then optionally coarsening the coordinates and timestamps that remain. Zones are a latitude, longitude and radius in metres, and membership is tested with the haversine great-circle distance; coordinates can be rounded to 4, 3 or 2 decimal places (roughly 11 m, 110 m or 1.1 km) and timestamps floored to 15 minutes, the hour or the UTC day. It reads JSON, GeoJSON, CSV and TSV, including Google's latitudeE7 and longitudeE7 integer encoding, and everything happens in your browser.",
  useCases: [
    "You want to share a year of GPS tracks with a researcher or a mapping project, but every point within 200 metres of your home and your child's school has to go first.",
    "A cycling or running export is going into a public dataset and you want the route shape preserved while the start and end points are blurred to about 110 metres.",
    "You are handing over a location log for an insurance or expense claim and need the times bucketed to the hour so the file shows where you were without reconstructing your minute-by-minute day.",
  ],
  benefits: [
    [
      "Removes whole records, not just the coordinate pair",
      "A point inside a privacy zone takes its entire parent record with it, so the timestamp, accuracy and activity fields do not survive to leak the visit.",
    ],
    [
      "Writes back into the original structure",
      "Sanitised values are set at the exact path they were found, preserving Google's E7 integer encoding, string-versus-number types and the surrounding schema so the file still imports.",
    ],
    [
      "Reports what it actually changed",
      "You get counts of points removed, coordinates coarsened, timestamps coarsened and how many points each zone matched, so you can verify the redaction worked.",
    ],
  ],
  faqs: [
    [
      "How much does rounding coordinates actually hide?",
      "At 4 decimal places a coordinate is precise to roughly 11 metres, at 3 places to roughly 110 metres, and at 2 places to roughly 1.1 kilometres. Two decimals is usually enough to obscure which building you were in while keeping the city and neighbourhood readable.",
    ],
    [
      "What file formats does it accept?",
      "JSON, GeoJSON Features and FeatureCollections, and delimited text with comma, tab or semicolon separators. Within JSON it recognises latitude/longitude, lat/lng, lat/lon, lat/long and Google's latitudeE7/longitudeE7 integer pairs, and it searches nested objects up to three levels deep for a matching timestamp field.",
    ],
    [
      "How does timestamp coarsening work?",
      "Timestamps are floored, not rounded to nearest, into buckets of 15 minutes, 60 minutes or 1440 minutes (one UTC day). Epoch seconds, epoch milliseconds and ISO strings are all detected and written back in their original form, so a numeric field stays numeric.",
    ],
    [
      "Does the cleaned file guarantee anonymity?",
      "No. Even coarsened traces can be re-identified from patterns — a repeated overnight location or a regular commute can still point to a home or workplace. Treat this as a strong first pass, review the output before sharing it, and take advice if the data is subject to legal or regulatory obligations.",
    ],
  ],
};

export default seo;

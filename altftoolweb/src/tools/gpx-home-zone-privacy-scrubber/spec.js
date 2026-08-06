// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "gpx-home-zone-privacy-scrubber",
  "title": "GPX Home-Zone Privacy Scrubber",
  "description": "Trim the start and end of a GPX route so it no longer reveals your home.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Security & Privacy",
    "Developer"
  ],
  "icon": "map-pinned",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "gpx",
      "label": "GPX text",
      "type": "textarea",
      "default": "<?xml version=\"1.0\"?><gpx><trk><trkseg>\n<trkpt lat=\"19.0760\" lon=\"72.8777\"><ele>10</ele></trkpt>\n<trkpt lat=\"19.0800\" lon=\"72.8800\"><ele>11</ele></trkpt>\n<trkpt lat=\"19.0900\" lon=\"72.8900\"><ele>12</ele></trkpt>\n</trkseg></trk></gpx>"
    },
    {
      "key": "remove_start",
      "label": "Start points to remove",
      "type": "number",
      "default": 1,
      "min": 0
    },
    {
      "key": "remove_end",
      "label": "End points to remove",
      "type": "number",
      "default": 1,
      "min": 0
    },
    {
      "key": "round",
      "label": "Coordinate decimal places",
      "type": "number",
      "default": 5,
      "min": 2,
      "max": 7
    }
  ],
  "presets": [
    {
      "label": "Trim first/last",
      "values": {
        "gpx": "<gpx><trk><trkseg><trkpt lat=\"19.0760\" lon=\"72.8777\"></trkpt><trkpt lat=\"19.0800\" lon=\"72.8800\"></trkpt><trkpt lat=\"19.0900\" lon=\"72.8900\"></trkpt></trkseg></trk></gpx>",
        "remove_start": 1,
        "remove_end": 1,
        "round": 5
      }
    }
  ],
  "outputLabel": "Scrubbed GPX",
  "note": "Removes entered numbers of first/last trkpt elements and rounds remaining coordinates locally. Inspect waypoints, routes, timestamps, metadata, photos, and repeated home visits before sharing."
},
  compute: (values) => {
      const text = String(values.gpx || ""), points = [...text.matchAll(/<trkpt\b[\s\S]*?<\/trkpt>|<trkpt\b[^>]*\/>/g)].map((match) => ({ raw: match[0], index: match.index }));
      const start = Math.max(0, Math.round(Number(values.remove_start) || 0)), end = Math.max(0, Math.round(Number(values.remove_end) || 0)), keepStart = Math.min(points.length, start), keepEnd = Math.max(keepStart, points.length - end), round = Math.max(2, Math.min(7, Math.round(Number(values.round) || 5)));
      let cursor = 0, output = "";
      points.forEach((point, index) => { output += text.slice(cursor, point.index); if (index >= keepStart && index < keepEnd) output += point.raw.replace(/(lat|lon)="(-?\d+(?:\.\d+)?)"/g, (_, key, number) => key + "=\"" + Number(number).toFixed(round) + "\""); cursor = point.index + point.raw.length; });
      output += text.slice(cursor);
      return { result: output || "—", caption: Math.max(0, keepEnd - keepStart) + "/" + points.length + " track points retained", rows: [["Start removed", keepStart], ["End removed", Math.max(0, points.length - keepEnd)], ["Coordinate decimals", round], ["Output characters", output.length]] };
    },
};

export default spec;

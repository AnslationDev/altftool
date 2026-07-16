export class PrivacyDetector {
  static analyzePrivacy(metadata) {
    const result = {
      hasGPS: false,
      hasAuthor: false,
      hasCopyright: false,
      hasSoftware: false,
      hasPersonalInfo: false,
      risks: [],
      recommendations: [],
    };

    if (!metadata) return result;

    const gpsRows = metadata.gps || [];
    const hasCoordinates = gpsRows.some(
      (r) =>
        (r.name === "GPS Latitude" || r.name === "GPS Longitude") &&
        r.value &&
        r.value !== "Type 5, 3 value(s)"
    );
    if (hasCoordinates) {
      result.hasGPS = true;
      result.risks.push({
        level: "high",
        label: "GPS Location",
        detail:
          "This image contains embedded GPS coordinates that can reveal the exact location where the photo was taken.",
      });
      result.recommendations.push(
        "Remove GPS coordinates before sharing this image publicly to protect location privacy."
      );
    }

    const allRows = [
      ...(metadata.camera || []),
      ...(metadata.exposure || []),
      ...(metadata.software || []),
      ...(metadata.dates || []),
      ...(metadata.raw || []),
    ];

    const artistRow = allRows.find(
      (r) => r.name === "Artist" || r.name === "Author"
    );
    if (artistRow && artistRow.value && artistRow.value.trim().length > 0) {
      result.hasAuthor = true;
      result.risks.push({
        level: "medium",
        label: "Author Name",
        detail: `The image contains an author/artist name: "${artistRow.value}". This can identify the photographer or creator.`,
      });
      result.recommendations.push(
        "Clear the Artist/Author field if you want to share the image anonymously."
      );
    }

    const copyrightRow = allRows.find((r) => r.name === "Copyright");
    if (
      copyrightRow &&
      copyrightRow.value &&
      copyrightRow.value.trim().length > 0
    ) {
      result.hasCopyright = true;
      result.risks.push({
        level: "low",
        label: "Copyright Notice",
        detail: `Copyright information is embedded: "${copyrightRow.value}". This reveals ownership details.`,
      });
      result.recommendations.push(
        "Note that copyright information is visible to anyone who inspects the metadata."
      );
    }

    const softwareRow = allRows.find((r) => r.name === "Software");
    if (
      softwareRow &&
      softwareRow.value &&
      softwareRow.value.trim().length > 0
    ) {
      result.hasSoftware = true;
      result.risks.push({
        level: "info",
        label: "Software Info",
        detail: `Software used: "${softwareRow.value}". This reveals editing tools and versions used.`,
      });
      result.recommendations.push(
        "Software metadata can reveal your editing workflow. Consider stripping it for a clean image."
      );
    }

    const personalFields = ["Artist", "Author", "Copyright", "GPS Latitude", "GPS Longitude", "GPS Altitude"];
    const personalHits = allRows.filter(
      (r) =>
        personalFields.includes(r.name) &&
        r.value &&
        r.value.trim().length > 0
    );
    if (personalHits.length >= 2) {
      result.hasPersonalInfo = true;
      result.risks.push({
        level: "high",
        label: "Combined Personal Info",
        detail:
          "Multiple pieces of personal information found in metadata. Combined data significantly increases identification risk.",
      });
      result.recommendations.push(
        "This image contains multiple personal identifiers. Use the Export tab to review all metadata before sharing."
      );
    }

    if (result.risks.length === 0) {
      result.recommendations.push(
        "This image appears to have minimal metadata exposure. It is relatively safe to share."
      );
    }

    return result;
  }
}

export default PrivacyDetector;

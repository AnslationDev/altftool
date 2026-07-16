import { checkSocialCompatibility } from "../utils/socialMedia";

export default function SocialMediaCheck({ analysisA, analysisB }) {
  if (!analysisA || !analysisB) return null;

  const compatA = checkSocialCompatibility(analysisA.width, analysisA.height);
  const compatB = checkSocialCompatibility(analysisB.width, analysisB.height);

  const renderTable = (title, compat, imgLabel) => (
    <div className="ircp-sm-col">
      <h4 className="ircp-rec-title">{title}</h4>
      <div className="ircp-table-wrap">
        <table className="ircp-table ircp-table-sm">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Size</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {compat.map((p) => (
              <tr key={p.platform}>
                <td className="ircp-table-label">{p.platform}</td>
                <td>{p.width}×{p.height}</td>
                <td>{p.score}%</td>
                <td>
                  <span className={`ircp-sm-badge ${p.compatible ? "ircp-sm-ok" : "ircp-sm-no"}`}>
                    {p.compatible ? "✓ Compatible" : "✗ Mismatch"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="ircp-card">
      <h3 className="ircp-card-title">Social Media Compatibility</h3>
      <div className="ircp-sm-grid">
        {renderTable("Image A", compatA, "A")}
        {renderTable("Image B", compatB, "B")}
      </div>
    </div>
  );
}

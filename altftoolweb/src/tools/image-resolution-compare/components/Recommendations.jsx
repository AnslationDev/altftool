import { getRecommendations } from "../utils/socialMedia";

export default function Recommendations({ analysisA, analysisB }) {
  if (!analysisA || !analysisB) return null;

  const recA = getRecommendations(analysisA);
  const recB = getRecommendations(analysisB);

  const renderRecs = (title, data) => (
    <div className="ircp-rec-col">
      <h4 className="ircp-rec-title">{title}</h4>
      {data.useCases.length > 0 && (
        <div className="ircp-rec-section">
          <div className="ircp-rec-section-label">Best Uses</div>
          <div className="ircp-rec-tags">
            {data.useCases.map((u) => <span key={u} className="ircp-rec-tag">{u}</span>)}
          </div>
        </div>
      )}
      {data.recommendations.length > 0 ? (
        <div className="ircp-rec-section">
          <div className="ircp-rec-section-label">Recommendations</div>
          {data.recommendations.map((r, i) => (
            <div key={i} className={`ircp-rec-item ircp-rec-${r.priority}`}>
              <span className="ircp-rec-type">{r.type}</span>
              <span>{r.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="ircp-rec-empty">No recommendations — image looks great!</div>
      )}
    </div>
  );

  return (
    <div className="ircp-card">
      <h3 className="ircp-card-title">Recommendations</h3>
      <div className="ircp-rec-grid">
        {renderRecs("Image A", recA)}
        {renderRecs("Image B", recB)}
      </div>
    </div>
  );
}

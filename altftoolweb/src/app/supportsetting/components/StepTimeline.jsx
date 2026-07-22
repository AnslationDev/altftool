"use client";

/**
 * Renders a setting's `afterImageContent.steps` as a numbered, connected
 * timeline instead of a plain ordered list — the "visual workflow / step
 * indicators" the detail page needs. Purely presentational; each step is
 * already plain-language text authored per setting.
 */
const StepTimeline = ({ steps, title = "Step-by-Step Process" }) => {
  if (!steps?.length) return null;

  return (
    <div className="support-detail-section support-timeline-section" aria-label={title}>
      <h2 className="support-detail-section-title">{title}</h2>
      <ol className="support-timeline">
        {steps.map((step, i) => (
          <li key={i} className="support-timeline-item">
            <span className="support-timeline-marker" aria-hidden="true">
              {i + 1}
            </span>
            <span className="support-timeline-content">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default StepTimeline;

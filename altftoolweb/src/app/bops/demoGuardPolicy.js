const DEMO_ACTION_LABEL =
  /(?:\b(?:get|request|compare|claim|see|start|check|find|send|submit|lock)\b.{0,28}\b(?:quote|estimate|rates?|savings)\b|\b(?:quote|estimate|rates?|savings)\b.{0,28}\b(?:get|request|compare|claim|see|start|check|find|send|submit|lock)\b|\bcall(?:\s+(?:now|us|today))?\b|\bdemo only\b)/i;

export function isBopsDemoActionLabel(label) {
  return typeof label === "string" && DEMO_ACTION_LABEL.test(label);
}

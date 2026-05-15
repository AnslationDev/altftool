import React from 'react';
import ChaosCanvas from './ChaosCanvas';

export default function ChaosComparison({
  params,
  initialAngles,
  delta = 0.001,   // tiny difference → identical at rest, chaotic divergence after start
  restartKey,
  paused,
  onStatsUpdate1,
  onStatsUpdate2,
}) {
  const { theta1, theta2 } = initialAngles;

  return (
    <div className="grid grid-cols-2 h-full w-full">
      <ChaosCanvas
        params={params}
        initialAngles={{ theta1, theta2 }}
        paused={paused}
        restartKey={restartKey}
        onStatsUpdate={onStatsUpdate1}
      />
      <ChaosCanvas
        params={params}
        initialAngles={{ theta1, theta2: theta2 + delta }}
        paused={paused}
        restartKey={restartKey}
        onStatsUpdate={onStatsUpdate2}
      />
    </div>
  );
}
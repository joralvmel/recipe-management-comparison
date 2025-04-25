import type { ProfilerOnRenderCallback } from 'react';
import { Profiler } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
) => {
  console.log(`Component ${id}: ${actualDuration.toFixed(2)}ms (${phase})`);

  const measurements = JSON.parse(localStorage.getItem('react-measurements') || '{}');

  if (!measurements[id]) {
    measurements[id] = [];
  }

  measurements[id].push({
    phase,
    actualDuration,
    baseDuration,
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem('react-measurements', JSON.stringify(measurements));
};

export function withProfiling<P extends object>(
  Component: React.ComponentType<P>,
  id: string
) {
  return (props: P) => (
    <Profiler id={id} onRender={onRenderCallback}>
      <Component {...props} />
    </Profiler>
  );
}
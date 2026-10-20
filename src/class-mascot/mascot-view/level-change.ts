import { useEffect, useRef, useState } from 'react';

import { MAX_POINTS } from '../constants';

type LevelDirection = 'up' | 'down';

interface LevelChange {
  direction: LevelDirection | null;
  // Changes on every level change, to restart the animation through a React key.
  changeKey: number;
}

// Text read by screen readers when the level changes.
function levelChangeAnnouncement(label: string, previous: number, current: number): string {
  if (current > previous) {
    if (current === MAX_POINTS) return `${label} chegou ao nível máximo, ${current}!`;
    return `${label} subiu para o nível ${current}.`;
  }
  return `${label} caiu para o nível ${current}.`;
}

// Tracks the level shown before, so a change can be animated and announced.
// The first render (the level the mascot already had) does not count as a change.
function useLevelChange(points: number): LevelChange & { previous: number | null } {
  const shown = useRef<number>(points);
  const [change, setChange] = useState<LevelChange & { previous: number | null }>({
    direction: null,
    changeKey: 0,
    previous: null,
  });

  useEffect(() => {
    const previous = shown.current;
    if (points === previous) return;
    shown.current = points;
    setChange((current) => ({
      direction: points > previous ? 'up' : 'down',
      changeKey: current.changeKey + 1,
      previous,
    }));
  }, [points]);

  return change;
}

export { LevelDirection, levelChangeAnnouncement, useLevelChange };

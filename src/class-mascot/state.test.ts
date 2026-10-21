import { INITIAL_POINTS, MAX_POINTS, MIN_POINTS } from './constants';
import {
  addPoint,
  hide,
  nextDecayAt,
  normalize,
  resetPoints,
  selectModel,
  registerActivity,
  setInactivityMinutes,
} from './state';
import { MascotState } from './types';

const MINUTE = 60 * 1000;
const START = 1_000_000_000_000;

function mascot(overrides: Partial<MascotState> = {}): MascotState {
  return {
    model: 'caramelo',
    visible: true,
    points: 5,
    inactivityMinutes: 8,
    lastActivityAt: START,
    updatedAt: START,
    ...overrides,
  };
}

describe('normalize', () => {
  it('keeps the points before a full inactivity window passes', () => {
    expect(normalize(mascot(), START + 8 * MINUTE - 1).points).toBe(5);
  });

  it('loses one point per full inactivity window', () => {
    expect(normalize(mascot(), START + 8 * MINUTE).points).toBe(4);
    expect(normalize(mascot(), START + 3 * 8 * MINUTE + MINUTE).points).toBe(2);
  });

  it('keeps the countdown to the next lost point', () => {
    const state = normalize(mascot(), START + 8 * MINUTE + 3 * MINUTE);
    expect(state.lastActivityAt).toBe(START + 8 * MINUTE);
    expect(normalize(state, START + 16 * MINUTE).points).toBe(3);
  });

  it('never goes below the minimum level', () => {
    expect(normalize(mascot(), START + 1000 * MINUTE).points).toBe(MIN_POINTS);
  });

  it('does not lose points while the mascot is hidden', () => {
    const hidden = mascot({ visible: false });
    expect(normalize(hidden, START + 100 * MINUTE)).toBe(hidden);
  });
});

describe('nextDecayAt', () => {
  it('is one inactivity window after the last activity', () => {
    expect(nextDecayAt(mascot(), START)).toBe(START + 8 * MINUTE);
  });

  it('is null at the minimum level or while hidden', () => {
    expect(nextDecayAt(mascot({ points: MIN_POINTS }), START)).toBeNull();
    expect(nextDecayAt(mascot({ visible: false }), START)).toBeNull();
  });
});

describe('selectModel', () => {
  it('creates a new mascot at the initial level', () => {
    const created = selectModel(null, 'mconfito', START);
    expect(created).toMatchObject({ model: 'mconfito', points: INITIAL_POINTS, visible: true });
    expect(created.lastActivityAt).toBe(START);
  });

  it('changes the model keeping the level and the countdown', () => {
    const changed = selectModel(mascot(), 'frajola', START + 2 * MINUTE);
    expect(changed).toMatchObject({ model: 'frajola', points: 5, lastActivityAt: START });
  });

  it('restarts the countdown when showing a hidden mascot', () => {
    const shown = selectModel(mascot({ visible: false }), 'caramelo', START + 60 * MINUTE);
    expect(shown).toMatchObject({ visible: true, points: 5, lastActivityAt: START + 60 * MINUTE });
    expect(normalize(shown, START + 61 * MINUTE).points).toBe(5);
  });
});

describe('addPoint', () => {
  it('adds a point and restarts the countdown', () => {
    const state = addPoint(mascot(), START + 3 * MINUTE);
    expect(state).toMatchObject({ points: 6, lastActivityAt: START + 3 * MINUTE });
  });

  it('applies the points lost before adding one', () => {
    expect(addPoint(mascot(), START + 16 * MINUTE).points).toBe(4);
  });

  it('stops at the maximum level', () => {
    expect(addPoint(mascot({ points: MAX_POINTS }), START).points).toBe(MAX_POINTS);
  });
});

describe('resetPoints', () => {
  it('goes back to the initial level', () => {
    expect(resetPoints(mascot({ points: 9 }), START + MINUTE)).toMatchObject({
      points: INITIAL_POINTS,
      lastActivityAt: START + MINUTE,
    });
  });
});

describe('setInactivityMinutes', () => {
  it('restarts the countdown so a shorter window does not take points at once', () => {
    const state = setInactivityMinutes(mascot(), 1, START + 7 * MINUTE);
    expect(state).toMatchObject({ inactivityMinutes: 1, points: 5 });
    expect(normalize(state, START + 7 * MINUTE + 59 * 1000).points).toBe(5);
  });
});

describe('hide', () => {
  it('keeps the level reached so far and stops the countdown', () => {
    const hidden = hide(mascot(), START + 9 * MINUTE);
    expect(hidden).toMatchObject({ visible: false, points: 4 });
    expect(normalize(hidden, START + 100 * MINUTE).points).toBe(4);
  });
});

describe('registerActivity', () => {
  it('restarts the countdown without adding points', () => {
    const state = registerActivity(mascot(), START + 5 * MINUTE, START + 5 * MINUTE);
    expect(state).toMatchObject({ points: 5, lastActivityAt: START + 5 * MINUTE });
    expect(normalize(state, START + 12 * MINUTE).points).toBe(5);
  });

  it('applies the points lost before the activity', () => {
    const state = registerActivity(mascot(), START + 17 * MINUTE, START + 17 * MINUTE);
    expect(state).toMatchObject({ points: 3, lastActivityAt: START + 17 * MINUTE });
  });

  it('uses the time of the activity, not when it was noticed', () => {
    const state = registerActivity(mascot(), START + 5 * MINUTE, START + 6 * MINUTE);
    expect(state).toMatchObject({
      lastActivityAt: START + 5 * MINUTE,
      updatedAt: START + 6 * MINUTE,
    });
  });

  it('ignores activity right after the last one, so nothing is saved', () => {
    const state = mascot();
    expect(registerActivity(state, START + 10 * 1000, START + 10 * 1000)).toBe(state);
  });

  it('ignores activity while the mascot is hidden', () => {
    const hidden = mascot({ visible: false });
    expect(registerActivity(hidden, START + 5 * MINUTE, START + 5 * MINUTE)).toBe(hidden);
  });

  it('never moves the countdown into the future', () => {
    const state = registerActivity(mascot(), START + 9 * MINUTE, START + 5 * MINUTE);
    expect(state.lastActivityAt).toBe(START + 5 * MINUTE);
  });
});

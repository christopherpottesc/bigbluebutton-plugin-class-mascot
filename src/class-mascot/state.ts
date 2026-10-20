import {
  ACTIVITY_MIN_INTERVAL_MS,
  DEFAULT_INACTIVITY_MINUTES,
  INITIAL_POINTS,
  MAX_POINTS,
  MIN_POINTS,
} from './constants';
import { MascotModel, MascotState } from './types';

// Rules for the mascot's points, as pure functions of the stored state and the time.
//
// Inactivity is not applied by a timer: every client derives the current level from
// when the last activity happened, so the mascot keeps losing points even with no
// moderator in the room. The stored state only changes on a moderator's action,
// which first folds the elapsed decay into it (see normalize).

function inactivityWindowMs(state: MascotState): number {
  return state.inactivityMinutes * 60 * 1000;
}

function isVisible(state: MascotState): boolean {
  return state.visible !== false;
}

// Applies the points lost to inactivity up to `now`. lastActivityAt moves forward by
// the decayed windows, so the countdown to the next lost point is kept.
function normalize(state: MascotState, now: number): MascotState {
  if (!isVisible(state)) return state;
  const windowMs = inactivityWindowMs(state);
  const lostPoints = Math.floor(Math.max(0, now - state.lastActivityAt) / windowMs);
  if (lostPoints === 0) return state;
  return {
    ...state,
    points: Math.max(MIN_POINTS, state.points - lostPoints),
    lastActivityAt: state.lastActivityAt + lostPoints * windowMs,
  };
}

// When the next point will be lost, or null while nothing can be lost.
function nextDecayAt(state: MascotState, now: number): number | null {
  const current = normalize(state, now);
  if (!isVisible(current) || current.points <= MIN_POINTS) return null;
  return current.lastActivityAt + inactivityWindowMs(current);
}

function selectModel(state: MascotState | null, model: MascotModel, now: number): MascotState {
  if (!state) {
    return {
      model,
      visible: true,
      points: INITIAL_POINTS,
      inactivityMinutes: DEFAULT_INACTIVITY_MINUTES,
      lastActivityAt: now,
      updatedAt: now,
    };
  }
  const current = normalize(state, now);
  return {
    ...current,
    model,
    visible: true,
    // A hidden mascot does not lose points; showing it again restarts the countdown.
    lastActivityAt: isVisible(current) ? current.lastActivityAt : now,
    updatedAt: now,
  };
}

function addPoint(state: MascotState, now: number): MascotState {
  const current = normalize(state, now);
  return {
    ...current,
    points: Math.min(current.points + 1, MAX_POINTS),
    lastActivityAt: now,
    updatedAt: now,
  };
}

function resetPoints(state: MascotState, now: number): MascotState {
  return {
    ...normalize(state, now),
    points: INITIAL_POINTS,
    lastActivityAt: now,
    updatedAt: now,
  };
}

// Restarts the countdown, so a shorter window does not take several points at once.
function setInactivityMinutes(state: MascotState, minutes: number, now: number): MascotState {
  return {
    ...normalize(state, now),
    inactivityMinutes: minutes,
    lastActivityAt: now,
    updatedAt: now,
  };
}

// Class activity (a student's chat message or reaction) restarts the countdown
// without adding points. Returns the same state, so nothing is saved, when the
// mascot is hidden or the activity is too close to the last one.
function registerActivity(state: MascotState, at: number, now: number): MascotState {
  if (!isVisible(state)) return state;
  const activityAt = Math.min(at, now);
  const current = normalize(state, activityAt);
  if (activityAt - current.lastActivityAt < ACTIVITY_MIN_INTERVAL_MS) return state;
  return { ...current, lastActivityAt: activityAt, updatedAt: now };
}

function hide(state: MascotState, now: number): MascotState {
  return { ...normalize(state, now), visible: false, updatedAt: now };
}

export {
  normalize,
  nextDecayAt,
  isVisible,
  selectModel,
  addPoint,
  resetPoints,
  setInactivityMinutes,
  registerActivity,
  hide,
};

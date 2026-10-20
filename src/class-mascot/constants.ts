import { MascotOption } from './types';

const MIN_POINTS = 1;
const MAX_POINTS = 10;
const INITIAL_POINTS = 1;
const DEFAULT_INACTIVITY_MINUTES = 8;
// Class activity closer than this to the last one is not saved again.
const ACTIVITY_MIN_INTERVAL_MS = 30 * 1000;

const DATA_CHANNEL_NAME = 'mascot-state';

const MASCOT_OPTIONS: MascotOption[] = [
  { model: 'mconfito', label: 'Mconfito', fallbackEmoji: '🦝' },
  { model: 'caramelo', label: 'Caramelo', fallbackEmoji: '🐕' },
  { model: 'frajola', label: 'Frajola', fallbackEmoji: '🐈' },
];

export {
  MIN_POINTS,
  MAX_POINTS,
  INITIAL_POINTS,
  DEFAULT_INACTIVITY_MINUTES,
  ACTIVITY_MIN_INTERVAL_MS,
  DATA_CHANNEL_NAME,
  MASCOT_OPTIONS,
};

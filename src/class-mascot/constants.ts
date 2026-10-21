import { MascotOption } from './types';

const MIN_POINTS = 1;
const MAX_POINTS = 10;
// New mascots start at the basic level of the scale; levels 1 and 2 are reached by inactivity.
const INITIAL_POINTS = 3;
const DEFAULT_INACTIVITY_MINUTES = 8;
// Class activity closer than this to the last one is not saved again.
const ACTIVITY_MIN_INTERVAL_MS = 30 * 1000;

const DATA_CHANNEL_NAME = 'mascot-state';

const MASCOT_OPTIONS: MascotOption[] = [
  // { model: 'mconfito', label: 'Mconfito', fallbackEmoji: '🦝' },
  { model: 'mconfito-pixel', label: 'Mconfito Pixel', fallbackEmoji: '🦝', pixelArt: true },
  { model: 'caramelo', label: 'Caramelo', fallbackEmoji: '🐕', pixelArt: true },
  { model: 'frajola', label: 'Frajola', fallbackEmoji: '🐈', pixelArt: true },
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

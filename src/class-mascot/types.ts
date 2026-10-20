interface ClassMascotProps {
  pluginName: string;
  pluginUuid: string;
  assetsBaseUrl: string;
}

type MascotModel = 'mconfito' | 'caramelo' | 'frajola';

interface MascotOption {
  model: MascotModel;
  label: string;
  fallbackEmoji: string;
}

// Shared by every participant through the data channel; only moderators push it.
interface MascotState {
  model: MascotModel;
  points: number;
  inactivityMinutes: number;
  // Timestamp (ms) of the last point gained or lost, the inactivity countdown starts here.
  lastActivityAt: number;
  // Timestamp (ms) of this change, used to pick the newest copy of the state.
  updatedAt: number;
  // False once a moderator closes the mascot; undefined counts as visible.
  visible?: boolean;
}

export { ClassMascotProps, MascotModel, MascotOption, MascotState };

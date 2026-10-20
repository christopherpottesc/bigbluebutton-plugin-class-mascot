// Floating window preferences kept per browser, so they survive hiding the mascot
// and reloading the room: where it was last dropped and whether it is minimized.
interface FloatingPosition {
  top: number;
  left: number;
}

const POSITION_STORAGE_KEY = 'class-mascot:floating-position';
const MINIMIZED_STORAGE_KEY = 'class-mascot:floating-minimized';
const DEFAULT_POSITION: FloatingPosition = { top: 80, left: 20 };

function readSavedPosition(): FloatingPosition {
  try {
    const saved = JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY));
    if (Number.isFinite(saved?.top) && Number.isFinite(saved?.left)) return saved;
  } catch {
    // Storage blocked or invalid: fall back to the default.
  }
  return DEFAULT_POSITION;
}

// BBB moves the window with react-draggable, which stores the position as
// `transform: translate(<left>px, <top>px)` on the element given to the plugin.
function savePositionOnDrop(element: HTMLElement): void {
  element.addEventListener('pointerup', () => {
    const match = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(element.style.transform);
    if (!match) return;
    try {
      localStorage.setItem(
        POSITION_STORAGE_KEY,
        JSON.stringify({
          left: Number(match[1]),
          top: Number(match[2]),
        })
      );
    } catch {
      // Storage blocked: the window keeps its position until it is recreated.
    }
  });
}

// Whether this user minimized the floating window; it only affects their own view.
function readMinimized(): boolean {
  try {
    return localStorage.getItem(MINIMIZED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveMinimized(minimized: boolean): void {
  try {
    localStorage.setItem(MINIMIZED_STORAGE_KEY, String(minimized));
  } catch {
    // Storage blocked: the choice lasts until the window is recreated.
  }
}

export { readSavedPosition, savePositionOnDrop, readMinimized, saveMinimized };

// Where the floating window was last dropped, kept per browser so it survives
// hiding the mascot and reloading the room.
interface FloatingPosition {
  top: number;
  left: number;
}

const POSITION_STORAGE_KEY = 'class-mascot:floating-position';
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

export { readSavedPosition, savePositionOnDrop };

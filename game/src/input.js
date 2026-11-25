// Keyboard and mouse input. WASD or arrows move the chef; E or Space is the
// one interact key; P or Escape pauses; M mutes. A mouse click sets a walk
// target, and clicking a station while standing next to it interacts with it.
export const ACTION_INTERACT = 'interact';
export const ACTION_PAUSE = 'pause';
export const ACTION_MUTE = 'mute';

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let click = null;
  let clickTarget = null;

  function keyName(event) {
    if (event.code === 'Space') return 'Space';
    return event.code;
  }

  window.addEventListener('keydown', (event) => {
    const name = keyName(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(name)) {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(name);
    keys.add(name);
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(keyName(event));
  });
  window.addEventListener('blur', () => {
    keys.clear();
  });

  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    click = { x, y };
    clickTarget = { x, y };
  });

  function axis(negative, positive) {
    let value = 0;
    if (keys.has(negative)) value -= 1;
    if (keys.has(positive)) value += 1;
    return value;
  }

  return {
    // A normalised movement vector from the keys, or null when no key is down.
    moveVector() {
      const x = axis('ArrowLeft', 'ArrowRight') + axis('KeyA', 'KeyD');
      const y = axis('ArrowUp', 'ArrowDown') + axis('KeyW', 'KeyS');
      if (x === 0 && y === 0) return null;
      const length = Math.hypot(x, y);
      return { x: x / length, y: y / length };
    },
    // The mouse walk target, cleared once the chef arrives (set null by the caller).
    clickTarget() {
      return clickTarget;
    },
    clearClickTarget() {
      clickTarget = null;
    },
    // True once per key press or mouse click; the caller drains it every frame.
    takeAction(name) {
      if (name === ACTION_INTERACT) {
        if (pressed.has('KeyE') || pressed.has('Space') || click !== null) {
          pressed.delete('KeyE');
          pressed.delete('Space');
          click = null;
          return true;
        }
        return false;
      }
      if (name === ACTION_PAUSE) {
        if (pressed.has('KeyP') || pressed.has('Escape')) {
          pressed.delete('KeyP');
          pressed.delete('Escape');
          return true;
        }
        return false;
      }
      if (name === ACTION_MUTE) {
        if (pressed.has('KeyM')) {
          pressed.delete('KeyM');
          return true;
        }
        return false;
      }
      return false;
    },
  };
}

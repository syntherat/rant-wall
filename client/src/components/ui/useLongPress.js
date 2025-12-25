import { useRef } from "react";

export default function useLongPress(onLongPress, { delay = 260 } = {}) {
  const t = useRef(null);
  const fired = useRef(false);

  const start = (e) => {
    fired.current = false;
    clearTimeout(t.current);
    t.current = setTimeout(() => {
      fired.current = true;
      onLongPress?.(e);
    }, delay);
  };

  const clear = () => {
    clearTimeout(t.current);
    t.current = null;
  };

  // if long-press fired, prevent click from also triggering
  const shouldCancelClick = () => fired.current;

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    shouldCancelClick,
  };
}

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { INITIAL_VIEW } from '../model/view';

const clampZoom = (zoom: number) => Math.max(0.35, Math.min(3, zoom));
const clampTilt = (tilt: number) => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, tilt));
interface Position {
  x: number;
  y: number;
}

function distance(points: Map<number, Position>): number {
  const [a, b] = [...points.values()];
  return a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0;
}

export function useModelViewer() {
  const [view, setView] = useState(INITIAL_VIEW);
  const [dragging, setDragging] = useState(false);
  const surface = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Position>());

  function rotate(horizontal: number, vertical: number) {
    setView((current) => ({
      ...current,
      rotation: (current.rotation - horizontal) % (2 * Math.PI),
      tilt: clampTilt(current.tilt + vertical),
    }));
  }
  function zoomBy(factor: number) {
    setView((current) => ({ ...current, zoom: clampZoom(current.zoom * factor) }));
  }
  function reset() {
    setView(INITIAL_VIEW);
  }
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || pointers.current.size >= 2) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setDragging(true);
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const before = distance(pointers.current);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const after = distance(pointers.current);
      if (before > 0 && after > 0) zoomBy(after / before);
    } else {
      rotate((event.clientX - previous.x) * 0.01, (event.clientY - previous.y) * 0.01);
    }
  }
  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(pointers.current.size > 0);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowLeft':
        rotate(-0.2, 0);
        break;
      case 'ArrowRight':
        rotate(0.2, 0);
        break;
      case 'ArrowUp':
        rotate(0, -0.2);
        break;
      case 'ArrowDown':
        rotate(0, 0.2);
        break;
      case '+':
      case '=':
        zoomBy(1.2);
        break;
      case '-':
        zoomBy(1 / 1.2);
        break;
      case 'Home':
        reset();
        break;
      default:
        return;
    }
    event.preventDefault();
  }
  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 320 : 1;
      setView((current) => ({
        ...current,
        zoom: clampZoom(current.zoom * Math.exp(-event.deltaY * unit * 0.002)),
      }));
    }
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', onWheel);
    };
  }, []);

  return {
    view,
    dragging,
    surface,
    rotate,
    zoomBy,
    reset,
    interaction: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onLostPointerCapture: onPointerEnd,
      onKeyDown,
    },
  };
}

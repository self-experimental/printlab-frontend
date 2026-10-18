import { useState } from 'react';
import type { Model } from '../stl';
import { projectModel } from '../utils/project-model';

export function useModelViewer(model: Model) {
  const [rotation, setRotation] = useState(-0.55);
  const [zoom, setZoom] = useState(1);
  const [wireframe, setWireframe] = useState(false);

  const { faces, stride } = projectModel(model, rotation, zoom);
  function rotateLeft() {
    setRotation(rotation - 0.3);
  }
  function rotateRight() {
    setRotation(rotation + 0.3);
  }
  function zoomOut() {
    setZoom(Math.max(0.5, zoom - 0.2));
  }
  function zoomIn() {
    setZoom(Math.min(1.8, zoom + 0.2));
  }
  function toggleWireframe() {
    setWireframe(!wireframe);
  }
  return { faces, stride, wireframe, rotateLeft, rotateRight, zoomOut, zoomIn, toggleWireframe };
}

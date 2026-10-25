import type { Camera, Mesh, Scene } from 'three';

/** jsdom has no GPU. Keep real Three geometry/camera maths, substitute only the device. */
export class MockWebGLRenderer {
  static fail = false;
  static instances: MockWebGLRenderer[] = [];
  domElement = document.createElement('canvas');
  toneMapping = 0;
  disposed = false;
  scene: Scene | null = null;
  camera: Camera | null = null;
  constructor() {
    if (MockWebGLRenderer.fail) throw new Error('WebGL unavailable');
    MockWebGLRenderer.instances.push(this);
  }
  setPixelRatio() {
    /* No display density in jsdom. */
  }
  setClearColor() {
    /* Real pixels are checked in Playwright. */
  }
  setSize(width: number, height: number) {
    this.domElement.width = width;
    this.domElement.height = height;
  }
  render(scene: Scene, camera: Camera) {
    this.scene = scene;
    this.camera = camera;
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    const mesh = scene.getObjectByName('uploaded-model') as Mesh;
    const positions = mesh.geometry.getAttribute('position');
    const projected = [];
    for (let i = 0; i < Math.min(positions.count, 12); i++) {
      const point = mesh.position.clone().fromBufferAttribute(positions, i);
      mesh.localToWorld(point);
      point.project(camera);
      projected.push(point.toArray().map((value) => value.toFixed(6)));
    }
    this.domElement.dataset.projection = JSON.stringify(projected);
  }
  dispose() {
    this.disposed = true;
  }
}

export interface ModelView {
  rotation: number;
  tilt: number;
  zoom: number;
}

export const INITIAL_VIEW: ModelView = { rotation: -Math.PI / 4, tilt: Math.PI / 6, zoom: 1 };

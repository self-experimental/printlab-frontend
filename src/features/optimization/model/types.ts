export interface OptimizationRequest {
  material: string;
  load: number;
  factor: number;
  layer: string;
  walls: string;
  priority: string;
  orientation: string;
  requirements: string[];
  file: string;
}

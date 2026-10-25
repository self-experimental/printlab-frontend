export type OptimizationPriority = 'MIN_WEIGHT' | 'MIN_TIME' | 'MAX_STRENGTH' | 'BALANCED';

export interface OptimizationRequest {
  material: string;
  materialProfileId?: string;
  requiredLoadN: number;
  safetyFactor: number;
  maxPrintTimeMin: number;
  maxMaterialConsumptionG: number;
  layerHeightMm: number;
  perimeters: number;
  infillPattern: string;
  printOrientation: string;
  testType: string;
  priority: OptimizationPriority;
}

export interface Experiment {
  id: string;
  modelId: string;
  material: string;
  infillPercent: number;
  infillPattern: string;
  perimeters: number;
  layerHeightMm: number;
  printOrientation: string;
  compressiveStrengthMpa: number;
  printTimeMin: number;
  materialConsumptionG: number;
  failureLoadN: number | null;
  testType: string;
}

export interface OptimizationResponse {
  matchedModelId: string;
  matchedModelName: string;
  selectedExperimentId: string;
  recommendedInfillPercent: number;
  recommendedInfillPattern: string;
  recommendedPerimeters: number;
  recommendedLayerHeightMm: number;
  recommendedOrientation: string;
  expectedCompressiveStrengthMpa: number;
  expectedPrintTimeMin: number;
  expectedMaterialConsumptionG: number;
  loadCapacityN: number | null;
  warnings: string[];
  explanation: string;
  experiments: Experiment[];
}

export interface OptimizationResult {
  request: OptimizationRequest;
  fileName: string;
  response: OptimizationResponse;
}

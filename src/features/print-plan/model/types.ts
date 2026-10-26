export type InfillPattern = 'GYROID' | 'RECTILINEAR' | 'GRID' | 'CUBIC';
export interface PrintPlanRequest {
  description?: string;
  materialProfileId?: string;
  priority?: 'MIN_MATERIAL' | 'MIN_TIME' | 'BALANCED';
  layerHeightMm?: number;
  minimumInfillPercent?: number;
  minimumPerimeters?: number;
  supportMode?: 'AUTO' | 'NONE';
  infillPattern?: InfillPattern;
  topLayers?: number;
  bottomLayers?: number;
  maxPrintTimeMin?: number;
  maxMaterialConsumptionG?: number;
}
export interface PartRecommendation {
  source: 'LOCAL_MODEL' | 'RULES' | 'FALLBACK' | 'DEFAULT';
  purpose: string;
  summary: string;
  items: { title: string; text: string }[];
}
export interface PrintCandidate {
  id: string;
  infillPercent: number;
  perimeters: number;
  layerHeightMm: number;
  infillPattern: InfillPattern;
  topLayers?: number;
  bottomLayers?: number;
  supportMode?: 'AUTO' | 'NONE';
  estimatedPrintTimeMin: number;
  estimatedMaterialG: number;
  meetsConstraints: boolean;
}
export interface PrintPlanResponse {
  printerName: string;
  nozzleDiameterMm: number;
  bedType: string;
  materialName: string;
  engineVersion: string;
  selectedCandidateId: string;
  plannedCandidateCount: number;
  candidates: PrintCandidate[];
  warnings: string[];
  explanation: string;
  recommendation?: PartRecommendation;
}
export interface PrintPlanResult {
  request: PrintPlanRequest;
  fileName: string;
  response: PrintPlanResponse;
}
export const supportedFamilies = new Set(['PLA', 'PETG', 'TPU_95A']);

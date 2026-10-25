export interface PrintPlanRequest {
  materialProfileId: string;
  priority: 'MIN_MATERIAL' | 'MIN_TIME' | 'BALANCED';
  layerHeightMm: number;
  minimumInfillPercent: number;
  minimumPerimeters: number;
  supportMode: 'AUTO' | 'NONE';
  maxPrintTimeMin: number;
  maxMaterialConsumptionG: number;
}
export interface PrintCandidate {
  id: string;
  infillPercent: number;
  perimeters: number;
  layerHeightMm: number;
  infillPattern: 'GYROID' | 'RECTILINEAR';
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
  candidates: PrintCandidate[];
  warnings: string[];
  explanation: string;
}
export interface PrintPlanResult {
  request: PrintPlanRequest;
  fileName: string;
  response: PrintPlanResponse;
}
export const supportedFamilies = new Set(['PLA', 'PETG', 'TPU_95A']);

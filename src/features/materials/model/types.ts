export interface MaterialRange {
  min: number;
  max: number;
}
export type MaterialProperty =
  'TENSILE_YIELD_STRENGTH' | 'TENSILE_STRENGTH' | 'TENSILE_MODULUS' | 'FLEXURAL_STRENGTH';
export interface MaterialMeasurement {
  property: MaterialProperty;
  value: number;
  uncertainty: number | null;
  unit: 'MPa';
  method: string;
  direction: 'HORIZONTAL' | 'VERTICAL_XZ' | 'UNSPECIFIED';
}
export interface MaterialConditions {
  printer: string;
  slicer: string;
  layerHeightMm: number;
  perimeters: number;
  infillPercent: number;
  infillPattern: string;
  topLayers: number;
  bottomLayers: number;
  infillPrintSpeedMmS: number;
  nozzleTemperatureC: number;
  bedTemperatureC: number;
  nozzleDiameterMm: number | null;
  extrusionMultiplier: number | null;
  coolingFanPercent: number | null;
  notes: string[];
}
export interface MaterialProfile {
  id: string;
  family: string;
  name: string;
  manufacturer: string;
  source: {
    title: string;
    url: string;
    version: string;
    publishedOn: string;
    verifiedOn: string;
    pages: number[];
    sha256: string;
  };
  printing: {
    nozzleTemperatureC: MaterialRange;
    bedTemperatureC: MaterialRange;
    maxPrintSpeedMmS: number;
    coolingFanPercent: MaterialRange;
    hardenedNozzleRequired: boolean | null;
  };
  densityGcm3: number;
  densityMethod: string;
  hdtAt045MpaC: number | null;
  hdtAt180MpaC: number | null;
  testSeries: {
    id: string;
    specimenType: 'PRINTED' | 'INJECTION_MOLDED';
    specimenDescription: string;
    conditions: MaterialConditions | null;
    measurements: MaterialMeasurement[];
  }[];
  notes: string[];
}
export interface MaterialCatalog {
  schemaVersion: 1;
  materials: MaterialProfile[];
}

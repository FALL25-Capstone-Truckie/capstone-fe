// Weight units configuration - moved from database settings to properties
export interface WeightUnitConfig {
  value: string;
  label: string;
}

// Available weight units - this should match backend configuration
export const WEIGHT_UNITS: WeightUnitConfig[] = [
  { value: 'Tấn', label: 'Tấn' },
  { value: 'Kí', label: 'Kí' },
  { value: 'Tạ', label: 'Tạ' },
  { value: 'Yến', label: 'Yến' },
];

// Default weight unit
export const DEFAULT_WEIGHT_UNIT = 'Tấn';

// Helper functions
export const getWeightUnits = (): WeightUnitConfig[] => {
  return WEIGHT_UNITS;
};

export const getDefaultWeightUnit = (): string => {
  return DEFAULT_WEIGHT_UNIT;
};

export const isValidWeightUnit = (unit: string): boolean => {
  return WEIGHT_UNITS.some(wu => wu.value === unit);
};

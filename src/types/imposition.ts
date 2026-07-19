export type ImpositionType = 'nup' | 'booklet' | 'perfect-bound' | 'cards' | 'cutstack' | 'work-turn' | 'work-tumble';

export type Unit = 'mm' | 'cm' | 'in';

export type Orientation = 'portrait' | 'landscape';

export type SheetPreset = 'A4' | 'A3' | 'MegaA3' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom';

export interface SheetSize {
  width: number;
  height: number;
}

export const SHEET_PRESETS: Record<SheetPreset, SheetSize> = {
  A4: { width: 595.28, height: 841.89 },
  A3: { width: 841.89, height: 1190.55 },
  MegaA3: { width: 935.43, height: 1360.63 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
  Custom: { width: 595.28, height: 841.89 },
};

export const UNITS: { value: Unit; label: string; pointsPerUnit: number }[] = [
  { value: 'mm', label: 'mm', pointsPerUnit: 2.834645669 },
  { value: 'cm', label: 'cm', pointsPerUnit: 28.34645669 },
  { value: 'in', label: 'pulg', pointsPerUnit: 72 },
];

export function unitToPoints(value: number, unit: Unit): number {
  const entry = UNITS.find(u => u.value === unit);
  return value * (entry?.pointsPerUnit ?? 1);
}

export function pointsToUnit(points: number, unit: Unit): number {
  const entry = UNITS.find(u => u.value === unit);
  return points / (entry?.pointsPerUnit ?? 1);
}

export interface NUpConfig {
  pagesPerSheet: number;
  orientation: Orientation;
}

export interface BookletConfig {
  signatureSize: number;
  autoCreep: boolean;
  manualCreep: number;
  paperGsm: number;
}

export interface PerfectBoundConfig {
  signatureSize: number;
}

export interface CardsConfig {
  cardWidth: number;
  cardHeight: number;
  cols: number;
  rows: number;
  gutter: number;
  sourcePage: number;
}

export type BindingStyle = 'none' | 'wire-o' | 'spiral' | 'binder';

export interface ProductionMarks {
  cropMarks: boolean;
  cropMarkLength: number;
  cropMarkOffset: number;
  cropMarkThickness: number;
  registrationMarks: boolean;
  bleed: number;
  colorBar: boolean;
  colorBarType: 'CMYK' | 'grayscale';
  pdfxOutput: boolean;
  pdfxProfile: 'FOGRA39' | 'GRACoL2006' | 'SWOPv2' | 'ISOcoatedv2';
  foldMarks: boolean;
  bindingStyle: BindingStyle;
  signatureNumbering: boolean;
  overprintPreview: boolean;
}

export interface GripperConfig {
  enabled: boolean;
  size: number;
  side: 'top' | 'bottom' | 'left' | 'right';
}

export type BleedMode = 'none' | 'scale' | 'crop' | 'extend';

export interface SheetConfig {
  preset: SheetPreset;
  width: number;
  height: number;
  orientation: Orientation;
  margins: number;
  gutter: number;
  centerContent: boolean;
  gripper: GripperConfig;
  bleedMode: BleedMode;
  extendColor: string;
}

export interface NUpCell {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ImpositionSheet {
  cells: NUpCell[];
  sheetIndex: number;
}

export interface ImpositionLayout {
  sheets: ImpositionSheet[];
  totalSheets: number;
  sheetWidth: number;
  sheetHeight: number;
}

export interface CmykColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface MarksOverlay {
  cropLineThickness: number;
  cropLines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  registrationCenters: Array<{ cx: number; cy: number }>;
  bleedBoxes: Array<{ x: number; y: number; w: number; h: number }>;
  colorBarPatches: Array<{ x: number; y: number; w: number; h: number; color: string; cmyk: CmykColor }>;
  foldLines: Array<{ x1: number; y1: number; x2: number; y2: number; dashed: boolean }>;
  bindingMarks: Array<{ cx: number; cy: number; radius: number }>;
  signatureLabels: Array<{ x: number; y: number; text: string }>;
}

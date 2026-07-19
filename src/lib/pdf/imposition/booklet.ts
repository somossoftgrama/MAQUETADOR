import type { ImpositionLayout, BookletConfig, SheetConfig } from '@/types/imposition';
import type { NUpCell, ImpositionSheet } from '@/types/imposition';
import { getGripperMargins } from './nup';

const MM_TO_PT = 2.834645669;

const PAPER_CALIPER_MM: Record<number, number> = {
  70: 0.08, 80: 0.09, 90: 0.10, 100: 0.11, 115: 0.12, 120: 0.13,
  130: 0.14, 135: 0.15, 150: 0.16, 170: 0.18, 200: 0.20,
  250: 0.25, 300: 0.30, 350: 0.35,
};

function getCaliperPt(gsm: number): number {
  const exact = PAPER_CALIPER_MM[gsm];
  if (exact) return exact * MM_TO_PT;
  const entries = Object.entries(PAPER_CALIPER_MM)
    .map(([k, v]) => [Number(k), v] as const)
    .sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < entries.length; i++) {
    if (gsm < entries[i][0]) {
      const ratio = (gsm - entries[i - 1][0]) / (entries[i][0] - entries[i - 1][0]);
      const caliperMm = entries[i - 1][1] + ratio * (entries[i][1] - entries[i - 1][1]);
      return caliperMm * MM_TO_PT;
    }
  }
  return gsm * 0.001 * MM_TO_PT;
}

function calcularCreepPerSheet(paperGsm: number, visualScale: number = 1): number {
  if (paperGsm <= 0) return 0;
  return getCaliperPt(paperGsm) * visualScale;
}

export function calcularCreepAutomatico(pageCount: number, paperGsm: number = 130): number {
  if (pageCount <= 8) return 0;
  const numSheets = Math.ceil(pageCount / 4);
  return (numSheets - 1) * getCaliperPt(paperGsm);
}

export function calculateBookletLayout(
  pageCount: number,
  pageWidth: number,
  pageHeight: number,
  booklet: BookletConfig,
  sheet: SheetConfig,
  options?: { autoCreep?: boolean; creepVisualScale?: number },
): ImpositionLayout {
  const { signatureSize, autoCreep, manualCreep } = booklet;
  const { width: sheetW, height: sheetH, centerContent } = sheet;
  const gm = getGripperMargins(sheet);

  const cellW = pageWidth;
  const cellH = pageHeight;

  const spineCenter = centerContent
    ? gm.left + (sheetW - gm.left - gm.right) / 2
    : gm.left + cellW;

  const offsetY = centerContent
    ? gm.top + (sheetH - gm.top - gm.bottom - cellH) / 2
    : gm.top;

  const sigSize = signatureSize > 0 && signatureSize < pageCount
    ? signatureSize
    : pageCount;

  const visualScale = options?.creepVisualScale ?? 1;

  const sheets: ImpositionSheet[] = [];
  let sheetIdx = 0;

  for (let sigStart = 0; sigStart < pageCount; sigStart += sigSize) {
    const sigEnd = Math.min(sigStart + sigSize, pageCount);
    const sigPadded = Math.ceil((sigEnd - sigStart) / 4) * 4;
    const sigSheets = sigPadded / 4;

    const order = buildSignatureOrder(sigPadded, sigStart, pageCount);

    const creep = autoCreep
      ? calcularCreepPerSheet(booklet.paperGsm, visualScale)
      : manualCreep * visualScale;

    for (let s = 0; s < sigSheets; s++) {
      const pageRight = order[s * 4 + 0];
      const pageLeftFront = order[s * 4 + 1];
      const pageRightFront = order[s * 4 + 2];
      const pageLeftBack = order[s * 4 + 3];

      const co = creep * s;

      const frontLeftX = spineCenter - cellW - co;
      const frontRightX = spineCenter + co;
      const backLeftX = spineCenter - cellW - co;
      const backRightX = spineCenter + co;

      const frontCells: NUpCell[] = [
        {
          pageIndex: pageLeftFront,
          x: frontLeftX,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 0,
        },
        {
          pageIndex: pageRightFront,
          x: frontRightX,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 180,
        },
      ];

      const backCells: NUpCell[] = [
        {
          pageIndex: pageLeftBack,
          x: backLeftX,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 180,
        },
        {
          pageIndex: pageRight,
          x: backRightX,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 0,
        },
      ];

      sheets.push({ cells: frontCells, sheetIndex: sheetIdx++ });
      sheets.push({ cells: backCells, sheetIndex: sheetIdx++ });
    }
  }

  return { sheets, totalSheets: sheets.length, sheetWidth: sheetW, sheetHeight: sheetH };
}

/**
 * Genera el orden de páginas saddle-stitch (JDF BinderySignature / Gathering).
 * Algoritmo: toma pares desde los extremos hacia el centro: [last, first, first+1, last-1, ...]
 * Cada bloque de 4 páginas forma un pliego físico (frente y dorso).
 * Las páginas fuera de rango (más allá de totalPageCount) se marcan como -1 (blanco).
 *
 * Ejemplo para 8 páginas: [7, 0, 1, 6, 5, 2, 3, 4]
 */
export function buildSignatureOrder(
  paddedSize: number,
  baseIndex: number,
  totalPageCount: number,
): number[] {
  const order: number[] = [];
  let left = 0;
  let right = paddedSize - 1;

  while (left < right) {
    order.push(baseIndex + right);
    order.push(baseIndex + left);
    order.push(baseIndex + left + 1);
    order.push(baseIndex + right - 1);
    left += 2;
    right -= 2;
  }

  return order.map((pi) => (pi < totalPageCount ? pi : -1));
}

export function getBookletPagePreview(pageCount: number, signatureSize: number = 0): string[] {
  const sigSize = signatureSize > 0 && signatureSize < pageCount ? signatureSize : pageCount;
  const preview: string[] = [];
  for (let sigStart = 0; sigStart < pageCount; sigStart += sigSize) {
    const sigEnd = Math.min(sigStart + sigSize, pageCount);
    const sigPadded = Math.ceil((sigEnd - sigStart) / 4) * 4;
    const sigSheets = sigPadded / 4;
    const order = buildSignatureOrder(sigPadded, sigStart, pageCount);
    for (let s = 0; s < sigSheets; s++) {
      const sigNum = Math.floor(sigStart / sigSize) + 1;
      const p0 = order[s * 4 + 0], p1 = order[s * 4 + 1], p2 = order[s * 4 + 2], p3 = order[s * 4 + 3];
      const label = (i: number) => i >= 0 ? `pág. ${i + 1}` : '(blanco)';
      preview.push(
        `Cuad. ${sigNum}, Pliego ${s + 1}/${sigSheets}`,
        `  ├ frente: ${label(p1)} (0°) · ${label(p2)} (180°)`,
        `  └ dorso:  ${label(p3)} (180°) · ${label(p0)} (0°)`,
      );
    }
  }
  return preview;
}

import type { ImpositionLayout, PerfectBoundConfig, SheetConfig } from '@/types/imposition';
import type { NUpCell, ImpositionSheet } from '@/types/imposition';
import { buildSignatureOrder } from './booklet';

export function calculatePerfectBoundLayout(
  pageCount: number,
  pageWidth: number,
  pageHeight: number,
  config: PerfectBoundConfig,
  sheet: SheetConfig,
): ImpositionLayout {
  const { signatureSize } = config;
  const { width: sheetW, height: sheetH, margins, centerContent } = sheet;

  const cellW = pageWidth;
  const cellH = pageHeight;

  const gridW = cellW * 2;
  const offsetX = centerContent
    ? margins + (sheetW - margins * 2 - gridW) / 2
    : margins;
  const offsetY = centerContent
    ? margins + (sheetH - margins * 2 - cellH) / 2
    : margins;

  const sigSize = signatureSize > 0 && signatureSize < pageCount
    ? signatureSize
    : pageCount;

  const sheets: ImpositionSheet[] = [];
  let sheetIdx = 0;

  for (let sigStart = 0; sigStart < pageCount; sigStart += sigSize) {
    const sigEnd = Math.min(sigStart + sigSize, pageCount);
    const sigReal = sigEnd - sigStart;
    const sigPadded = Math.ceil(sigReal / 4) * 4;
    const sigSheets = sigPadded / 4;

    const order = buildSignatureOrder(sigPadded, sigStart, pageCount);

    for (let s = 0; s < sigSheets; s++) {
      const pageRight = order[s * 4 + 0];
      const pageLeftFront = order[s * 4 + 1];
      const pageRightFront = order[s * 4 + 2];
      const pageLeftBack = order[s * 4 + 3];

      const frontCells: NUpCell[] = [
        {
          pageIndex: pageLeftFront,
          x: offsetX,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 0,
        },
        {
          pageIndex: pageRightFront,
          x: offsetX + cellW,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 180,
        },
      ];

      const backCells: NUpCell[] = [
        {
          pageIndex: pageLeftBack,
          x: offsetX,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 180,
        },
        {
          pageIndex: pageRight,
          x: offsetX + cellW,
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

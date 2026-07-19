import type { ImpositionLayout, PerfectBoundConfig, SheetConfig } from '@/types/imposition';
import type { NUpCell, ImpositionSheet } from '@/types/imposition';
import { buildSignatureOrder } from './booklet';
import { getGripperMargins } from './nup';

export function calculatePerfectBoundLayout(
  pageCount: number,
  pageWidth: number,
  pageHeight: number,
  config: PerfectBoundConfig,
  sheet: SheetConfig,
): ImpositionLayout {
  const { signatureSize } = config;
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

  const sheets: ImpositionSheet[] = [];
  let sheetIdx = 0;

  for (let sigStart = 0; sigStart < pageCount; sigStart += sigSize) {
    const sigEnd = Math.min(sigStart + sigSize, pageCount);
    const sigPadded = Math.ceil((sigEnd - sigStart) / 4) * 4;
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
          x: spineCenter - cellW,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 0,
        },
        {
          pageIndex: pageRightFront,
          x: spineCenter,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 180,
        },
      ];

      const backCells: NUpCell[] = [
        {
          pageIndex: pageLeftBack,
          x: spineCenter - cellW,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 180,
        },
        {
          pageIndex: pageRight,
          x: spineCenter,
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

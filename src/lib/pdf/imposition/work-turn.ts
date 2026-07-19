import type { ImpositionLayout, NUpConfig, SheetConfig } from '@/types/imposition';
import type { NUpCell, ImpositionSheet } from '@/types/imposition';
import { getGridDimensions, getGripperMargins } from './nup';

export type WorkMode = 'work-turn' | 'work-tumble';

export function calculateWorkTurnLayout(
  pageCount: number,
  pageWidth: number,
  pageHeight: number,
  nup: NUpConfig,
  sheet: SheetConfig,
  mode: WorkMode,
): ImpositionLayout {
  const { pagesPerSheet, orientation } = nup;
  const { width: sheetW, height: sheetH, gutter, centerContent } = sheet;
  const gm = getGripperMargins(sheet);

  const cellW = pageWidth;
  const cellH = pageHeight;

  const { rows, cols } = getGridDimensions(pagesPerSheet, orientation);

  const gridW = cols * cellW + gutter * (cols - 1);
  const gridH = rows * cellH + gutter * (rows - 1);

  const offsetX = centerContent ? gm.left + (sheetW - gm.left - gm.right - gridW) / 2 : gm.left;
  const offsetY = centerContent ? gm.top + (sheetH - gm.top - gm.bottom - gridH) / 2 : gm.top;

  const cellsPerSheet = rows * cols;
  const frontSheets = Math.ceil(pageCount / cellsPerSheet);

  const sheets: ImpositionSheet[] = [];
  let sheetIdx = 0;

  for (let s = 0; s < frontSheets; s++) {
    const frontCells: NUpCell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pageIndex = s * cellsPerSheet + r * cols + c;
        if (pageIndex >= pageCount) break;
        const x = offsetX + c * (cellW + gutter);
        const y = offsetY + r * (cellH + gutter);
        frontCells.push({ pageIndex, x, y, width: cellW, height: cellH, rotation: 0 });
      }
    }
    sheets.push({ cells: frontCells, sheetIndex: sheetIdx++ });

    const backCells: NUpCell[] = [];
    if (mode === 'work-turn') {
      for (let r = 0; r < rows; r++) {
        for (let c = cols - 1; c >= 0; c--) {
          const pageIndex = s * cellsPerSheet + r * cols + (cols - 1 - c);
          if (pageIndex >= pageCount) continue;
          const x = offsetX + c * (cellW + gutter);
          const y = offsetY + r * (cellH + gutter);
          backCells.push({ pageIndex, x, y, width: cellW, height: cellH, rotation: 180 });
        }
      }
    } else {
      for (let r = rows - 1; r >= 0; r--) {
        for (let c = 0; c < cols; c++) {
          const pageIndex = s * cellsPerSheet + r * cols + c;
          if (pageIndex >= pageCount) continue;
          const x = offsetX + c * (cellW + gutter);
          const y = offsetY + r * (cellH + gutter);
          backCells.push({ pageIndex, x, y, width: cellW, height: cellH, rotation: 180 });
        }
      }
    }
    sheets.push({ cells: backCells, sheetIndex: sheetIdx++ });
  }

  return { sheets, totalSheets: sheets.length, sheetWidth: sheetW, sheetHeight: sheetH };
}

import type { ImpositionLayout, NUpConfig, SheetConfig, NUpCell, ImpositionSheet } from '@/types/imposition';
import { getGridDimensions, getGripperMargins } from './nup';

export function calculateCutStackLayout(
  pageCount: number,
  pageWidth: number,
  pageHeight: number,
  copies: number,
  nup: NUpConfig,
  sheet: SheetConfig,
): ImpositionLayout {
  const { orientation } = nup;
  const { width: sheetW, height: sheetH, gutter, centerContent } = sheet;
  const gm = getGripperMargins(sheet);

  const cellW = pageWidth;
  const cellH = pageHeight;
  const { rows, cols } = getGridDimensions(copies, orientation);

  const gridW = cols * cellW + gutter * (cols - 1);
  const gridH = rows * cellH + gutter * (rows - 1);
  const offsetX = centerContent ? gm.left + (sheetW - gm.left - gm.right - gridW) / 2 : gm.left;
  const offsetY = centerContent ? gm.top + (sheetH - gm.top - gm.bottom - gridH) / 2 : gm.top;

  const sheets: ImpositionSheet[] = [];
  for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
    const cells: NUpCell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (cells.length >= copies) break;
        cells.push({ pageIndex: pageIdx, x: offsetX + c * (cellW + gutter), y: offsetY + r * (cellH + gutter), width: cellW, height: cellH, rotation: 0 });
      }
    }
    sheets.push({ cells, sheetIndex: pageIdx });
  }
  return { sheets, totalSheets: sheets.length, sheetWidth: sheetW, sheetHeight: sheetH };
}

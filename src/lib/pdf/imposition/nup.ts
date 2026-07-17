import type { ImpositionLayout, NUpConfig, SheetConfig } from '@/types/imposition';
import type { NUpCell, ImpositionSheet } from '@/types/imposition';

export function calculateNUpLayout(
  pageCount: number,
  pageWidth: number,
  pageHeight: number,
  nup: NUpConfig,
  sheet: SheetConfig,
): ImpositionLayout {
  const { pagesPerSheet, orientation } = nup;
  const { width: sheetW, height: sheetH, gutter, margins, centerContent } = sheet;

  const cellW = pageWidth;
  const cellH = pageHeight;

  const { rows, cols } = getGridDimensions(pagesPerSheet, orientation);

  const gridW = cols * cellW + gutter * (cols - 1);
  const gridH = rows * cellH + gutter * (rows - 1);

  const offsetX = centerContent ? margins + (sheetW - margins * 2 - gridW) / 2 : margins;
  const offsetY = centerContent ? margins + (sheetH - margins * 2 - gridH) / 2 : margins;

  const sheets: ImpositionSheet[] = [];
  let pageIndex = 0;
  let sheetIndex = 0;

  while (pageIndex < pageCount) {
    const cells: NUpCell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (pageIndex >= pageCount) break;
        const x = offsetX + c * (cellW + gutter);
        const y = offsetY + r * (cellH + gutter);
        cells.push({ pageIndex, x, y, width: cellW, height: cellH, rotation: 0 });
        pageIndex++;
      }
    }
    sheets.push({ cells, sheetIndex });
    sheetIndex++;
  }

  return { sheets, totalSheets: sheets.length, sheetWidth: sheetW, sheetHeight: sheetH };
}

export function getGridDimensions(
  pagesPerSheet: number,
  orientation: 'portrait' | 'landscape',
): { rows: number; cols: number } {
  const grid: Record<number, [number, number]> = {
    2: [1, 2], 4: [2, 2], 6: [2, 3], 8: [2, 4], 9: [3, 3], 16: [4, 4], 32: [4, 8],
  };
  const [rows, cols] = grid[pagesPerSheet] ?? [2, 2];
  if (orientation === 'landscape') return { rows: cols, cols: rows };
  return { rows, cols };
}

export const NUP_OPTIONS = [2, 4, 6, 8, 9, 16, 32] as const;

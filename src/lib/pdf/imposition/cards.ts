import type { ImpositionLayout, CardsConfig, SheetConfig, NUpCell, ImpositionSheet } from '@/types/imposition';
import { getGripperMargins } from './nup';

export function calculateCardsLayout(
  pageCount: number,
  cardsConfig: CardsConfig,
  sheet: SheetConfig,
  sourcePage: number = 0,
): ImpositionLayout {
  const { cardWidth, cardHeight, cols, rows, gutter } = cardsConfig;
  const { width: sheetW, height: sheetH, centerContent } = sheet;
  const gm = getGripperMargins(sheet);

  const gridW = cols * cardWidth + gutter * (cols - 1);
  const gridH = rows * cardHeight + gutter * (rows - 1);
  const offsetX = centerContent ? gm.left + (sheetW - gm.left - gm.right - gridW) / 2 : gm.left;
  const offsetY = centerContent ? gm.top + (sheetH - gm.top - gm.bottom - gridH) / 2 : gm.top;

  const safeSource = Math.min(sourcePage, pageCount - 1);

  const cells: NUpCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        pageIndex: safeSource,
        x: offsetX + c * (cardWidth + gutter),
        y: offsetY + r * (cardHeight + gutter),
        width: cardWidth,
        height: cardHeight,
        rotation: 0,
      });
    }
  }

  const sheets: ImpositionSheet[] = [{ cells, sheetIndex: 0 }];

  return { sheets, totalSheets: 1, sheetWidth: sheetW, sheetHeight: sheetH };
}

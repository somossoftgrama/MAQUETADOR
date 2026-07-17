import type { ImpositionLayout, CardsConfig, SheetConfig, NUpCell, ImpositionSheet } from '@/types/imposition';

export function calculateCardsLayout(
  pageCount: number,
  cardsConfig: CardsConfig,
  sheet: SheetConfig,
  sourcePage: number = 0,
): ImpositionLayout {
  const { cardWidth, cardHeight, cols, rows, gutter } = cardsConfig;
  const { width: sheetW, height: sheetH, margins, centerContent } = sheet;

  const gridW = cols * cardWidth + gutter * (cols - 1);
  const gridH = rows * cardHeight + gutter * (rows - 1);
  const offsetX = centerContent ? margins + (sheetW - margins * 2 - gridW) / 2 : margins;
  const offsetY = centerContent ? margins + (sheetH - margins * 2 - gridH) / 2 : margins;

  const sheets: ImpositionSheet[] = [];
  let pageIdx = sourcePage;
  let sheetIdx = 0;

  while (pageIdx < pageCount) {
    const cells: NUpCell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ pageIndex: pageIdx, x: offsetX + c * (cardWidth + gutter), y: offsetY + r * (cardHeight + gutter), width: cardWidth, height: cardHeight, rotation: 0 });
      }
    }
    sheets.push({ cells, sheetIndex: sheetIdx });
    sheetIdx++;
    pageIdx++;
  }

  return { sheets, totalSheets: sheets.length, sheetWidth: sheetW, sheetHeight: sheetH };
}

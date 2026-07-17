import type { ProductionMarks, MarksOverlay, NUpCell } from '@/types/imposition';

export function calculateMarks(
  sheetW: number,
  sheetH: number,
  bleed: number,
  margins: number,
  config: ProductionMarks,
  cells: NUpCell[],
): MarksOverlay {
  const markLength = config.cropMarkLength;
  const markOffset = config.cropMarkOffset;

  const overlay: MarksOverlay = {
    cropLineThickness: config.cropMarkThickness,
    cropLines: [],
    registrationCenters: [],
    bleedBoxes: [],
    colorBarPatches: [],
  };

  if (config.cropMarks) {
    for (const cell of cells) {
      if (cell.pageIndex < 0) continue;

      const tx = cell.x;
      const ty = cell.y;
      const tw = cell.width;
      const th = cell.height;

      const corners = [
        { cx: tx, cy: ty, dx1: -1, dy1: -1 },
        { cx: tx + tw, cy: ty, dx1: 1, dy1: -1 },
        { cx: tx + tw, cy: ty + th, dx1: 1, dy1: 1 },
        { cx: tx, cy: ty + th, dx1: -1, dy1: 1 },
      ];

      for (const { cx, cy, dx1, dy1 } of corners) {
        overlay.cropLines.push({
          x1: cx + dx1 * markOffset,
          y1: cy + dy1 * (markOffset + markLength),
          x2: cx + dx1 * markOffset,
          y2: cy + dy1 * markOffset,
        });
        overlay.cropLines.push({
          x1: cx + dx1 * (markOffset + markLength),
          y1: cy + dy1 * markOffset,
          x2: cx + dx1 * markOffset,
          y2: cy + dy1 * markOffset,
        });
      }
    }
  }

  if (config.registrationMarks) {
    overlay.registrationCenters.push(
      { cx: margins + 40, cy: margins + 40 },
      { cx: sheetW - margins - 40, cy: margins + 40 },
      { cx: margins + 40, cy: sheetH - margins - 40 },
      { cx: sheetW - margins - 40, cy: sheetH - margins - 40 },
      { cx: sheetW / 2, cy: margins + 20 },
      { cx: sheetW / 2, cy: sheetH - margins - 20 },
    );
  }

  if (config.bleed > 0) {
    for (const cell of cells) {
      if (cell.pageIndex < 0) continue;
      overlay.bleedBoxes.push({
        x: cell.x - bleed,
        y: cell.y - bleed,
        w: cell.width + bleed * 2,
        h: cell.height + bleed * 2,
      });
    }
  }

  if (config.colorBar) {
    const barX = margins + 10;
    const barY = sheetH - margins + 12;
    const barH = 10;
    const barW = 18;

    const patches = config.colorBarType === 'grayscale'
      ? [
          { c: '#000000', pct: 100 }, { c: '#808080', pct: 50 },
          { c: '#404040', pct: 25 }, { c: '#a0a0a0', pct: 10 },
        ]
      : [
          { c: '#00FFFF', pct: 'C' }, { c: '#FF00FF', pct: 'M' },
          { c: '#FFFF00', pct: 'Y' }, { c: '#000000', pct: 'K' },
          { c: '#FF0000', pct: 'M+Y' }, { c: '#00FF00', pct: 'C+Y' },
          { c: '#0000FF', pct: 'C+M' }, { c: '#888888', pct: 'C+M+Y' },
        ];

    for (let i = 0; i < patches.length; i++) {
      overlay.colorBarPatches.push({
        x: barX + i * (barW + 2),
        y: barY,
        w: barW,
        h: barH,
        color: patches[i].c,
      });
    }
  }

  return overlay;
}

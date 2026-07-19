import type { ProductionMarks, MarksOverlay, CmykColor, NUpCell, ImpositionType } from '@/types/imposition';

interface ColorBarPatch {
  c: string;
  pct: string | number;
  cmyk: CmykColor;
}

const CMYK_PATCHES: ColorBarPatch[] = [
  { c: '#00FFFF', pct: 'C', cmyk: { c: 1, m: 0, y: 0, k: 0 } },
  { c: '#FF00FF', pct: 'M', cmyk: { c: 0, m: 1, y: 0, k: 0 } },
  { c: '#FFFF00', pct: 'Y', cmyk: { c: 0, m: 0, y: 1, k: 0 } },
  { c: '#333333', pct: 'K', cmyk: { c: 0, m: 0, y: 0, k: 1 } },
  { c: '#FF4400', pct: 'M+Y', cmyk: { c: 0, m: 1, y: 1, k: 0 } },
  { c: '#00AA00', pct: 'C+Y', cmyk: { c: 1, m: 0, y: 1, k: 0 } },
  { c: '#0000CC', pct: 'C+M', cmyk: { c: 1, m: 1, y: 0, k: 0 } },
  { c: '#665544', pct: 'C+M+Y', cmyk: { c: 0.4, m: 0.4, y: 0.4, k: 0.1 } },
];

const GRAYSCALE_PATCHES: { c: string; pct: number; cmyk: CmykColor }[] = [
  { c: '#000000', pct: 100, cmyk: { c: 0, m: 0, y: 0, k: 1 } },
  { c: '#808080', pct: 50, cmyk: { c: 0, m: 0, y: 0, k: 0.5 } },
  { c: '#404040', pct: 25, cmyk: { c: 0, m: 0, y: 0, k: 0.25 } },
  { c: '#a0a0a0', pct: 10, cmyk: { c: 0, m: 0, y: 0, k: 0.1 } },
];

export function calculateMarks(
  sheetW: number,
  sheetH: number,
  bleed: number,
  margins: number,
  config: ProductionMarks,
  cells: NUpCell[],
  sheetIndex?: number,
  totalSheets?: number,
  impositionType?: ImpositionType,
  signatureIndex?: number,
  totalSignatures?: number,
  slugMeta?: { fileName?: string; grainDirection?: string; pageCount?: number; pdfxProfile?: string },
): MarksOverlay {
  const markLength = config.cropMarkLength;
  const markOffset = config.cropMarkOffset;
  const isBooklet = impositionType === 'booklet' || impositionType === 'perfect-bound';

  const overlay: MarksOverlay = {
    cropLineThickness: config.cropMarkThickness,
    cropLines: [],
    registrationCenters: [],
    bleedBoxes: [],
    colorBarPatches: [],
    foldLines: [],
    bindingMarks: [],
    collatingMarks: [],
    signatureLabels: [],
  };

  if (config.cropMarks) {
    if (config.collatingMarks && impositionType === 'perfect-bound' && signatureIndex !== undefined && totalSignatures !== undefined && totalSignatures > 1) {
    drawCollatingMarks(overlay, cells, signatureIndex, totalSignatures, margins, sheetH);
  }

  if (isBooklet) {
      drawBookletCropMarks(overlay, cells, markOffset, markLength);
    } else {
      drawStandardCropMarks(overlay, cells, markOffset, markLength);
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

    const patches = config.colorBarType === 'grayscale' ? GRAYSCALE_PATCHES : CMYK_PATCHES;

    for (let i = 0; i < patches.length; i++) {
      overlay.colorBarPatches.push({
        x: barX + i * (barW + 2),
        y: barY,
        w: barW,
        h: barH,
        color: patches[i].c,
        cmyk: patches[i].cmyk,
      });
    }
  }

  if (isBooklet) {
    drawBookletFoldLine(overlay, cells, sheetH, margins);
  } else if (config.foldMarks && cells.length >= 2) {
    drawFoldMarksBetweenCells(overlay, cells, sheetW, sheetH, margins);
  }

  if (config.bindingStyle !== 'none') {
    const spineX = margins + 15;
    const spacing = config.bindingStyle === 'wire-o' ? 30 : 28;
    let cy = margins + 30;
    while (cy < sheetH - margins) {
      overlay.bindingMarks.push({ cx: spineX, cy, radius: config.bindingStyle === 'wire-o' ? 4 : 3 });
      cy += spacing;
    }
  }

  if (config.signatureNumbering && sheetIndex !== undefined && totalSheets !== undefined) {
    const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fileName = slugMeta?.fileName || '';
    const grainDir = slugMeta?.grainDirection === 'long' ? 'FL' : slugMeta?.grainDirection === 'short' ? 'FC' : '';
    const pagesLabel = slugMeta?.pageCount ? `${slugMeta.pageCount} págs` : '';

    const line1 = `${fileName ? fileName + ' — ' : ''}${today} — Pliego ${sheetIndex + 1}/${totalSheets}`;
    const line2 = [
      impositionType ? impositionType : '',
      pagesLabel,
      grainDir ? `Fibra: ${grainDir}` : '',
    ].filter(Boolean).join(' — ');
    const line3 = config.pdfxOutput && slugMeta?.pdfxProfile ? `PDF/X-4 — ${slugMeta.pdfxProfile}` : '';

    const labelY = margins - 8;
    overlay.signatureLabels.push({ x: sheetW / 2, y: labelY, text: line1 });
    if (line2) overlay.signatureLabels.push({ x: sheetW / 2, y: labelY - 10, text: line2 });
    if (line3) overlay.signatureLabels.push({ x: sheetW / 2, y: labelY - 20, text: line3 });
  }

  return overlay;
}

function drawStandardCropMarks(
  overlay: MarksOverlay,
  cells: NUpCell[],
  markOffset: number,
  markLength: number,
) {
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

function drawBookletCropMarks(
  overlay: MarksOverlay,
  cells: NUpCell[],
  markOffset: number,
  markLength: number,
) {
  const validCells = cells.filter(c => c.pageIndex >= 0);
  if (validCells.length === 0) return;

  const spineX = validCells.length >= 2
    ? (validCells[0].x + validCells[0].width + validCells[1].x) / 2
    : validCells[0].x + validCells[0].width / 2;

  for (const cell of validCells) {
    const tx = cell.x;
    const ty = cell.y;
    const tw = cell.width;
    const th = cell.height;

    const cellCenterX = tx + tw / 2;
    const isLeftPage = cellCenterX < spineX;
    const outerDx = isLeftPage ? -1 : 1;

    const outerCorners = [
      { cx: tx + (isLeftPage ? 0 : tw), cy: ty, dx: outerDx, dy: -1 },
      { cx: tx + (isLeftPage ? 0 : tw), cy: ty + th, dx: outerDx, dy: 1 },
    ];

    for (const { cx, cy, dx, dy } of outerCorners) {
      overlay.cropLines.push({
        x1: cx + dx * markOffset,
        y1: cy + dy * (markOffset + markLength),
        x2: cx + dx * markOffset,
        y2: cy + dy * markOffset,
      });
      overlay.cropLines.push({
        x1: cx + dx * (markOffset + markLength),
        y1: cy + dy * markOffset,
        x2: cx + dx * markOffset,
        y2: cy + dy * markOffset,
      });
    }
  }

  const leftEdge = Math.min(...validCells.map(c => c.x));
  const rightEdge = Math.max(...validCells.map(c => c.x + c.width));
  const topY = validCells[0].y;
  const bottomY = validCells[0].y + validCells[0].height;

  overlay.cropLines.push({
    x1: leftEdge,
    y1: topY - markOffset,
    x2: rightEdge,
    y2: topY - markOffset,
  });
  overlay.cropLines.push({
    x1: leftEdge,
    y1: bottomY + markOffset,
    x2: rightEdge,
    y2: bottomY + markOffset,
  });
}

function drawCollatingMarks(
  overlay: MarksOverlay,
  cells: NUpCell[],
  signatureIndex: number,
  totalSignatures: number,
  margins: number,
  sheetH: number,
) {
  const validCells = cells.filter(c => c.pageIndex >= 0);
  if (validCells.length < 2) return;

  const spineX = (validCells[0].x + validCells[0].width + validCells[1].x) / 2;
  const markW = 3;
  const markH = 3;
  const usableH = sheetH - 2 * margins;
  const stepY = usableH / (totalSignatures + 1);
  const markY = margins + stepY * (signatureIndex + 1);

  overlay.collatingMarks.push({
    x: spineX - 2,
    y: markY,
    w: markW,
    h: markH,
  });
}

function drawBookletFoldLine(
  overlay: MarksOverlay,
  cells: NUpCell[],
  sheetH: number,
  margins: number,
) {
  const validCells = cells.filter(c => c.pageIndex >= 0);
  if (validCells.length < 2) return;

  const spineX = (validCells[0].x + validCells[0].width + validCells[1].x) / 2;

  overlay.foldLines.push({
    x1: spineX,
    y1: margins,
    x2: spineX,
    y2: sheetH - margins,
    dashed: true,
  });
}

function drawFoldMarksBetweenCells(
  overlay: MarksOverlay,
  cells: NUpCell[],
  sheetW: number,
  sheetH: number,
  margins: number,
) {
  const actualCells = cells.filter(c => c.pageIndex >= 0);
  for (let i = 0; i < actualCells.length; i++) {
    for (let j = i + 1; j < actualCells.length; j++) {
      const a = actualCells[i];
      const b = actualCells[j];

      const xGap = b.x - (a.x + a.width);
      const yGap = b.y - (a.y + a.height);

      if (Math.abs(xGap) < 5 && a.y === b.y) {
        const foldX = a.x + a.width + xGap / 2;
        overlay.foldLines.push({
          x1: foldX,
          y1: margins,
          x2: foldX,
          y2: sheetH - margins,
          dashed: true,
        });
      }

      if (Math.abs(yGap) < 5 && a.x === b.x) {
        const foldY = a.y + a.height + yGap / 2;
        overlay.foldLines.push({
          x1: margins,
          y1: foldY,
          x2: sheetW - margins,
          y2: foldY,
          dashed: true,
        });
      }
    }
  }
}

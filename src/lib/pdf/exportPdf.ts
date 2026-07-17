import { PDFDocument, rgb } from 'pdf-lib';
import type { ProductionMarks, ImpositionLayout, ImpositionSheet } from '@/types/imposition';
import { calculateMarks } from './marks';

export async function exportPdf(
  originalPdfBytes: ArrayBuffer,
  layout: ImpositionLayout,
  sheetW: number,
  sheetH: number,
  marksConfig: ProductionMarks,
  margins: number,
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: false });
  const outDoc = await PDFDocument.create();

  for (const sheet of layout.sheets) {
    const page = outDoc.addPage([sheetW, sheetH]);
    const sheetHPoints = sheetH;

    for (const cell of sheet.cells) {
      if (cell.pageIndex < 0 || cell.pageIndex >= srcDoc.getPageCount()) continue;

      const srcPage = srcDoc.getPage(cell.pageIndex);
      const embeddedPage = await outDoc.embedPage(srcPage);

      const srcSize = srcPage.getSize();
      const scaleX = cell.width / srcSize.width;
      const scaleY = cell.height / srcSize.height;
      const scale = Math.min(scaleX, scaleY);

      const drawW = srcSize.width * scale;
      const drawH = srcSize.height * scale;
      const offsetX = cell.x + (cell.width - drawW) / 2;
      const offsetY = sheetHPoints - cell.y - cell.height + (cell.height - drawH) / 2;

      page.drawPage(embeddedPage, {
        x: offsetX,
        y: offsetY,
        width: drawW,
        height: drawH,
      });
    }

    drawProductionMarks(page, sheet, sheetW, sheetHPoints, marksConfig, margins);
  }

  return outDoc.save();
}

function drawProductionMarks(
  page: any,
  sheet: ImpositionSheet,
  sheetW: number,
  sheetH: number,
  marksConfig: ProductionMarks,
  margins: number,
) {
  const overlay = calculateMarks(sheetW, sheetH, marksConfig.bleed, margins, marksConfig, sheet.cells);

  for (const line of overlay.cropLines) {
    page.drawLine({
      start: { x: line.x1, y: sheetH - line.y1 },
      end: { x: line.x2, y: sheetH - line.y2 },
      thickness: overlay.cropLineThickness,
      color: rgb(0, 0, 0),
    });
  }

  for (const reg of overlay.registrationCenters) {
    const cx = reg.cx;
    const cy = sheetH - reg.cy;
    const size = 8;
    page.drawLine({ start: { x: cx - size, y: cy }, end: { x: cx + size, y: cy }, thickness: 0.25, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: cx, y: cy - size }, end: { x: cx, y: cy + size }, thickness: 0.25, color: rgb(0, 0, 0) });
  }

  for (const bb of overlay.bleedBoxes) {
    page.drawRectangle({
      x: bb.x,
      y: sheetH - bb.y - bb.h,
      width: bb.w,
      height: bb.h,
      borderColor: rgb(1, 0, 0),
      borderWidth: 0.25,
    });
  }

  for (const patch of overlay.colorBarPatches) {
    page.drawRectangle({
      x: patch.x,
      y: sheetH - patch.y - patch.h,
      width: patch.w,
      height: patch.h,
      color: rgb(
        parseInt(patch.color.slice(1, 3), 16) / 255,
        parseInt(patch.color.slice(3, 5), 16) / 255,
        parseInt(patch.color.slice(5, 7), 16) / 255,
      ),
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.25,
    });
  }
}

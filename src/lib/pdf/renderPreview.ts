import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

let currentDoc: pdfjsLib.PDFDocumentProxy | null = null;

export async function loadPdfJs(byteArray: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  if (currentDoc) {
    await currentDoc.destroy();
    currentDoc = null;
  }

  currentDoc = await pdfjsLib.getDocument({ data: byteArray.slice(0) }).promise;
  return currentDoc;
}

export function getPdfJsDoc(): pdfjsLib.PDFDocumentProxy | null {
  return currentDoc;
}

export async function renderPageToCanvas(
  pageIndex: number,
  targetWidth: number,
  targetHeight: number,
): Promise<HTMLCanvasElement | null> {
  if (!currentDoc) return null;

  try {
    const page = await currentDoc.getPage(pageIndex + 1);

    const viewport = page.getViewport({ scale: 1 });
    const scaleX = targetWidth / viewport.width;
    const scaleY = targetHeight / viewport.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const offsetX = (targetWidth - scaledViewport.width) / 2;
    const offsetY = (targetHeight - scaledViewport.height) / 2;

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
      transform: [1, 0, 0, 1, offsetX, offsetY],
    }).promise;

    return canvas;
  } catch {
    return null;
  }
}

export function disposePdfJs(): void {
  if (currentDoc) {
    currentDoc.destroy();
    currentDoc = null;
  }
}

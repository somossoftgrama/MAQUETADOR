import type { ImpositionLayout, BookletConfig, SheetConfig } from '@/types/imposition';
import type { NUpCell, ImpositionSheet } from '@/types/imposition';

function calcularCreep(pagesInSignature: number): number {
  if (pagesInSignature <= 8) return 0;
  return (pagesInSignature - 8) * 0.3;
}

export function calcularCreepAutomatico(pageCount: number): number {
  if (pageCount <= 8) return 0;
  return (pageCount - 8) * 0.3;
}

export function calculateBookletLayout(
  pageCount: number,
  pageWidth: number,
  pageHeight: number,
  booklet: BookletConfig,
  sheet: SheetConfig,
  options?: { autoCreep?: boolean },
): ImpositionLayout {
  const { signatureSize, autoCreep, manualCreep, spineGutter } = booklet;
  const { width: sheetW, height: sheetH, margins, centerContent } = sheet;

  const cellW = pageWidth;
  const cellH = pageHeight;

  // Dos páginas lado a lado + gutter de lomo en el centro
  const gridW = cellW * 2 + spineGutter;
  const offsetX = centerContent
    ? margins + (sheetW - margins * 2 - gridW) / 2
    : margins;
  const offsetY = centerContent
    ? margins + (sheetH - margins * 2 - cellH) / 2
    : margins;

  const sigSize = signatureSize > 0 && signatureSize < pageCount
    ? signatureSize
    : pageCount;

  const sheets: ImpositionSheet[] = [];
  let sheetIdx = 0;

  for (let sigStart = 0; sigStart < pageCount; sigStart += sigSize) {
    const sigEnd = Math.min(sigStart + sigSize, pageCount);
    const sigReal = sigEnd - sigStart;
    const sigPadded = Math.ceil(sigReal / 4) * 4;
    const sigSheets = sigPadded / 4;

    const order = buildSignatureOrder(sigPadded, sigStart, pageCount);

    const creep = autoCreep ? calcularCreep(sigReal) : manualCreep;

    for (let s = 0; s < sigSheets; s++) {
      const pageRight = order[s * 4 + 0];
      const pageLeftFront = order[s * 4 + 1];
      const pageRightFront = order[s * 4 + 2];
      const pageLeftBack = order[s * 4 + 3];

      const co = creep * s;

      // Frente: páginas lado a lado. Las del lomo (índice 0 y 1) van rotadas 180° en su eje Y como corresponde en saddle-stitch
      // En saddle-stitch real: en el frente, la página izquierda va cabeza-arriba y la derecha cabeza-abajo (rot 180).
      // En el dorso, al revés.
      // Para simplicidad visual, usamos rotación de 180° sobre Y para las páginas que van "cabeza abajo".
      
      // Simplificamos: en saddle-stitch, las páginas de la derecha en el frente y las de la izquierda en el dorso
      // se rotan 180° porque al doblar el pliego quedan al derecho.

      const frontCells: NUpCell[] = [
        {
          pageIndex: pageLeftFront,
          x: offsetX + co,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 0, // izquierda frente: normal
        },
        {
          pageIndex: pageRightFront,
          x: offsetX + cellW + spineGutter - co,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 180, // derecha frente: rotada 180°
        },
      ];

      const backCells: NUpCell[] = [
        {
          pageIndex: pageLeftBack,
          x: offsetX - co,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 180, // izquierda dorso: rotada 180°
        },
        {
          pageIndex: pageRight,
          x: offsetX + cellW + spineGutter + co,
          y: offsetY,
          width: cellW,
          height: cellH,
          rotation: 0, // derecha dorso: normal
        },
      ];

      sheets.push({ cells: frontCells, sheetIndex: sheetIdx++ });
      sheets.push({ cells: backCells, sheetIndex: sheetIdx++ });
    }
  }

  return { sheets, totalSheets: sheets.length, sheetWidth: sheetW, sheetHeight: sheetH };
}

export function buildSignatureOrder(
  paddedSize: number,
  baseIndex: number,
  totalPageCount: number,
): number[] {
  const order: number[] = [];
  let left = 0;
  let right = paddedSize - 1;

  while (left < right) {
    order.push(baseIndex + right);      // última
    order.push(baseIndex + left);       // primera
    order.push(baseIndex + left + 1);   // segunda
    order.push(baseIndex + right - 1);  // penúltima
    left += 2;
    right -= 2;
  }

  return order.map((pi) => (pi < totalPageCount ? pi : -1));
}

export function getBookletPagePreview(pageCount: number, signatureSize: number = 0): string[] {
  const sigSize = signatureSize > 0 && signatureSize < pageCount ? signatureSize : pageCount;
  const preview: string[] = [];
  for (let sigStart = 0; sigStart < pageCount; sigStart += sigSize) {
    const sigEnd = Math.min(sigStart + sigSize, pageCount);
    const sigReal = sigEnd - sigStart;
    const sigPadded = Math.ceil(sigReal / 4) * 4;
    const sigSheets = sigPadded / 4;
    const order = buildSignatureOrder(sigPadded, sigStart, pageCount);
    for (let s = 0; s < sigSheets; s++) {
      const sigNum = Math.floor(sigStart / sigSize) + 1;
      const p0 = order[s * 4 + 0], p1 = order[s * 4 + 1], p2 = order[s * 4 + 2], p3 = order[s * 4 + 3];
      const label = (i: number) => i >= 0 ? `pág. ${i + 1}` : '(blanco)';
      preview.push(
        `Cuad. ${sigNum}, Pliego ${s + 1}/${sigSheets}`,
        `  ├ frente: ${label(p1)} (0°) · ${label(p2)} (180°)`,
        `  └ dorso:  ${label(p3)} (180°) · ${label(p0)} (0°)`,
      );
    }
  }
  return preview;
}

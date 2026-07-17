import { useEffect, useRef, useCallback } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { previewEngine } from '@/lib/pdf/previewEngine';
import { calculateNUpLayout } from '@/lib/pdf/imposition/nup';
import { calculateBookletLayout } from '@/lib/pdf/imposition/booklet';
import { calculateCardsLayout } from '@/lib/pdf/imposition/cards';
import { calculateCutStackLayout } from '@/lib/pdf/imposition/cutstack';
import { calculateMarks } from '@/lib/pdf/marks';
import type { ImpositionLayout, ImpositionType } from '@/types/imposition';

function getLayout(
  type: ImpositionType,
  pageCount: number,
  pageW: number,
  pageH: number,
  store: ReturnType<typeof useDocumentStore.getState>,
): ImpositionLayout {
  switch (type) {
    case 'nup':
      return calculateNUpLayout(pageCount, pageW, pageH, store.nup, store.sheet);
    case 'booklet':
      return calculateBookletLayout(pageCount, pageW, pageH, store.booklet, store.sheet);
    case 'cards':
      return calculateCardsLayout(pageCount, store.cards, store.sheet, store.cards.sourcePage);
    case 'cutstack':
      return calculateCutStackLayout(pageCount, pageW, pageH, store.nup.pagesPerSheet, store.nup, store.sheet);
    case 'perfect-bound':
      return calculateBookletLayout(pageCount, pageW, pageH, {
        signatureSize: store.perfectBound.signatureSize,
        autoCreep: false,
        manualCreep: 0,
        spineGutter: 0,
      }, store.sheet, { autoCreep: false });
    default:
      return { sheets: [], totalSheets: 0, sheetWidth: pageW, sheetHeight: pageH };
  }
}

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pageCount = useDocumentStore((s) => s.pageCount);
  const originalPdfBytes = useDocumentStore((s) => s.originalPdfBytes);
  const originalPageW = useDocumentStore((s) => s.originalPageWidth);
  const originalPageH = useDocumentStore((s) => s.originalPageHeight);
  const impositionType = useDocumentStore((s) => s.impositionType);
  const nup = useDocumentStore((s) => s.nup);
  const booklet = useDocumentStore((s) => s.booklet);
  const perfectBound = useDocumentStore((s) => s.perfectBound);
  const cards = useDocumentStore((s) => s.cards);
  const sheet = useDocumentStore((s) => s.sheet);
  const marks = useDocumentStore((s) => s.marks);
  const previewScale = useDocumentStore((s) => s.previewScale);
  const currentSheetIndex = useDocumentStore((s) => s.currentSheetIndex);
  const setCurrentSheetIndex = useDocumentStore((s) => s.setCurrentSheetIndex);
  const setPreviewScale = useDocumentStore((s) => s.setPreviewScale);

  const renderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doRender = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalPdfBytes || pageCount === 0) return;

    const store = useDocumentStore.getState();
    const layout = getLayout(impositionType, pageCount, originalPageW, originalPageH, store);

    if (layout.sheets.length === 0) return;

    const idx = Math.min(currentSheetIndex, layout.sheets.length - 1);
    const sheetData = layout.sheets[idx];
    const sW = layout.sheetWidth;
    const sH = layout.sheetHeight;
    const marksOverlay = calculateMarks(sW, sH, marks.bleed, sheet.margins, marks, sheetData.cells);

    await previewEngine.renderSheet(
      canvas,
      sheetData,
      marksOverlay,
      sW,
      sH,
      previewScale,
    );

    if (idx !== currentSheetIndex && idx < layout.sheets.length) {
      setCurrentSheetIndex(idx);
    }
  }, [
    originalPdfBytes,
    pageCount,
    originalPageW,
    originalPageH,
    impositionType,
    nup,
    booklet,
    perfectBound,
    cards,
    sheet,
    marks,
    previewScale,
    currentSheetIndex,
    setCurrentSheetIndex,
  ]);

  useEffect(() => {
    if (!originalPdfBytes || pageCount === 0) return;

    previewEngine.init(originalPdfBytes).then(() => {
      doRender();
    });

    return () => {
      previewEngine.dispose();
    };
  }, [originalPdfBytes, pageCount]);

  useEffect(() => {
    if (renderTimeout.current) clearTimeout(renderTimeout.current);
    renderTimeout.current = setTimeout(() => {
      doRender();
    }, 150);
    return () => {
      if (renderTimeout.current) clearTimeout(renderTimeout.current);
    };
  }, [doRender]);

  const store = useDocumentStore.getState();
  const layout = pageCount > 0 ? getLayout(impositionType, pageCount, originalPageW, originalPageH, store) : { sheets: [], totalSheets: 0, sheetWidth: originalPageW, sheetHeight: originalPageH };
  const totalSheets = layout.totalSheets;

  const fitToWidth = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth - 48;
    const scaleW = w / layout.sheetWidth;
    setPreviewScale(Math.round(scaleW * 100) / 100);
  }, [layout.sheetWidth, setPreviewScale]);

  const zoomIn = () => setPreviewScale(Math.min(3, previewScale + 0.1));
  const zoomOut = () => setPreviewScale(Math.max(0.1, previewScale - 0.1));
  const zoom100 = () => setPreviewScale(1);

  if (!originalPdfBytes || pageCount === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="mx-auto text-gray-300 dark:text-gray-700 mb-3"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 7h8M8 11h8M8 15h5" />
          </svg>
          <p className="text-sm text-gray-400">
            Cargá un PDF para ver la previsualización
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentSheetIndex(Math.max(0, currentSheetIndex - 1))}
            disabled={currentSheetIndex === 0}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 4l-4 4 4 4" />
            </svg>
          </button>
          <span className="text-sm font-medium tabular-nums min-w-[80px] text-center">
            Hoja {currentSheetIndex + 1} / {totalSheets || 1}
          </span>
          <button
            onClick={() => setCurrentSheetIndex(Math.min(totalSheets - 1, currentSheetIndex + 1))}
            disabled={currentSheetIndex >= totalSheets - 1}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            −
          </button>
          <button onClick={zoom100} className="px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 tabular-nums">
            {Math.round(previewScale * 100)}%
          </button>
          <button onClick={zoomIn} className="px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            +
          </button>
          <button onClick={fitToWidth} className="px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            Ajustar
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto flex items-start justify-center p-6">
        <canvas
          ref={canvasRef}
          className="shadow-lg bg-white"
          style={{ maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}

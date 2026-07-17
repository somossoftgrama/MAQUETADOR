import { create } from 'zustand';
import {
  SHEET_PRESETS,
} from '@/types/imposition';
import type {
  ImpositionType,
  Unit,
  Orientation,
  NUpConfig,
  BookletConfig,
  PerfectBoundConfig,
  CardsConfig,
  ProductionMarks,
  SheetConfig,
  SheetPreset,
} from '@/types/imposition';

const DEFAULT_NUP: NUpConfig = { pagesPerSheet: 4, orientation: 'portrait' };
const DEFAULT_BOOKLET: BookletConfig = { signatureSize: 0, autoCreep: true, manualCreep: 0, spineGutter: 18 };
const DEFAULT_PERFECT_BOUND: PerfectBoundConfig = { signatureSize: 8 };
const DEFAULT_CARDS: CardsConfig = { cardWidth: 252, cardHeight: 144, cols: 2, rows: 5, gutter: 10, sourcePage: 0 };
const DEFAULT_MARKS: ProductionMarks = { cropMarks: true, cropMarkLength: 20, cropMarkOffset: 6, cropMarkThickness: 0.25, registrationMarks: false, bleed: 8.5, colorBar: false, colorBarType: 'CMYK' };
const DEFAULT_SHEET: SheetConfig = { preset: 'A3', width: 841.89, height: 1190.55, orientation: 'portrait', margins: 36, gutter: 14, centerContent: true };

interface DocumentState {
  originalFile: File | null;
  originalPdfBytes: ArrayBuffer | null;
  pageCount: number;
  fileName: string;
  fileSize: number;
  originalPageWidth: number;
  originalPageHeight: number;

  impositionType: ImpositionType;
  nup: NUpConfig;
  booklet: BookletConfig;
  perfectBound: PerfectBoundConfig;
  cards: CardsConfig;
  sheet: SheetConfig;
  marks: ProductionMarks;
  unit: Unit;

  previewScale: number;
  currentSheetIndex: number;
  isProcessing: boolean;
  error: string | null;
  darkMode: boolean;

  loadFile: (file: File) => Promise<void>;
  reset: () => void;
  setImpositionType: (type: ImpositionType) => void;
  setNUpConfig: (config: Partial<NUpConfig>) => void;
  setBookletConfig: (config: Partial<BookletConfig>) => void;
  setPerfectBoundConfig: (config: Partial<PerfectBoundConfig>) => void;
  setCardsConfig: (config: Partial<CardsConfig>) => void;
  setSheetConfig: (config: Partial<SheetConfig>) => void;
  setSheetPreset: (preset: SheetPreset) => void;
  setSheetOrientation: (orientation: Orientation) => void;
  setMarksConfig: (config: Partial<ProductionMarks>) => void;
  setUnit: (unit: Unit) => void;
  setPreviewScale: (scale: number) => void;
  setCurrentSheetIndex: (index: number) => void;
  setIsProcessing: (v: boolean) => void;
  setError: (error: string | null) => void;
  toggleDarkMode: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  originalFile: null,
  originalPdfBytes: null,
  pageCount: 0,
  fileName: '',
  fileSize: 0,
  originalPageWidth: 595.28,
  originalPageHeight: 841.89,

  impositionType: 'nup',
  nup: DEFAULT_NUP,
  booklet: DEFAULT_BOOKLET,
  perfectBound: DEFAULT_PERFECT_BOUND,
  cards: DEFAULT_CARDS,
  sheet: DEFAULT_SHEET,
  marks: DEFAULT_MARKS,
  unit: 'mm',

  previewScale: 0.5,
  currentSheetIndex: 0,
  isProcessing: false,
  error: null,
  darkMode: typeof window !== 'undefined' ? localStorage.getItem('maquetador-dark-mode') === 'true' : false,

  loadFile: async (file: File) => {
    set({ isProcessing: true, error: null, originalFile: file, fileName: file.name, fileSize: file.size });

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
      const pageCount = pdfDoc.getPageCount();

      let pw = 595.28;
      let ph = 841.89;
      if (pageCount > 0) {
        const firstPage = pdfDoc.getPage(0);
        const size = firstPage.getSize();
        pw = size.width;
        ph = size.height;
      }

      set({
        originalPdfBytes: arrayBuffer,
        pageCount,
        originalPageWidth: pw,
        originalPageHeight: ph,
        isProcessing: false,
        currentSheetIndex: 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      const isEncrypted =
        msg.includes('encrypted') || msg.includes('password') || msg.includes('cifrado');
      set({
        isProcessing: false,
        error: isEncrypted
          ? 'El PDF está protegido con contraseña. No se pueden procesar archivos encriptados.'
          : `Error al cargar el PDF: ${msg}`,
        originalPdfBytes: null,
        pageCount: 0,
      });
    }
  },

  reset: () =>
    set({
      originalFile: null,
      originalPdfBytes: null,
      pageCount: 0,
      fileName: '',
      fileSize: 0,
      originalPageWidth: 595.28,
      originalPageHeight: 841.89,
      impositionType: 'nup',
      nup: DEFAULT_NUP,
      booklet: DEFAULT_BOOKLET,
      perfectBound: DEFAULT_PERFECT_BOUND,
      cards: DEFAULT_CARDS,
      sheet: DEFAULT_SHEET,
      marks: DEFAULT_MARKS,
      unit: 'mm',
      previewScale: 0.5,
      currentSheetIndex: 0,
      isProcessing: false,
      error: null,
    }),

  setImpositionType: (type) => set({ impositionType: type, currentSheetIndex: 0 }),

  setNUpConfig: (config) =>
    set((s) => ({ nup: { ...s.nup, ...config }, currentSheetIndex: 0 })),

  setBookletConfig: (config) =>
    set((s) => ({ booklet: { ...s.booklet, ...config }, currentSheetIndex: 0 })),

  setPerfectBoundConfig: (config) =>
    set((s) => ({ perfectBound: { ...s.perfectBound, ...config }, currentSheetIndex: 0 })),

  setCardsConfig: (config) =>
    set((s) => ({ cards: { ...s.cards, ...config }, currentSheetIndex: 0 })),

  setSheetConfig: (config) =>
    set((s) => ({ sheet: { ...s.sheet, ...config }, currentSheetIndex: 0 })),

  setSheetPreset: (preset) => {
    const size = SHEET_PRESETS[preset];
    set((s) => ({
      sheet: { ...s.sheet, preset, width: size.width, height: size.height, orientation: 'portrait' as const },
      currentSheetIndex: 0,
    }));
  },

  setSheetOrientation: (orientation) =>
    set((s) => ({
      sheet: {
        ...s.sheet,
        orientation,
        width: s.sheet.height,
        height: s.sheet.width,
      },
      currentSheetIndex: 0,
    })),

  setMarksConfig: (config) =>
    set((s) => ({ marks: { ...s.marks, ...config }, currentSheetIndex: 0 })),

  setUnit: (unit) => set({ unit }),

  setPreviewScale: (scale) => set({ previewScale: scale }),

  setCurrentSheetIndex: (index) => set({ currentSheetIndex: index }),

  setIsProcessing: (v) => set({ isProcessing: v }),

  setError: (error) => set({ error }),

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('maquetador-dark-mode', String(next));
      return { darkMode: next };
    }),
}));

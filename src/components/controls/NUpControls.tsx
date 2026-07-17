import { useDocumentStore } from '@/store/documentStore';
import { Select } from '@/components/ui/Select';
import { NUP_OPTIONS, getGridDimensions } from '@/lib/pdf/imposition/nup';

export function NUpControls() {
  const nup = useDocumentStore((s) => s.nup);
  const setNUpConfig = useDocumentStore((s) => s.setNUpConfig);
  const { rows, cols } = getGridDimensions(nup.pagesPerSheet, nup.orientation);

  return (
    <div className="space-y-3">
      <Select
        label="Páginas por hoja"
        value={String(nup.pagesPerSheet)}
        onChange={(v) => setNUpConfig({ pagesPerSheet: Number(v) })}
        options={NUP_OPTIONS.map((n) => ({ value: String(n), label: `${n} páginas` }))}
      />

      <Select
        label="Orientación"
        value={nup.orientation}
        onChange={(v) => setNUpConfig({ orientation: v as 'portrait' | 'landscape' })}
        options={[
          { value: 'portrait', label: 'Vertical' },
          { value: 'landscape', label: 'Horizontal' },
        ]}
      />

      <p className="text-xs text-gray-400">
        Cuadrícula: {cols} columnas × {rows} filas
      </p>
    </div>
  );
}

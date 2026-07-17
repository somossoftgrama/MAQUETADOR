import { useDocumentStore } from '@/store/documentStore';
import { Select } from '@/components/ui/Select';
import { NumberInput } from '@/components/ui/NumberInput';
import { Toggle } from '@/components/ui/Toggle';
import { SHEET_PRESETS } from '@/types/imposition';
import type { SheetPreset, Unit, Orientation } from '@/types/imposition';
import { pointsToUnit, unitToPoints } from '@/types/imposition';

const PRESET_OPTIONS: { value: SheetPreset; label: string }[] = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'A3', label: 'A3 (297 × 420 mm)' },
  { value: 'MegaA3', label: 'Mega A3 (330 × 480 mm)' },
  { value: 'Letter', label: 'Carta (8.5 × 11")' },
  { value: 'Legal', label: 'Legal (8.5 × 14")' },
  { value: 'Tabloid', label: 'Tabloide (11 × 17")' },
  { value: 'Custom', label: 'Personalizado' },
];

const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: 'mm', label: 'Milímetros' },
  { value: 'cm', label: 'Centímetros' },
  { value: 'in', label: 'Pulgadas' },
];

export function SheetSettings() {
  const sheet = useDocumentStore((s) => s.sheet);
  const unit = useDocumentStore((s) => s.unit);
  const setSheetPreset = useDocumentStore((s) => s.setSheetPreset);
  const setSheetConfig = useDocumentStore((s) => s.setSheetConfig);
  const setSheetOrientation = useDocumentStore((s) => s.setSheetOrientation);
  const setUnit = useDocumentStore((s) => s.setUnit);

  const handleOrientationChange = (orientation: Orientation) => {
    if (orientation !== sheet.orientation) {
      setSheetOrientation(orientation);
    }
  };

  return (
    <div className="space-y-3">
      <Select
        label="Tamaño de hoja"
        value={sheet.preset}
        onChange={(v) => setSheetPreset(v)}
        options={PRESET_OPTIONS}
      />

      <Select
        label="Orientación"
        value={sheet.orientation}
        onChange={handleOrientationChange}
        options={[
          { value: 'portrait', label: 'Vertical' },
          { value: 'landscape', label: 'Horizontal' },
        ]}
      />

      <Select
        label="Unidad"
        value={unit}
        onChange={(v) => setUnit(v)}
        options={UNIT_OPTIONS}
      />

      {sheet.preset === 'Custom' && (
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="Ancho"
            value={pointsToUnit(sheet.width, unit)}
            onChange={(v) => setSheetConfig({ width: unitToPoints(v, unit) })}
            min={36}
            max={2000}
            unit={unit}
          />
          <NumberInput
            label="Alto"
            value={pointsToUnit(sheet.height, unit)}
            onChange={(v) => setSheetConfig({ height: unitToPoints(v, unit) })}
            min={36}
            max={2000}
            unit={unit}
          />
        </div>
      )}

      <Toggle
        label="Centrar contenido en la hoja"
        checked={sheet.centerContent}
        onChange={(v) => setSheetConfig({ centerContent: v })}
      />

      <NumberInput
        label="Márgenes"
        value={sheet.margins}
        onChange={(v) => setSheetConfig({ margins: v })}
        min={0}
        max={200}
        unit="pt"
      />

      <NumberInput
        label="Separación (gutter)"
        value={sheet.gutter}
        onChange={(v) => setSheetConfig({ gutter: v })}
        min={0}
        max={100}
        unit="pt"
      />
    </div>
  );
}

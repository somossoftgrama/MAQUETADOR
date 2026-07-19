import { useDocumentStore } from '@/store/documentStore';
import { Select } from '@/components/ui/Select';
import { NumberInput } from '@/components/ui/NumberInput';
import { Toggle } from '@/components/ui/Toggle';
import { SHEET_PRESETS } from '@/types/imposition';
import type { SheetPreset, Unit, Orientation, BleedMode, GrainDirection } from '@/types/imposition';
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
  const setGripperConfig = useDocumentStore((s) => s.setGripperConfig);

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
        label="Dirección de fibra"
        value={sheet.grainDirection}
        onChange={(v) => setSheetConfig({ grainDirection: v as GrainDirection })}
        options={[
          { value: 'long', label: 'Fibra larga (paralela al lomo)' },
          { value: 'short', label: 'Fibra corta (perpendicular al lomo)' },
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

      <Toggle
        label="Margen de pinza"
        checked={sheet.gripper.enabled}
        onChange={(v) => setGripperConfig({ enabled: v })}
      />

      {sheet.gripper.enabled && (
        <>
          <NumberInput
            label="Tamaño de pinza"
            value={sheet.gripper.size}
            onChange={(v) => setGripperConfig({ size: v })}
            min={0}
            max={100}
            step={0.5}
            unit="pt"
          />
          <Select
            label="Lado de la pinza"
            value={sheet.gripper.side}
            onChange={(v) => setGripperConfig({ side: v as 'top' | 'bottom' | 'left' | 'right' })}
            options={[
              { value: 'bottom', label: 'Abajo (entrada de hoja)' },
              { value: 'top', label: 'Arriba' },
              { value: 'left', label: 'Izquierda' },
              { value: 'right', label: 'Derecha' },
            ]}
          />
        </>
      )}

      <NumberInput
        label="Separación (gutter)"
        value={sheet.gutter}
        onChange={(v) => setSheetConfig({ gutter: v })}
        min={0}
        max={100}
        unit="pt"
      />

      <Select
        label="Si el PDF no tiene sangrado"
        value={sheet.bleedMode}
        onChange={(v) => setSheetConfig({ bleedMode: v as BleedMode })}
        options={[
          { value: 'none', label: 'No hacer nada (puede fallar)' },
          { value: 'scale', label: 'Escalar para llenar el bleed' },
          { value: 'crop', label: 'Recortar al borde de página' },
          { value: 'extend', label: 'Extender con color de fondo' },
        ]}
      />
      {sheet.bleedMode === 'extend' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={sheet.extendColor}
            onChange={(e) => setSheetConfig({ extendColor: e.target.value })}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <span className="text-xs text-gray-500">Color de extensión del bleed</span>
        </div>
      )}
    </div>
  );
}

import { useDocumentStore } from '@/store/documentStore';
import { Toggle } from '@/components/ui/Toggle';
import { NumberInput } from '@/components/ui/NumberInput';
import { Select } from '@/components/ui/Select';

export function MarksControls() {
  const marks = useDocumentStore((s) => s.marks);
  const setMarksConfig = useDocumentStore((s) => s.setMarksConfig);

  return (
    <div className="space-y-3">
      <Toggle
        label="Marcas de corte"
        checked={marks.cropMarks}
        onChange={(v) => setMarksConfig({ cropMarks: v })}
      />
      {marks.cropMarks && (
        <>
          <NumberInput
            label="Largo de línea"
            value={marks.cropMarkLength}
            onChange={(v) => setMarksConfig({ cropMarkLength: v })}
            min={5}
            max={50}
            step={0.5}
            unit="pt"
          />
          <NumberInput
            label="Separación de la esquina"
            value={marks.cropMarkOffset}
            onChange={(v) => setMarksConfig({ cropMarkOffset: v })}
            min={0}
            max={30}
            step={0.5}
            unit="pt"
          />
          <NumberInput
            label="Grosor de línea"
            value={marks.cropMarkThickness}
            onChange={(v) => setMarksConfig({ cropMarkThickness: v })}
            min={0.1}
            max={3}
            step={0.05}
            unit="pt"
          />
        </>
      )}
      <Toggle
        label="Marcas de registro"
        checked={marks.registrationMarks}
        onChange={(v) => setMarksConfig({ registrationMarks: v })}
      />
      <Toggle
        label="Barra de color"
        checked={marks.colorBar}
        onChange={(v) => setMarksConfig({ colorBar: v })}
      />
      {marks.colorBar && (
        <Select
          label="Tipo de barra"
          value={marks.colorBarType}
          onChange={(v) => setMarksConfig({ colorBarType: v as 'CMYK' | 'grayscale' })}
          options={[
            { value: 'CMYK', label: 'CMYK (cian, magenta, amarillo, negro)' },
            { value: 'grayscale', label: 'Escala de grises' },
          ]}
        />
      )}
      <NumberInput
        label="Sangrado (bleed)"
        value={marks.bleed}
        onChange={(v) => setMarksConfig({ bleed: v })}
        min={0}
        max={50}
        step={0.5}
        unit="pt"
      />
    </div>
  );
}

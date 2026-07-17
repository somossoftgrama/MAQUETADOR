import { useDocumentStore } from '@/store/documentStore';
import { NumberInput } from '@/components/ui/NumberInput';

export function PerfectBoundControls() {
  const perfectBound = useDocumentStore((s) => s.perfectBound);
  const setPerfectBoundConfig = useDocumentStore((s) => s.setPerfectBoundConfig);

  return (
    <div className="space-y-3">
      <NumberInput
        label="Páginas por cuadernillo"
        value={perfectBound.signatureSize}
        onChange={(v) => setPerfectBoundConfig({ signatureSize: v })}
        min={4}
        max={64}
        step={4}
        unit="págs"
      />
      <p className="text-xs text-gray-400">
        Agrupa las páginas en cuadernillos para encuadernación pegada (pur binding).
      </p>
    </div>
  );
}

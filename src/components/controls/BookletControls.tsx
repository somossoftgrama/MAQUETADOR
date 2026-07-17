import { useDocumentStore } from '@/store/documentStore';
import { calcularCreepAutomatico } from '@/lib/pdf/imposition/booklet';
import { NumberInput } from '@/components/ui/NumberInput';
import { Toggle } from '@/components/ui/Toggle';

export function BookletControls() {
  const pageCount = useDocumentStore((s) => s.pageCount);
  const booklet = useDocumentStore((s) => s.booklet);
  const setBookletConfig = useDocumentStore((s) => s.setBookletConfig);

  const creepAuto = calcularCreepAutomatico(pageCount);
  const totalPliegos = Math.ceil(Math.ceil(pageCount / 4) * 4 / 4);
  const sigSize = booklet.signatureSize > 0 && booklet.signatureSize < pageCount
    ? booklet.signatureSize
    : pageCount;
  const numCuadernillos = Math.ceil(pageCount / sigSize);

  return (
    <div className="space-y-4">
      <NumberInput
        label="Páginas por cuadernillo"
        value={booklet.signatureSize}
        onChange={(v) => setBookletConfig({ signatureSize: v })}
        min={0}
        max={pageCount || 100}
        step={4}
      />
      <p className="text-xs text-gray-400 -mt-2">
        {booklet.signatureSize <= 0
          ? '1 cuadernillo con todas las páginas.'
          : `${numCuadernillos} cuadernillo${numCuadernillos !== 1 ? 's' : ''} de ${sigSize} págs c/u.`}{' '}
        Total: {totalPliegos} {totalPliegos === 1 ? 'pliego' : 'pliegos'}.
      </p>

      <NumberInput
        label="Separación de lomo (gutter)"
        value={booklet.spineGutter}
        onChange={(v) => setBookletConfig({ spineGutter: v })}
        min={0}
        max={100}
        step={1}
        unit="pt"
      />
      <p className="text-xs text-gray-400 -mt-2">
        Espacio entre las dos páginas del pliego (lomo).
      </p>

      <div className="space-y-2">
        <Toggle
          label="Creep automático"
          checked={booklet.autoCreep}
          onChange={(v) => setBookletConfig({ autoCreep: v })}
        />

        {booklet.autoCreep ? (
          <div className="rounded-md border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                Valor calculado
              </span>
              <span className="text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                {creepAuto.toFixed(1)} pt
              </span>
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/60 mt-1">
              Basado en {pageCount} páginas. Las interiores se desplazan para compensar el papel.
            </p>
          </div>
        ) : (
          <NumberInput
            label="Creep manual"
            value={booklet.manualCreep}
            onChange={(v) => setBookletConfig({ manualCreep: v })}
            min={0}
            max={50}
            step={0.1}
            unit="pt"
          />
        )}
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
          Rotación de páginas (saddle-stitch)
        </h4>
        <div className="text-[10px] text-gray-400 leading-relaxed space-y-0.5">
          <p>· Frente izquierda: 0° (normal)</p>
          <p>· Frente derecha: 180° (invertida)</p>
          <p>· Dorso izquierda: 180° (invertida)</p>
          <p>· Dorso derecha: 0° (normal)</p>
          <p className="mt-1 text-gray-500">
            La rotación se aplica automáticamente para que al doblar el pliego las páginas queden orientadas correctamente.
          </p>
        </div>
      </div>
    </div>
  );
}

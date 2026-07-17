import { useDocumentStore } from '@/store/documentStore';
import { NumberInput } from '@/components/ui/NumberInput';

export function CardsControls() {
  const cards = useDocumentStore((s) => s.cards);
  const setCardsConfig = useDocumentStore((s) => s.setCardsConfig);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Ancho tarjeta"
          value={cards.cardWidth}
          onChange={(v) => setCardsConfig({ cardWidth: v })}
          min={36}
          max={2000}
          unit="pt"
        />
        <NumberInput
          label="Alto tarjeta"
          value={cards.cardHeight}
          onChange={(v) => setCardsConfig({ cardHeight: v })}
          min={36}
          max={2000}
          unit="pt"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Columnas"
          value={cards.cols}
          onChange={(v) => setCardsConfig({ cols: v })}
          min={1}
          max={20}
        />
        <NumberInput
          label="Filas"
          value={cards.rows}
          onChange={(v) => setCardsConfig({ rows: v })}
          min={1}
          max={20}
        />
      </div>
      <NumberInput
        label="Separación (gutter)"
        value={cards.gutter}
        onChange={(v) => setCardsConfig({ gutter: v })}
        min={0}
        max={100}
        unit="pt"
      />
    </div>
  );
}

import { useDocumentStore } from '@/store/documentStore';
import { Select } from '@/components/ui/Select';
import type { ImpositionType } from '@/types/imposition';

const TYPE_OPTIONS: { value: ImpositionType; label: string }[] = [
  { value: 'nup', label: 'N-up' },
  { value: 'booklet', label: 'Folleto (Booklet)' },
  { value: 'perfect-bound', label: 'Encuadernación pegada' },
  { value: 'cards', label: 'Tarjetas (Step & Repeat)' },
  { value: 'cutstack', label: 'Cut & Stack' },
];

export function ImpositionTypeSelect() {
  const impositionType = useDocumentStore((s) => s.impositionType);
  const setImpositionType = useDocumentStore((s) => s.setImpositionType);

  return (
    <Select
      label="Tipo de imposición"
      value={impositionType}
      onChange={setImpositionType}
      options={TYPE_OPTIONS}
    />
  );
}

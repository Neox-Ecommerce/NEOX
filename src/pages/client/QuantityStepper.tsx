import { Minus, Plus } from 'lucide-react';
import { IconButton } from '@/components/PageStates';

/** Seletor de quantidade com alvos de 44px e rótulos acessíveis. */
export function QuantityStepper({
  value,
  max,
  onChange,
  name,
  disabled,
  min = 1,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  name: string; // nome do produto, para os rótulos
  disabled?: boolean;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-md border" role="group" aria-label={`Quantidade de ${name}`}>
      <IconButton
        type="button"
        label={`Diminuir quantidade de ${name}`}
        icon={Minus}
        className="h-11 w-11"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      />
      <span className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">
        <span className="sr-only">Quantidade: </span>
        {value}
      </span>
      <IconButton
        type="button"
        label={`Aumentar quantidade de ${name}`}
        icon={Plus}
        className="h-11 w-11"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      />
    </div>
  );
}

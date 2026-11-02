import { useEffect, useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { TONE_CLASS, type LabelMap, type Tone } from './labels';

export function Pill({ map, value, className }: { map: LabelMap; value: string; className?: string }) {
  const info = map[value] ?? { label: value, tone: 'neutral' as Tone };
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium', TONE_CLASS[info.tone], className)}>
      {info.label}
    </span>
  );
}

/**
 * Diálogo de confirmação com campo de texto opcional/obrigatório (motivo, observação).
 * Abre quando `open` é true; `onConfirm` recebe o texto já sem espaços nas pontas.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  fieldLabel,
  required,
  minLength = 3,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  destructive?: boolean;
  fieldLabel?: string;
  required?: boolean;
  minLength?: number;
  pending?: boolean;
  onConfirm: (text: string) => void;
}) {
  const id = useId();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) {
      setText('');
      setError('');
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (required && value.length < minLength) {
      setError(`Informe pelo menos ${minLength} caracteres.`);
      return;
    }
    onConfirm(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {fieldLabel && (
            <div className="space-y-2">
              <Label htmlFor={id}>
                {fieldLabel}
                {!required && <span className="font-normal text-muted-foreground"> (opcional)</span>}
              </Label>
              <Textarea
                id={id}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                maxLength={2000}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-erro` : undefined}
              />
              {error && <p id={`${id}-erro`} className="text-sm text-destructive">{error}</p>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant={destructive ? 'destructive' : 'default'} disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

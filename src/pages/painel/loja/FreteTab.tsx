import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryState } from '@/components/PageStates';
import { SettingsService, type StoreSettings } from '@/services/SettingsService';
import { FeedbackService } from '@/services/FeedbackService';
import { formatCurrency } from '@/lib/utils';

type Shipping = StoreSettings['shipping'];

function FreteForm({ saved }: { saved: Shipping }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(saved);
  useEffect(() => setForm(saved), [saved]);
  const set = (patch: Partial<Shipping>) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const mutation = useMutation({
    mutationFn: () => SettingsService.updateStoreSettings({ shipping: form }),
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      FeedbackService.success('Regras de frete salvas.');
    },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível salvar o frete.'),
  });

  const money = (v: string) => Math.max(0, Number(v.replace(',', '.')) || 0);

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Valor do frete</CardTitle>
          <CardDescription>Aplicado por pedido no checkout da sua loja.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="frete-padrao">Frete por pedido (R$)</Label>
            <Input id="frete-padrao" type="number" min="0" step="0.01" inputMode="decimal" value={form.defaultShippingCost}
              onChange={(e) => set({ defaultShippingCost: money(e.target.value) })} aria-describedby="frete-padrao-ajuda" />
            <p id="frete-padrao-ajuda" className="text-xs text-muted-foreground">Use 0 para frete sempre grátis.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="frete-gratis">Frete grátis a partir de (R$)</Label>
            <Input id="frete-gratis" type="number" min="0" step="0.01" inputMode="decimal" value={form.freeShippingThreshold}
              onChange={(e) => set({ freeShippingThreshold: money(e.target.value) })} aria-describedby="frete-gratis-ajuda" />
            <p id="frete-gratis-ajuda" className="text-xs text-muted-foreground">Use 0 para não oferecer frete grátis por valor.</p>
          </div>
          <p className="rounded-lg bg-muted p-3 text-sm sm:col-span-2">
            Como o cliente vê: {form.defaultShippingCost > 0 ? `frete de ${formatCurrency(form.defaultShippingCost)}` : 'frete grátis'}
            {form.defaultShippingCost > 0 && form.freeShippingThreshold > 0 && `, grátis em compras a partir de ${formatCurrency(form.freeShippingThreshold)}`}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Preparo e retirada</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="prazo-preparo">Prazo de preparo (dias úteis)</Label>
            <Input id="prazo-preparo" type="number" min="0" step="1" inputMode="numeric" value={form.processingTime}
              onChange={(e) => set({ processingTime: Math.max(0, Math.trunc(Number(e.target.value)) || 0) })} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <Label htmlFor="retirada">Permitir retirada na loja</Label>
              <p className="text-sm text-muted-foreground">O cliente busca o pedido no seu endereço.</p>
            </div>
            <Switch id="retirada" checked={form.allowPickup} onCheckedChange={(c) => set({ allowPickup: c })} />
          </div>
          {form.allowPickup && (
            <div className="space-y-2">
              <Label htmlFor="instrucoes-retirada">Instruções para retirada</Label>
              <Textarea id="instrucoes-retirada" rows={3} value={form.pickupInstructions ?? ''} onChange={(e) => set({ pickupInstructions: e.target.value })} placeholder="Endereço, horário e o que levar." />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={!dirty} onClick={() => setForm(saved)}>Descartar</Button>
        <Button type="submit" disabled={!dirty || mutation.isPending}>{mutation.isPending ? 'Salvando…' : 'Salvar frete'}</Button>
      </div>
    </form>
  );
}

/** Frete vem do JSON de configurações (/stores/me/settings), lido pelo checkout. */
export function FreteTab() {
  const query = useQuery({ queryKey: ['store-settings'], queryFn: SettingsService.getStoreSettings });
  return <QueryState query={query}>{(s) => <FreteForm saved={s.shipping} />}</QueryState>;
}

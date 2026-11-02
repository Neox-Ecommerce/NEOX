import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, QueryState } from '@/components/PageStates';
import { StoreService } from '@/services/StoreService';
import { cn } from '@/lib/utils';
import { DadosLojaTab } from './loja/DadosLojaTab';
import { FreteTab } from './loja/FreteTab';
import { DocumentosTab } from './loja/DocumentosTab';
import { IntegracoesTab } from './loja/IntegracoesTab';

const TABS = [
  { to: '/painel/loja', label: 'Dados da loja', end: true },
  { to: '/painel/loja/frete', label: 'Frete' },
  { to: '/painel/loja/documentos', label: 'Documentos' },
  { to: '/painel/loja/integracoes', label: 'Integrações' },
];

/** "Minha loja": cada aba é uma sub-rota (/painel/loja/*), então dá para linkar direto. */
export function MyStorePage() {
  const storeQuery = useQuery({ queryKey: ['store'], queryFn: StoreService.getStore });
  const store = storeQuery.data;

  return (
    <div>
      <PageHeader
        title="Minha loja"
        description="Dados que os clientes veem, regras de frete, documentos e integrações."
        actions={store?.status === 'APROVADA' && (
          <Button variant="outline" asChild>
            <a href={`/lojas/${store.id}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" /> Ver como cliente
            </a>
          </Button>
        )}
      />

      <nav aria-label="Seções da loja" className="mb-6 overflow-x-auto border-b">
        <ul className="flex gap-1">
          {TABS.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) => cn(
                  'inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-4 text-sm font-medium transition-colors',
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <QueryState query={storeQuery}>
        {(s) => (
          <Routes>
            <Route index element={<DadosLojaTab store={s} />} />
            <Route path="frete" element={<FreteTab />} />
            <Route path="documentos" element={<DocumentosTab store={s} />} />
            <Route path="integracoes" element={<IntegracoesTab />} />
            <Route path="*" element={<Navigate to="/painel/loja" replace />} />
          </Routes>
        )}
      </QueryState>
    </div>
  );
}

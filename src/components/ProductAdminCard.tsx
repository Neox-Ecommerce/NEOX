import { Edit, Eye, EyeOff, Package, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { IconButton } from '@/components/PageStates';
import { StatusBadge, stockLevel } from '@/components/StatusBadge';
import type { Product } from '@/services/ProductService';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductAdminCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
}

/** Card de produto do painel (usado no lugar da tabela no celular). */
export function ProductAdminCard({ product, onEdit, onDelete, onToggleStatus, selected, onSelect }: ProductAdminCardProps) {
  const finalPrice = product.desconto ? product.preco * (1 - product.desconto / 100) : product.preco;

  return (
    <Card className={cn(!product.ativo && 'bg-muted/50')}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {onSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={(c) => onSelect(c === true)}
              aria-label={`Selecionar ${product.nome}`}
              className="mt-1"
            />
          )}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
            {product.imagem
              ? <img src={product.imagem} alt="" loading="lazy" className="h-full w-full object-cover" />
              : <Package className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="line-clamp-2 font-medium">{product.nome}</h3>
            <p className="text-sm">
              <span className="font-semibold text-primary">{formatCurrency(finalPrice)}</span>
              {!!product.desconto && <span className="ml-2 text-xs text-muted-foreground line-through">{formatCurrency(product.preco)}</span>}
            </p>
            <div className="flex flex-wrap gap-1">
              {!product.ativo && <StatusBadge kind="store" value="Inativo" />}
              <StatusBadge kind="stock" value={stockLevel(product.estoque, product.minStock)} />
              <span className="text-xs text-muted-foreground">{product.estoque} un.</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-1 border-t pt-2">
          {onToggleStatus && (
            <IconButton
              label={product.ativo ? `Desativar ${product.nome}` : `Ativar ${product.nome}`}
              icon={product.ativo ? EyeOff : Eye}
              onClick={() => onToggleStatus(product.id)}
            />
          )}
          <IconButton label={`Editar ${product.nome}`} icon={Edit} onClick={() => onEdit(product.id)} />
          <IconButton label={`Excluir ${product.nome}`} icon={Trash2} className="text-destructive hover:text-destructive" onClick={() => onDelete(product.id)} />
        </div>
      </CardContent>
    </Card>
  );
}

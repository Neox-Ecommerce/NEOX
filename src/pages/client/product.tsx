import React from 'react';
import { useParams } from 'react-router-dom';
import { Package, Star, Heart, Share2, ShoppingCart, Truck, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export function ProductPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl border flex items-center justify-center">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-white rounded-lg border flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Eletrônicos</Badge>
                <Badge variant="success">Em estoque</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Produto de Exemplo
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
                <span className="text-sm text-gray-500">(24 avaliações)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(299.99)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(399.99)}
                </span>
                <Badge variant="destructive">-25%</Badge>
              </div>
              <p className="text-sm text-gray-600">
                ou 12x de {formatCurrency(24.99)} sem juros
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-600">
                Este é um produto de exemplo para demonstrar a página de produto.
                Aqui você encontraria uma descrição detalhada do item, suas características
                e especificações técnicas.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button className="flex-1" size="lg">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="w-full" size="lg">
                Comprar Agora
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Frete Grátis</p>
                    <p className="text-xs text-gray-500">Acima de R$ 200</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Garantia</p>
                    <p className="text-xs text-gray-500">12 meses</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Store Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">TechStore Premium</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs">4.8 (124 avaliações)</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Loja
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
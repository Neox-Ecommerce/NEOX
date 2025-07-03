import React from 'react';
import { useParams } from 'react-router-dom';
import { Package, MapPin, Clock, Phone, Globe, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function StorePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-24 w-24 rounded-xl bg-gray-100 flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">TechStore Premium</h1>
              <p className="text-gray-600 mt-2">
                Loja especializada em produtos eletrônicos de alta qualidade
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-gray-500">(124 avaliações)</span>
                </div>
                <Badge variant="success">Verificada</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Store Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Loja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">São Paulo, SP</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Seg-Sex: 8h-18h</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">(11) 3333-4444</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">techstore.com.br</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
              <Button variant="outline">Filtrar</Button>
            </div>
            
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Produtos em breve
              </h3>
              <p className="mt-2 text-gray-600">
                Esta loja está preparando seu catálogo de produtos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
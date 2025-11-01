# 🔧 Serviços

Camada de serviços para lógica de negócio e comunicação com API.

## 📁 Estrutura

```
services/
├── ProductApiService.ts   # Comunicação com API de produtos
├── ProductService.ts      # Lógica de negócio de produtos
├── AuthApiService.ts      # Comunicação com API de autenticação
├── AuthService.ts         # Lógica de autenticação
└── ...
```

## 🎯 Padrão de Service

### Service vs ApiService

- **ApiService**: Comunicação direta com API (HTTP requests)
- **Service**: Lógica de negócio, validação, transformação de dados

### Exemplo

```typescript
// ProductApiService.ts - Comunicação HTTP
export class ProductApiService {
  static async getProductsByStore(storeId: number): Promise<ApiResponse<Product[]>> {
    return apiClient.get(`/products/store/${storeId}`);
  }
}

// ProductService.ts - Lógica de negócio
export class ProductService {
  static async getProducts(lojaId?: number | string | null): Promise<Product[]> {
    // Validação
    if (!lojaId) return [];
    
    // Chamada API
    const response = await ProductApiService.getProductsByStore(Number(lojaId));
    
    // Normalização e transformação
    const productsArray = extractApiArray<ApiProduct>(response);
    
    // Retorno validado
    return productsArray.map(mapApiProductToProduct);
  }
}
```

## 🛡️ Segurança

- ✅ Todos os métodos validam inputs
- ✅ Arrays sempre validados antes de retornar
- ✅ Erros sempre tratados com fallbacks seguros
- ✅ Tipos garantidos em tempo de compilação

## 📝 Convenções

- **Métodos estáticos** para facilitar uso
- **Sempre retornar tipos garantidos** (nunca `null` inesperado)
- **Logs informativos** para debug
- **Try-catch** em todas as operações assíncronas


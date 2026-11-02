import { api } from '@/lib/api';

export interface Address {
  id: string;
  label: string;
  recipient?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string; // 00000-000
  country: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'country'>;

// Endereços salvos do cliente logado. Sempre existe no máximo um padrão (regra da API).
export const AddressService = {
  list(): Promise<Address[]> {
    return api<Address[]>('/me/addresses');
  },
  create(data: AddressInput): Promise<Address> {
    return api<Address>('/me/addresses', { method: 'POST', body: data });
  },
  update(id: string, data: AddressInput): Promise<Address> {
    return api<Address>(`/me/addresses/${id}`, { method: 'PUT', body: data });
  },
  remove(id: string): Promise<void> {
    return api(`/me/addresses/${id}`, { method: 'DELETE' });
  },
};

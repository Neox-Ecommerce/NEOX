// ============================================
// TIPOS COMUNS E GENÉRICOS
// ============================================

export type Status = 'active' | 'inactive' | 'pending' | 'rejected' | 'suspended';

export interface BaseEntity {
  id: string | number;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}


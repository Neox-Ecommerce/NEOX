import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================
// UTILITÁRIOS GERAIS
// ============================================

/**
 * Merge de classes Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata número como moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata CNPJ com máscara
 */
export function formatCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

/**
 * Formata telefone com máscara
 */
export function formatPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
    .replace(/(-\d{4})\d+?$/, '$1');
}

/**
 * Formata WhatsApp com código do país
 */
export function formatWhatsApp(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1$2')
    .replace(/(\d{2})(\d{5})(\d{4})/, '55$1$2$3');
}

/**
 * Valida URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida username do Instagram
 */
export function validateInstagram(username: string): boolean {
  const regex = /^@?[a-zA-Z0-9._]{1,30}$/;
  return regex.test(username);
}

/**
 * Valida username do Facebook
 */
export function validateFacebook(username: string): boolean {
  const regex = /^[a-zA-Z0-9.]{5,50}$/;
  return regex.test(username);
}

/**
 * Converte string de moeda para número
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

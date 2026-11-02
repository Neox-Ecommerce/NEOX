// Utilidades de formulário brasileiras: máscaras, CPF, UF e consulta de CEP (ViaCEP).

export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE',
  'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export const digits = (v: string) => v.replace(/\D/g, '');

export function maskCep(v: string): string {
  const d = digits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function maskCpf(v: string): string {
  const d = digits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export function maskPhone(v: string): string {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Valida os dois dígitos verificadores do CPF. */
export function validCpf(v: string): boolean {
  const d = digits(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (len: number) => {
    const sum = [...d.slice(0, len)].reduce((s, n, i) => s + Number(n) * (len + 1 - i), 0);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

export interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/** Consulta o CEP no ViaCEP. null = CEP não existe; lança erro se a consulta falhar (rede). */
export async function lookupCep(cep: string): Promise<CepResult | null> {
  const res = await fetch(`https://viacep.com.br/ws/${digits(cep)}/json/`);
  if (!res.ok) throw new Error('Falha ao consultar o CEP');
  const data = await res.json();
  if (data.erro) return null;
  return { street: data.logradouro ?? '', neighborhood: data.bairro ?? '', city: data.localidade ?? '', state: data.uf ?? '' };
}

export interface AddressValue {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export const EMPTY_ADDRESS: AddressValue = { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };

export type FieldErrors = Partial<Record<string, string>>;

export function validateAddress(a: AddressValue): FieldErrors {
  const e: FieldErrors = {};
  if (!/^\d{5}-\d{3}$/.test(a.zipCode)) e.zipCode = 'Informe o CEP com 8 dígitos';
  if (!a.street.trim()) e.street = 'Informe a rua';
  if (!a.number.trim()) e.number = 'Informe o número (ou "s/n")';
  if (!a.neighborhood.trim()) e.neighborhood = 'Informe o bairro';
  if (!a.city.trim()) e.city = 'Informe a cidade';
  if (!UFS.includes(a.state)) e.state = 'Escolha a UF';
  return e;
}

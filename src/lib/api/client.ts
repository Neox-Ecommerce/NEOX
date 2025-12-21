import { API_CONFIG } from './config';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

/**
 * Cliente HTTP centralizado para todas as requisições
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Adiciona callback para quando o token for atualizado
   */
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notifica todos os callbacks quando o token for atualizado
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('neox_token');
  }

  /**
   * Obtém os headers padrão para requisições
   */
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Trata erros de resposta HTTP
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let data: any;
    
    try {
      if (isJson) {
        const text = await response.text();
        if (!text) {
          data = {};
        } else {
          data = JSON.parse(text);
        }
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta:', parseError);
      data = {};
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || data?.detail || `Erro ${response.status}: ${response.statusText}`,
        status: response.status,
        errors: data?.errors,
      };

      throw error;
    }

    // FastAPI retorna dados diretamente, não dentro de { data: ... }
    // Mas pode retornar em ambos os formatos
    if (data && typeof data === 'object') {
      // Se tiver apenas uma propriedade 'data', retornar ela
      if ('data' in data && Object.keys(data).length === 1) {
        return data.data;
      }
      // Caso contrário, retornar os dados diretamente
      return data;
    }
    
    return data;
  }

  /**
   * Tenta fazer refresh do token
   */
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('neox_refresh_token');

      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newToken = data.token;

      if (newToken) {
        this.setToken(newToken);
        return newToken;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Faz uma requisição HTTP genérica
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Se for erro 401 e não for uma retry, tentar refresh
      if (error.status === 401 && !isRetry && !endpoint.includes('/auth/refresh')) {
        // Se já estiver fazendo refresh, aguardar
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.subscribeTokenRefresh((token: string) => {
              // Retentar requisição original com novo token
              this.request<T>(endpoint, options, true)
                .then(resolve)
                .catch(reject);
            });
          });
        }

        // Iniciar processo de refresh
        this.isRefreshing = true;
        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;

        if (newToken) {
          // Notificar requisições em espera
          this.onTokenRefreshed(newToken);

          // Retentar requisição original
          return this.request<T>(endpoint, options, true);
        } else {
          // Refresh falhou, fazer logout
          localStorage.removeItem('neox_token');
          localStorage.removeItem('neox_refresh_token');
          localStorage.removeItem('neox_user');
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
          throw error;
        }
      }

      // Se já é um ApiError, re-throw
      if (error.status !== undefined && error.message) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw {
          message: 'Tempo de requisição excedido. Tente novamente.',
          status: 408,
        } as ApiError;
      }

      // Erro de rede (backend não disponível)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw {
          message: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
          status: 0,
        } as ApiError;
      }

      throw {
        message: error.message || 'Erro de conexão. Verifique sua internet.',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Upload de arquivo
   */
  async upload<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const token = this.getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw {
          message: 'Tempo de requisição excedido. Tente novamente.',
          status: 408,
        } as ApiError;
      }

      throw error;
    }
  }

  /**
   * Define o token de autenticação
   */
  setToken(token: string): void {
    localStorage.setItem('neox_token', token);
  }

  /**
   * Remove o token de autenticação
   */
  clearToken(): void {
    localStorage.removeItem('neox_token');
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient();


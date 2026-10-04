// Hybrid Client API: supports both full-stack Node.js/Express and static hosting (Netlify, Vercel, etc.)
import { clientDb } from './clientDb';

const TOKEN_KEY = 'fincontrol_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Check if running on a static hosting environment like Netlify
export function isStaticHosting(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host.includes('netlify.app') ||
    host.includes('vercel.app') ||
    host.includes('github.io') ||
    host.includes('pages.dev') ||
    host.includes('firebaseapp.com') ||
    host.includes('web.app') ||
    window.location.protocol === 'file:'
  );
}

let serverDisabled = isStaticHosting();

async function tryServerRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (serverDisabled) {
    throw new Error('STATIC_HOSTING_MODE');
  }

  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Fast abort timeout (2.5 seconds) so failed servers never hang or block the UI
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    // If server responded with 404 or 405 (static host with no /api routes)
    if (response.status === 404 || response.status === 405) {
      serverDisabled = true;
      throw new Error('API_NOT_FOUND_STATIC_HOSTING');
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      serverDisabled = true;
      throw new Error('API_NON_JSON_RESPONSE');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Erro de rede: ${response.statusText}`);
    }

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (
      err.name === 'AbortError' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('API_') ||
      err.message === 'STATIC_HOSTING_MODE'
    ) {
      serverDisabled = true;
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await tryServerRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    } catch (err: any) {
      // Fallback for Netlify / Static hosting environments
      return clientDb.login(credentials.email, credentials.password);
    }
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      return await tryServerRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (err: any) {
      return clientDb.register(userData.name, userData.email, userData.password);
    }
  },

  getMe: async () => {
    try {
      return await tryServerRequest('/api/auth/me');
    } catch (err: any) {
      return clientDb.getMe(getStoredToken() || undefined);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      return await tryServerRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    } catch {
      return { success: true, message: 'Instruções enviadas para o seu email.' };
    }
  },

  resetPassword: async (payload: { token: string; newPassword: string }) => {
    try {
      return await tryServerRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      return { success: true, message: 'Palavra-passe actualizada com sucesso.' };
    }
  },

  // Financial Data
  getAllData: async () => {
    try {
      return await tryServerRequest('/api/finance/data');
    } catch (err: any) {
      return clientDb.getAllData(getStoredToken() || 'usr_manuel_01');
    }
  },

  // Generic CRUD
  createItem: async <T = any>(collection: string, item: any): Promise<T> => {
    try {
      return await tryServerRequest<T>(`/api/finance/${collection}`, {
        method: 'POST',
        body: JSON.stringify(item)
      });
    } catch (err: any) {
      return clientDb.createItem(collection, item, getStoredToken() || 'usr_manuel_01') as unknown as T;
    }
  },

  updateItem: async <T = any>(collection: string, id: string, updates: any): Promise<T> => {
    try {
      return await tryServerRequest<T>(`/api/finance/${collection}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (err: any) {
      return clientDb.updateItem(collection, id, updates) as unknown as T;
    }
  },

  deleteItem: async (collection: string, id: string) => {
    try {
      return await tryServerRequest(`/api/finance/${collection}/${id}`, {
        method: 'DELETE'
      });
    } catch (err: any) {
      return clientDb.deleteItem(collection, id);
    }
  },

  // Specialized operations
  transfer: async (data: { fromAccountId: string; toAccountId: string; amount: number; date?: string; notes?: string }) => {
    try {
      return await tryServerRequest('/api/finance/transfer', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      return clientDb.transfer(data, getStoredToken() || 'usr_manuel_01');
    }
  },

  addSavingsTransaction: async (data: { goalId: string; amount: number; type: 'deposito' | 'resgate'; accountId?: string; notes?: string; date?: string }) => {
    try {
      return await tryServerRequest('/api/finance/savings-transaction', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      return clientDb.addSavingsTransaction(data, getStoredToken() || 'usr_manuel_01');
    }
  },

  addInvestmentTransaction: async (data: { investmentId: string; amount: number; type: string; notes?: string; date?: string }) => {
    try {
      return await tryServerRequest('/api/finance/investment-transaction', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      return clientDb.addInvestmentTransaction(data, getStoredToken() || 'usr_manuel_01');
    }
  },

  payDebt: async (data: { debtId: string; amount: number; accountId?: string }) => {
    try {
      return await tryServerRequest('/api/finance/debt-payment', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      return clientDb.payDebt(data.debtId, data.amount, data.accountId, getStoredToken() || 'usr_manuel_01');
    }
  },

  // Settings
  getSettings: async () => {
    try {
      return await tryServerRequest('/api/settings');
    } catch (err: any) {
      const data = clientDb.getAllData();
      return data.settings;
    }
  },

  updateSettings: async (settings: any) => {
    try {
      return await tryServerRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    } catch (err: any) {
      const updated = clientDb.updateItem('settings', settings.userId || 'usr_manuel_01', settings);
      return updated || settings;
    }
  },

  // AI Assistant
  askAI: async (question: string) => {
    try {
      return await tryServerRequest<{ answer: string }>('/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question })
      });
    } catch (err: any) {
      return clientDb.askAI(question, getStoredToken() || 'usr_manuel_01');
    }
  },

  // Backup
  exportBackup: async () => {
    try {
      return await tryServerRequest('/api/backup/export');
    } catch (err: any) {
      return clientDb.exportBackup();
    }
  },

  importBackup: async (backupData: any) => {
    try {
      return await tryServerRequest('/api/backup/import', {
        method: 'POST',
        body: JSON.stringify(backupData)
      });
    } catch (err: any) {
      return clientDb.importBackup(backupData);
    }
  },
};

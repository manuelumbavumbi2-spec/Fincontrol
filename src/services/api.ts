// Typed Client API for FinControl Angola backend

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

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Erro de rede: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) => 
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: { name: string; email: string; password: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/api/auth/me'),
  forgotPassword: (email: string) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload: { token: string; newPassword: string }) =>
    request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Financial Data
  getAllData: () => request('/api/finance/data'),
  
  // Generic CRUD
  createItem: <T = any>(collection: string, item: any): Promise<T> =>
    request(`/api/finance/${collection}`, { method: 'POST', body: JSON.stringify(item) }),
  updateItem: <T = any>(collection: string, id: string, updates: any): Promise<T> =>
    request(`/api/finance/${collection}/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteItem: (collection: string, id: string) =>
    request(`/api/finance/${collection}/${id}`, { method: 'DELETE' }),

  // Specialized operations
  transfer: (data: { fromAccountId: string; toAccountId: string; amount: number; date?: string; notes?: string }) =>
    request('/api/finance/transfer', { method: 'POST', body: JSON.stringify(data) }),
  addSavingsTransaction: (data: { goalId: string; amount: number; type: 'deposito' | 'resgate'; accountId?: string; notes?: string; date?: string }) =>
    request('/api/finance/savings-transaction', { method: 'POST', body: JSON.stringify(data) }),
  addInvestmentTransaction: (data: { investmentId: string; amount: number; type: string; notes?: string; date?: string }) =>
    request('/api/finance/investment-transaction', { method: 'POST', body: JSON.stringify(data) }),
  payDebt: (data: { debtId: string; amount: number; accountId?: string }) =>
    request('/api/finance/debt-payment', { method: 'POST', body: JSON.stringify(data) }),

  // Settings
  getSettings: () => request('/api/settings'),
  updateSettings: (settings: any) => request('/api/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // AI Assistant
  askAI: (question: string) => request<{ answer: string }>('/api/ai/ask', { method: 'POST', body: JSON.stringify({ question }) }),

  // Backup
  exportBackup: () => request('/api/backup/export'),
  importBackup: (backupData: any) => request('/api/backup/import', { method: 'POST', body: JSON.stringify(backupData) }),
};

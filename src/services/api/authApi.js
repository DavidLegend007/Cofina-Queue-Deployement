import { SERVER_URL } from '../config/constants';

export const getAuthToken = async (forceRefresh = false) => {
  if (typeof window === 'undefined') return null;
  let token = (!forceRefresh) ? localStorage.getItem('cofina_jwt_token') : null;
  if (!token) {
    return null;
  }
  return token;
};

export const getAuthHeaders = async (forceRefresh = false) => {
  const token = await getAuthToken(forceRefresh);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getAdminToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('cofina_admin_jwt_token') : null;
};

export const loginAsAdmin = async (password) => {
  try {
    const res = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password, role: 'ADMIN' })
    });
    if (!res.ok) {
      throw new Error('Mot de passe administrateur invalide');
    }
    const data = await res.json();
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('cofina_admin_jwt_token', data.token);
    }
    return data;
  } catch (err) {
    console.error('Échec authentification admin :', err);
    throw err;
  }
};

export const logoutAdmin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cofina_admin_jwt_token');
  }
};

export const getAdminAuthHeaders = async () => {
  let token = getAdminToken();
  if (!token) {
    throw new Error('Session administrateur expirée ou non authentifiée');
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

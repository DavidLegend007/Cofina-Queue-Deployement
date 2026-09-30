import { SERVER_URL } from '../config/constants';

export const getAuthToken = async (forceRefresh = false, agentName = null) => {
  if (typeof window === 'undefined') return null;
  let token = (!forceRefresh) ? localStorage.getItem('cofina_jwt_token') : null;
  if (!token) {
    const pin = localStorage.getItem('cofina_agent_pin');
    const targetAgent = agentName || localStorage.getItem('cofina_agent_username');
    if (!pin || !targetAgent) {
      return null;
    }
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetAgent, password: pin, role: 'AGENT' })
      });
      if (res.ok) {
        const data = await res.json();
        token = data.token;
        if (token) {
          localStorage.setItem('cofina_jwt_token', token);
          localStorage.setItem('cofina_agent_username', targetAgent);
          return token;
        }
      }
    } catch (e) {
      console.warn('Renouvellement session agent échoué :', e);
    }
    return null;
  }
  return token;
};

export const getAuthHeaders = async (forceRefresh = false, agentName = null) => {
  const token = await getAuthToken(forceRefresh, agentName);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const loginAsAgent = async (password, username = 'Mensah Koffi') => {
  try {
    const res = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: 'AGENT' })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Identifiant ou mot de passe / code PIN incorrect');
    }
    const data = await res.json();
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('cofina_jwt_token', data.token);
      localStorage.setItem('cofina_agent_username', data.username || username);
      localStorage.setItem('cofina_agent_pin', password);
    }
    return data;
  } catch (err) {
    console.error('Échec authentification agent :', err);
    throw err;
  }
};

export const logoutAgent = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cofina_jwt_token');
    localStorage.removeItem('cofina_agent_username');
    localStorage.removeItem('cofina_agent_pin');
    localStorage.removeItem('cofina_agent_counter');
  }
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

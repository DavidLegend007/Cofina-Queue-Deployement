import { SERVER_URL } from '../config/constants';
import { getAdminAuthHeaders, getAdminToken } from './authApi';

export const fetchBackupList = async () => {
  const headers = await getAdminAuthHeaders();
  const res = await fetch(`${SERVER_URL}/api/backup/list`, { headers });
  if (!res.ok) throw new Error('Impossible de charger la liste des sauvegardes');
  return await res.json();
};

export const createDatabaseBackupAction = async () => {
  const headers = await getAdminAuthHeaders();
  const res = await fetch(`${SERVER_URL}/api/backup/create`, {
    method: 'POST',
    headers
  });
  if (!res.ok) throw new Error('Échec de création de la sauvegarde');
  return await res.json();
};

export const getBackupDownloadUrl = (filename) => {
  const token = getAdminToken();
  return `${SERVER_URL}/api/backup/download/${encodeURIComponent(filename)}?token=${token}`;
};

export const fetchSyncStatus = async () => {
  const res = await fetch(`${SERVER_URL}/api/sync/status`);
  if (!res.ok) throw new Error('Impossible de récupérer l\'état de synchronisation');
  return await res.json();
};

export const triggerCloudSyncAction = async () => {
  const headers = await getAdminAuthHeaders();
  const res = await fetch(`${SERVER_URL}/api/sync/trigger`, {
    method: 'POST',
    headers
  });
  if (!res.ok) throw new Error('Échec du déclenchement de la synchronisation');
  return await res.json();
};

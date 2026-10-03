import { Router } from 'express';
import os from 'os';

function getLocalIpAddress(): string {
  if (process.env.LOCAL_IP) {
    return process.env.LOCAL_IP;
  }

  const interfaces = os.networkInterfaces();
  
  // 1. Chercher en priorité une interface LAN physique 192.168.x.x (Wi-Fi ou Ethernet)
  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('docker') || lowerName.startsWith('br-') || lowerName.startsWith('veth') || lowerName.startsWith('tun')) {
      continue;
    }
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
        return iface.address;
      }
    }
  }

  // 2. Chercher n'importe quelle autre IPv4 privée non-interne (10.x, 172.x)
  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('docker') || lowerName.startsWith('br-') || lowerName.startsWith('veth') || lowerName.startsWith('tun')) {
      continue;
    }
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return '10.228.2.137'; // Fallback par défaut vers l'IP actuelle de l'agence COFINA
}

import { getDynamicTunnelUrl } from '../services/tunnel.service.js';

export function createNetworkRouter(PORT: string | number) {
  const router = Router();

  router.get('/network-info', (_req, res) => {
    const localIp = getLocalIpAddress();
    const publicUrl = getDynamicTunnelUrl();
    // En production comme en Edge local, le serveur Express sert le frontend sur PORT (4000 par défaut)
    const effectivePort = Number(PORT) || 4000;
    const lanUrl = publicUrl || `http://${localIp}:${effectivePort}`;

    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.json({
      localIp,
      port: effectivePort,
      frontendPort: effectivePort,
      lanUrl,
      publicUrl: publicUrl || null,
      isPublic: !!publicUrl
    });
  });

  return router;
}

export { getLocalIpAddress };


import { Router } from 'express';
import os from 'os';

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

export function createNetworkRouter(PORT: string | number) {
  const router = Router();

  router.get('/network-info', (req, res) => {
    const localIp = getLocalIpAddress();
    const publicUrl = process.env.PUBLIC_URL || process.env.VITE_PUBLIC_URL;
    const isProd = process.env.NODE_ENV === 'production';
    const effectivePort = isProd ? PORT : 3000;
    const lanUrl = publicUrl || `http://${localIp}:${effectivePort}`;

    res.json({
      localIp,
      port: PORT,
      frontendPort: effectivePort,
      lanUrl,
      publicUrl: publicUrl || null,
      isPublic: !!publicUrl
    });
  });

  return router;
}

export { getLocalIpAddress };

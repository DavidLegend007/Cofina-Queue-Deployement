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
    res.json({
      localIp,
      port: PORT,
      frontendPort: 3000,
      lanUrl: `http://${localIp}:3000`
    });
  });

  return router;
}

export { getLocalIpAddress };

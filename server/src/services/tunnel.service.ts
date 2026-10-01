import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tunnelProcess: ChildProcess | null = null;
let activePublicUrl: string | null = null;

/**
 * Retourne l'URL publique active du tunnel 4G/5G si disponible,
 * ou l'URL configurée dans l'environnement.
 */
export function getDynamicTunnelUrl(): string | null {
  // 1. URL active en mémoire (détectée en direct via cloudflared)
  if (activePublicUrl) {
    return activePublicUrl;
  }

  // 2. Fichier tunnel_url.txt (créé par le script bash ou Windows)
  const candidateFiles = [
    path.resolve(process.cwd(), 'tunnel_url.txt'),
    path.resolve(process.cwd(), 'server/tunnel_url.txt'),
    path.resolve(__dirname, '../../../tunnel_url.txt'),
    '/tmp/cofina_tunnel_url.txt'
  ];

  for (const filePath of candidateFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8').trim();
        if (content.startsWith('https://') && content.includes('.trycloudflare.com')) {
          activePublicUrl = content;
          return content;
        }
      } catch (_) {}
    }
  }

  // 3. Variable d'environnement personnalisée (uniquement si domaine permanent, pas un trycloudflare éphémère expiré)
  const envUrl = process.env.PUBLIC_URL || process.env.VITE_PUBLIC_URL;
  if (envUrl && envUrl.startsWith('http')) {
    // Si c'est un domaine fixe personnalisé (ex: https://queue.cofina.tg), on l'accepte
    if (!envUrl.includes('trycloudflare.com')) {
      return envUrl;
    }
  }

  return null;
}

/**
 * Démarre le tunnel Cloudflare 4G/5G en arrière-plan et écoute l'URL générée.
 */
export function startTunnelService(port: number | string, io?: Server) {
  if (tunnelProcess) {
    return;
  }

  // Si désactivé explicitement dans .env
  if (process.env.DISABLE_AUTO_TUNNEL === 'true') {
    console.log('[Tunnel 4G/5G] Démarrage automatique désactivé via DISABLE_AUTO_TUNNEL=true.');
    return;
  }

  let binaryPath = 'cloudflared';
  const winRootBin = path.resolve(process.cwd(), 'cloudflared.exe');
  const winServerBin = path.resolve(process.cwd(), 'server/cloudflared.exe');
  const linuxLocalBin = path.resolve(process.cwd(), 'cloudflared');
  const linuxServerBin = path.resolve(process.cwd(), 'server/cloudflared');

  if (process.platform === 'win32') {
    if (fs.existsSync(winRootBin)) {
      binaryPath = winRootBin;
    } else if (fs.existsSync(winServerBin)) {
      binaryPath = winServerBin;
    }
  } else {
    if (fs.existsSync(linuxLocalBin)) {
      binaryPath = linuxLocalBin;
    } else if (fs.existsSync(linuxServerBin)) {
      binaryPath = linuxServerBin;
    } else if (fs.existsSync('/usr/local/bin/cloudflared')) {
      binaryPath = '/usr/local/bin/cloudflared';
    }
  }

  console.log(`[Tunnel 4G/5G] Initialisation de la passerelle mobile avec "${binaryPath}"...`);

  try {
    tunnelProcess = spawn(binaryPath, [
      'tunnel',
      '--url', `http://127.0.0.1:${port}`,
      '--no-autoupdate'
    ]);

    const handleOutput = (chunk: Buffer) => {
      const text = chunk.toString();
      // Recherche du lien trycloudflare.com
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match && match[0]) {
        const foundUrl = match[0];
        if (foundUrl !== activePublicUrl) {
          activePublicUrl = foundUrl;
          console.log(`==================================================================`);
          console.log(`🌐 PASSERELLE PUBLIQUE 4G & 5G ACTIVE POUR COFINA TOGO`);
          console.log(`📱 URL publique sécurisée (HTTPS) : ${foundUrl}`);
          console.log(`✨ Tous les smartphones peuvent scanner en 4G/5G (Togocel / Moov) !`);
          console.log(`==================================================================`);

          // Sauvegarder dans tunnel_url.txt pour partage avec les autres composants
          try {
            fs.writeFileSync(path.resolve(process.cwd(), 'tunnel_url.txt'), foundUrl, 'utf8');
          } catch (_) {}

          // Notifier immédiatement toutes les bornes tactiles connectées
          if (io) {
            io.emit('tunnel_url_updated', {
              publicUrl: foundUrl,
              isPublic: true
            });
          }
        }
      }
    };

    tunnelProcess.stdout?.on('data', handleOutput);
    tunnelProcess.stderr?.on('data', handleOutput);

    tunnelProcess.on('error', (err) => {
      console.warn(`[Tunnel 4G/5G] cloudflared non démarré (${err.message}). Mode Wi-Fi local maintenu.`);
      activePublicUrl = null;
      tunnelProcess = null;
    });

    tunnelProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.warn(`[Tunnel 4G/5G] Processus terminé avec le code ${code}.`);
      }
      activePublicUrl = null;
      tunnelProcess = null;
      try {
        const tPath = path.resolve(process.cwd(), 'tunnel_url.txt');
        if (fs.existsSync(tPath)) fs.unlinkSync(tPath);
      } catch (_) {}
    });

  } catch (err: any) {
    console.warn(`[Tunnel 4G/5G] Erreur lors du lancement du tunnel : ${err.message}`);
  }
}

/**
 * Arrête proprement le tunnel Cloudflare
 */
export function stopTunnelService() {
  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
    } catch (_) {}
    tunnelProcess = null;
    activePublicUrl = null;
  }
}

// ============================================================
// tts.routes.ts — TTS Audio Streaming vers le Navigateur TV
//
// ARCHITECTURE :
//   Serveur Ubuntu → génère WAV via espeak-ng ou espeak (--stdout)
//                  → streame le WAV au navigateur TV (Zeus)
//   Navigateur TV (Zeus) → reçoit le WAV → joue via Web Audio API
//
// Le son sort des haut-parleurs de la TV (pas du serveur).
//
// Installation sur Ubuntu :
//   sudo apt install espeak-ng     ← recommandé (voix de meilleure qualité)
//   sudo apt install espeak        ← alternative si espeak-ng absent
// ============================================================

import { Router, Request, Response } from 'express';
import { spawn, spawnSync } from 'child_process';

// Détecte au démarrage quelle commande TTS est disponible sur le système
function detectTTSCommand(): string | null {
  const candidates = ['espeak-ng', 'espeak'];
  for (const cmd of candidates) {
    const result = spawnSync('which', [cmd], { encoding: 'utf8' });
    if (result.status === 0 && result.stdout.trim()) {
      console.log(`[TTS] ✅ Moteur TTS détecté : ${cmd} (${result.stdout.trim()})`);
      return cmd;
    }
  }
  console.error('[TTS] ❌ Aucun moteur TTS trouvé. Installez : sudo apt install espeak-ng');
  return null;
}

const TTS_CMD = detectTTSCommand();

export function createTTSRouter() {
  const router = Router();

  // GET /api/tts?text=Ticket+D+0+0+1+veuillez+passer+à+la+caisse+2
  //
  // Le serveur génère le WAV et le streame en réponse HTTP.
  // Le navigateur TV reçoit le WAV et le joue via Web Audio API.
  // → Le son sort des HP de la TV.
  router.get('/', (req: Request, res: Response) => {
    const text = String(req.query.text || '').trim().slice(0, 300);
    if (!text) {
      return res.status(400).json({ error: 'Paramètre text manquant' });
    }

    if (!TTS_CMD) {
      console.error('[TTS] Aucun moteur TTS disponible — le navigateur utilisera le fallback');
      return res.status(503).json({
        error: 'TTS indisponible',
        install: 'sudo apt install espeak-ng',
        fallback: true
      });
    }

    // Arguments communs à espeak-ng et espeak :
    // -v fr     : voix française
    // -s 130    : vitesse (mots/min), 130 = agréable pour annonces
    // -a 100    : amplitude/volume (0-200, 100 = défaut)
    // --stdout  : écrire le WAV sur stdout → pipe vers la réponse HTTP
    const args = ['-v', 'fr', '-s', '130', '-a', '100', '--stdout', text];
    const proc = spawn(TTS_CMD, args);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pipe le WAV généré directement dans la réponse HTTP
    proc.stdout.pipe(res);

    let stderrOutput = '';
    proc.stderr.on('data', (d: Buffer) => {
      stderrOutput += d.toString();
    });

    proc.on('error', (e: Error) => {
      console.error(`[TTS] Erreur spawn '${TTS_CMD}':`, e.message);
      if (!res.headersSent) {
        res.status(503).json({ error: `${TTS_CMD} introuvable`, install: 'sudo apt install espeak-ng', fallback: true });
      } else {
        res.end();
      }
    });

    proc.on('close', (code: number) => {
      if (code !== 0) {
        console.error(`[TTS] ${TTS_CMD} code ${code}:`, stderrOutput.trim());
      } else {
        console.log(`[TTS] ✅ WAV streamé vers TV (${TTS_CMD}) :`, text.substring(0, 60));
      }
    });
  });

  return router;
}


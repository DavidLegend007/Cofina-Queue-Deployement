// ============================================================
// tts.routes.ts — TTS Audio Streaming vers le Navigateur TV
//
// ARCHITECTURE :
//   Serveur Ubuntu → génère WAV via espeak-ng --stdout
//                  → streame le WAV au navigateur TV (Zeus)
//   Navigateur TV (Zeus) → reçoit le WAV → joue via Web Audio API
//
// Le son sort des haut-parleurs de la TV (pas du serveur).
// Fonctionne car Web Audio API est déjà actif dans Zeus (le bip marche).
//
// Installation requise sur Ubuntu : sudo apt install espeak-ng
// ============================================================

import { Router, Request, Response } from 'express';
import { spawn } from 'child_process';

export function createTTSRouter() {
  const router = Router();

  // GET /api/tts?text=Ticket+D+0+0+1+veuillez+passer+à+la+caisse+2
  //
  // Le serveur génère le WAV avec espeak-ng et le streame en réponse HTTP.
  // Le navigateur TV reçoit le fichier audio et le joue via Web Audio API.
  // → Le son sort des HP de la TV.
  router.get('/', (req: Request, res: Response) => {
    const text = String(req.query.text || '').trim().slice(0, 300);
    if (!text) {
      return res.status(400).json({ error: 'Paramètre text manquant' });
    }

    // Générer le WAV avec espeak-ng et le streamer directement dans la réponse HTTP
    // -v fr       : voix française
    // -s 130      : vitesse de parole (130 mots/min)
    // -a 200      : amplitude/volume (max = 200)
    // --stdout    : écrire le WAV sur stdout (pas de lecture locale sur le serveur)
    const args = ['-v', 'fr', '-s', '130', '-a', '200', '--stdout', text];
    const proc = spawn('espeak-ng', args);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pipe le WAV généré directement dans la réponse HTTP → navigateur TV joue le son
    proc.stdout.pipe(res);

    let stderrOutput = '';
    proc.stderr.on('data', (d: Buffer) => {
      stderrOutput += d.toString();
    });

    proc.on('error', (e: Error) => {
      console.error('[TTS] espeak-ng introuvable:', e.message);
      console.error('[TTS] → Installez-le : sudo apt install espeak-ng');
      // Renvoyer 503 → le navigateur utilisera Web Speech API en fallback
      if (!res.headersSent) {
        res.status(503).json({ error: 'TTS indisponible — espeak-ng non installé', fallback: true });
      } else {
        res.end();
      }
    });

    proc.on('close', (code: number) => {
      if (code !== 0) {
        console.error('[TTS] espeak-ng code', code, ':', stderrOutput.trim());
      } else {
        console.log('[TTS] ✅ WAV streamé vers la TV pour :', text.substring(0, 70));
      }
    });
  });

  return router;
}


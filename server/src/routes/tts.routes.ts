// ============================================================
// tts.routes.ts — TTS Serveur Windows via PowerShell + SAPI
// Génère un fichier WAV via Microsoft Hortense (voix hors-ligne)
// et le streame directement au client (TV)
// ============================================================

import { Router, Request, Response } from 'express';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export function createTTSRouter() {
  const router = Router();

  // GET /api/tts?text=Ticket+D+0+0+1+veuillez+passer+à+la+caisse+2
  router.get('/', async (req: Request, res: Response) => {
    const text = String(req.query.text || '').trim().slice(0, 300);
    if (!text) {
      return res.status(400).json({ error: 'Paramètre text manquant' });
    }

    const tmpFile = path.join(os.tmpdir(), `cofina_tts_${Date.now()}.wav`);

    // Script PowerShell inline - utilise Microsoft Hortense Desktop (voix hors-ligne française)
    const psScript = `
Add-Type -AssemblyName System.Speech;
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
$frVoice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'fr*' } | Select-Object -First 1;
if ($frVoice) { $synth.SelectVoice($frVoice.VoiceInfo.Name); }
$synth.Rate = -1;
$synth.Volume = 100;
$synth.SetOutputToWaveFile('${tmpFile.replace(/\\/g, '\\\\')}');
$synth.Speak('${text.replace(/'/g, "''")}');
$synth.Dispose();
Write-Host 'TTS_OK';
`.trim();

    const ps = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', psScript]);

    let psErr = '';
    ps.stderr.on('data', (d: Buffer) => { psErr += d.toString(); });

    ps.on('close', (code: number) => {
      if (code !== 0 || !fs.existsSync(tmpFile)) {
        console.error('[TTS] Erreur PowerShell:', psErr);
        return res.status(500).json({ error: 'Génération TTS échouée', detail: psErr });
      }

      // Streamer le WAV directement
      const stat = fs.statSync(tmpFile);
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Access-Control-Allow-Origin', '*');

      const stream = fs.createReadStream(tmpFile);
      stream.pipe(res);
      stream.on('end', () => {
        try { fs.unlinkSync(tmpFile); } catch (_) {}
      });
      stream.on('error', () => {
        try { fs.unlinkSync(tmpFile); } catch (_) {}
        res.status(500).end();
      });
    });
  });

  return router;
}

// ============================================================
// tts.routes.ts — TTS Audio Streaming vers le Navigateur TV (COFINA Togo)
//
// ARCHITECTURE EN CASCADE HAUTE DISPONIBILITÉ (ZÉRO INTERRUPTION) :
//   1. Piper TTS (Priorité N°1) :
//      - Voix IA neuronale 100% hors-ligne
//      - Modèle féminin Siwis HD (fr_FR-siwis-medium.onnx)
//      - Timbre chaleureux, posé et professionnel de qualité hôtesse d'accueil
//
//   2. MBROLA fr4 (Priorité N°2 - Fallback Studio) :
//      - Vraie voix humaine féminine diphone
//      - Activée si : sudo apt install mbrola mbrola-fr4
//
//   3. eSpeak-ng fr+f3 (Priorité N°3 - Fallback Robuste Garanti) :
//      - Voix native fr+f3 adoucie et ralentie
//      - Fonctionne sur n'importe quel CPU Linux
//
//   4. Web Speech API (Priorité N°4 - Fallback Navigateur TV) :
//      - Si aucun moteur serveur n'est actif, le serveur renvoie HTTP 503
//      - La TV active immédiatement window.speechSynthesis sans coupure
// ============================================================

import { Router, Request, Response } from 'express';
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ─── 1. Interface & Détection de Piper TTS ──────────────────────────────────
interface PiperConfig {
  available: boolean;
  binPath: string;
  frModelPath: string | null;
  enModelPath: string | null;
}

function detectPiper(): PiperConfig {
  let binPath = process.env.PIPER_BIN || '';
  if (!binPath) {
    const which = spawnSync('which', ['piper'], { encoding: 'utf8' });
    if (which.status === 0 && which.stdout.trim()) {
      binPath = which.stdout.trim();
    } else {
      const candidates = [
        '/usr/local/bin/piper',
        '/usr/bin/piper',
        '/opt/piper/piper',
        path.join(process.cwd(), 'piper/piper'),
        path.join(process.cwd(), 'bin/piper')
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          binPath = p;
          break;
        }
      }
    }
  }

  const frCandidates = [
    process.env.PIPER_MODEL_FR,
    '/opt/piper-voices/fr_FR-siwis-medium.onnx',
    '/opt/piper-voices/fr_FR-upmc-medium.onnx',
    '/usr/share/piper-voices/fr_FR-siwis-medium.onnx',
    path.join(process.cwd(), 'piper-voices/fr_FR-siwis-medium.onnx'),
    path.join(process.cwd(), 'server/piper-voices/fr_FR-siwis-medium.onnx')
  ].filter(Boolean) as string[];

  const enCandidates = [
    process.env.PIPER_MODEL_EN,
    '/opt/piper-voices/en_US-lessac-medium.onnx',
    '/opt/piper-voices/en_US-amy-medium.onnx',
    '/usr/share/piper-voices/en_US-lessac-medium.onnx',
    path.join(process.cwd(), 'piper-voices/en_US-lessac-medium.onnx'),
    path.join(process.cwd(), 'server/piper-voices/en_US-lessac-medium.onnx')
  ].filter(Boolean) as string[];

  let frModelPath: string | null = null;
  for (const f of frCandidates) {
    if (fs.existsSync(f)) {
      frModelPath = f;
      break;
    }
  }

  let enModelPath: string | null = null;
  for (const e of enCandidates) {
    if (fs.existsSync(e)) {
      enModelPath = e;
      break;
    }
  }

  const available = Boolean(binPath && (frModelPath || enModelPath));
  if (available) {
    console.log('[TTS] 🌟 Moteur Vocal IA Piper TTS détecté et opérationnel :');
    console.log(`      • Binaire : ${binPath}`);
    if (frModelPath) console.log(`      • Voix Française HD : ${frModelPath} (Siwis)`);
    if (enModelPath) console.log(`      • Voix Anglaise HD  : ${enModelPath}`);
  }

  return { available, binPath, frModelPath, enModelPath };
}

// ─── 2. Interface & Détection d'eSpeak / MBROLA ──────────────────────────────
interface EspeakConfig {
  available: boolean;
  cmd: string;
  hasMbrolaFr4: boolean;
}

function detectEspeak(): EspeakConfig {
  const candidates = ['espeak-ng', 'espeak'];
  let cmd = '';
  for (const c of candidates) {
    const result = spawnSync('which', [c], { encoding: 'utf8' });
    if (result.status === 0 && result.stdout.trim()) {
      cmd = result.stdout.trim();
      break;
    }
  }

  if (!cmd) {
    return { available: false, cmd: '', hasMbrolaFr4: false };
  }

  let hasMbrolaFr4 = false;
  try {
    const test = spawnSync(cmd, ['-v', 'mb-fr4', '--stdout', 'test'], { encoding: 'utf8', timeout: 2000 });
    if (test.status === 0 && !test.stderr.toLowerCase().includes('failed') && !test.stderr.toLowerCase().includes('error')) {
      hasMbrolaFr4 = true;
    }
  } catch (_) {}

  console.log(`[TTS] ✅ Moteur vocal de secours eSpeak détecté : ${cmd} (MBROLA fr4 : ${hasMbrolaFr4 ? 'OUI' : 'NON'})`);
  return { available: true, cmd, hasMbrolaFr4 };
}

// Détection au démarrage du serveur
const PIPER = detectPiper();
const ESPEAK = detectEspeak();

if (!PIPER.available && !ESPEAK.available) {
  console.warn('[TTS] ⚠️ Aucun moteur TTS serveur détecté. Le navigateur TV utilisera la synthèse vocale locale.');
}

// ─── 3. Fonction d'exécution Piper TTS ──────────────────────────────────────
function streamPiperTTS(
  bin: string,
  model: string,
  text: string,
  res: Response,
  onFailover: () => void
) {
  const args = ['--model', model, '--output_file', '-'];
  const jsonConfig = model + '.json';
  if (fs.existsSync(jsonConfig)) {
    args.push('--config', jsonConfig);
  }

  const proc = spawn(bin, args);

  res.setHeader('Content-Type', 'audio/wav');
  res.setHeader('Cache-Control', 'no-store, no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let hasSentData = false;
  let stderrOutput = '';

  proc.stdout.on('data', (chunk: Buffer) => {
    hasSentData = true;
    res.write(chunk);
  });

  proc.stderr.on('data', (d: Buffer) => {
    stderrOutput += d.toString();
  });

  proc.on('error', (err: Error) => {
    console.error('[TTS] Erreur lors de l\'exécution de Piper:', err.message);
    if (!hasSentData && !res.headersSent) {
      console.warn('[TTS] 🔄 Bascule automatique vers eSpeak...');
      onFailover();
    } else {
      res.end();
    }
  });

  proc.on('close', (code: number) => {
    if (code !== 0) {
      console.warn(`[TTS] Piper a retourné le code ${code}:`, stderrOutput.trim());
      if (!hasSentData && !res.headersSent) {
        console.warn('[TTS] 🔄 Bascule automatique vers eSpeak...');
        onFailover();
        return;
      }
    }
    res.end();
  });

  // Injection du texte dans stdin
  proc.stdin.write(text + '\n');
  proc.stdin.end();
}

// ─── 4. Fonction d'exécution eSpeak TTS ──────────────────────────────────────
function streamEspeakTTS(
  cmd: string,
  voice: string,
  speed: string,
  pitch: string,
  text: string,
  res: Response
) {
  const args = ['-v', voice, '-s', speed, '-p', pitch, '-g', '2', '-a', '105', '--stdout', text];
  const proc = spawn(cmd, args);

  if (!res.headersSent) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  proc.stdout.pipe(res);

  let stderrOutput = '';
  proc.stderr.on('data', (d: Buffer) => {
    stderrOutput += d.toString();
  });

  proc.on('error', (e: Error) => {
    console.error(`[TTS] Erreur spawn eSpeak '${cmd}':`, e.message);
    if (!res.headersSent) {
      res.status(503).json({ error: 'TTS indisponible', fallback: true });
    } else {
      res.end();
    }
  });

  proc.on('close', (code: number) => {
    if (code !== 0) {
      console.error(`[TTS] eSpeak code ${code}:`, stderrOutput.trim());
    } else {
      console.log(`[TTS] ✅ WAV eSpeak streamé avec succès :`, text.substring(0, 50));
    }
  });
}

// ─── 5. Routeur Express ─────────────────────────────────────────────────────
export function createTTSRouter() {
  const router = Router();

  // GET /api/tts/info — Diagnostic et état des moteurs vocaux
  router.get('/info', (_req: Request, res: Response) => {
    const currentEngine = PIPER.available
      ? 'piper-neural'
      : ESPEAK.hasMbrolaFr4
        ? 'espeak-mbrola'
        : ESPEAK.available
          ? 'espeak-native'
          : 'browser-web-speech';

    res.json({
      status: 'ok',
      activeEngine: currentEngine,
      piper: {
        available: PIPER.available,
        binaryPath: PIPER.binPath || null,
        frModel: PIPER.frModelPath || null,
        enModel: PIPER.enModelPath || null
      },
      espeak: {
        available: ESPEAK.available,
        command: ESPEAK.cmd || null,
        mbrolaFr4: ESPEAK.hasMbrolaFr4
      }
    });
  });

  // GET /api/tts?text=...&lang=...&voice=...&speed=...&pitch=...
  //
  // Le serveur génère le flux audio WAV et le streame en direct.
  // La télévision reçoit le WAV et le joue via Web Audio API.
  router.get('/', (req: Request, res: Response) => {
    const text = String(req.query.text || '').trim().slice(0, 400);
    if (!text) {
      return res.status(400).json({ error: 'Paramètre text manquant' });
    }

    const lang = String(req.query.lang || 'fr').toLowerCase().trim();
    const isEn = lang === 'en';

    // Définition de la routine eSpeak de fallback
    const runEspeakFallback = () => {
      if (!ESPEAK.available) {
        return res.status(503).json({
          error: 'Aucun moteur TTS serveur disponible',
          install: 'sudo apt install piper || sudo apt install espeak-ng mbrola mbrola-fr4',
          fallback: true
        });
      }

      let voice = String(req.query.voice || '').trim();
      if (!voice) {
        if (isEn) {
          voice = 'en+f3';
        } else {
          voice = ESPEAK.hasMbrolaFr4 ? 'mb-fr4' : 'fr+f3';
        }
      }

      const speed = String(req.query.speed || (isEn ? '125' : '115')).trim();
      const pitch = String(req.query.pitch || (isEn ? '55' : '58')).trim();

      streamEspeakTTS(ESPEAK.cmd, voice, speed, pitch, text, res);
    };

    // ── 1. TENTATIVE PRIORITAIRE : PIPER TTS (Voix Neuronale HD) ────────────
    const piperModel = isEn 
      ? (PIPER.enModelPath || PIPER.frModelPath)
      : (PIPER.frModelPath || PIPER.enModelPath);

    if (PIPER.available && piperModel) {
      try {
        streamPiperTTS(PIPER.binPath, piperModel, text, res, () => {
          // Si Piper échoue avant d'envoyer les headers, bascule transparente sur eSpeak
          runEspeakFallback();
        });
        return;
      } catch (err) {
        console.error('[TTS] Échec lancement Piper TTS:', err);
      }
    }

    // ── 2. FALLBACK : ESPEAK / MBROLA ──────────────────────────────────────
    runEspeakFallback();
  });

  return router;
}

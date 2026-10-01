// ============================================================
// tts.routes.ts — TTS Audio Streaming vers le Navigateur TV
//
// ARCHITECTURE :
//   Serveur Ubuntu → génère WAV via espeak-ng (--stdout)
//                  → voix féminine douce, lente et soignée
//                  → streame le WAV au navigateur TV (Zeus)
//   Navigateur TV (Zeus) → reçoit le WAV → joue via Web Audio API
//
// Le son sort des haut-parleurs de la TV (pas du serveur).
//
// OPTIONS VOCALES :
//   - Native espeak-ng : fr+f3 (féminine douce, lente, posée)
//   - Studio MBROLA : mb-fr4 (si sudo apt install mbrola mbrola-fr4)
// ============================================================
import { Router } from 'express';
import { spawn, spawnSync } from 'child_process';
// Détecte au démarrage quelle commande TTS est disponible sur le système
function detectTTSCommand() {
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
// Détecte la voix la plus belle disponible :
// 1. MBROLA mb-fr4 si installée (vraie voix humaine féminine studio)
// 2. espeak-ng fr+f3 (voix féminine native douce et posée)
function detectDefaultVoice(cmd) {
    if (!cmd)
        return 'fr+f3';
    try {
        const test = spawnSync(cmd, ['-v', 'mb-fr4', '--stdout', 'test'], { encoding: 'utf8', timeout: 2000 });
        if (test.status === 0 && !test.stderr.toLowerCase().includes('failed') && !test.stderr.toLowerCase().includes('error')) {
            console.log('[TTS] 💎 Voix féminine studio MBROLA fr4 détectée et activée !');
            return 'mb-fr4';
        }
    }
    catch (_) { }
    console.log('[TTS] 🌸 Voix féminine douce native (fr+f3) sélectionnée par défaut');
    return 'fr+f3';
}
const TTS_CMD = detectTTSCommand();
const DEFAULT_VOICE = detectDefaultVoice(TTS_CMD);
export function createTTSRouter() {
    const router = Router();
    // GET /api/tts?text=...&voice=...&speed=...&pitch=...
    //
    // Le serveur génère le WAV et le streame en réponse HTTP.
    // Le navigateur TV reçoit le WAV et le joue via Web Audio API.
    router.get('/', (req, res) => {
        const text = String(req.query.text || '').trim().slice(0, 300);
        if (!text) {
            return res.status(400).json({ error: 'Paramètre text manquant' });
        }
        if (!TTS_CMD) {
            console.error('[TTS] Aucun moteur TTS disponible — le navigateur utilisera le fallback');
            return res.status(503).json({
                error: 'TTS indisponible',
                install: 'sudo apt install espeak-ng mbrola mbrola-fr4',
                fallback: true
            });
        }
        // Paramètres voix :
        // - voice : fr+f3 (féminine douce) ou mb-fr4 (studio), surchargeable par query
        // - speed : 115 mots/min (bien lent, clair et posé pour le hall bancaire)
        // - pitch : 58 (hauteur de ton féminine chaleureuse)
        // - gap   : 2 (micro-pause entre chaque mot pour aérer la phrase)
        const voice = String(req.query.voice || DEFAULT_VOICE).trim();
        const speed = String(req.query.speed || '115').trim();
        const pitch = String(req.query.pitch || '58').trim();
        const args = ['-v', voice, '-s', speed, '-p', pitch, '-g', '2', '-a', '105', '--stdout', text];
        const proc = spawn(TTS_CMD, args);
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Cache-Control', 'no-store, no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Pipe le WAV généré directement dans la réponse HTTP
        proc.stdout.pipe(res);
        let stderrOutput = '';
        proc.stderr.on('data', (d) => {
            stderrOutput += d.toString();
        });
        proc.on('error', (e) => {
            console.error(`[TTS] Erreur spawn '${TTS_CMD}':`, e.message);
            if (!res.headersSent) {
                res.status(503).json({ error: `${TTS_CMD} introuvable`, install: 'sudo apt install espeak-ng', fallback: true });
            }
            else {
                res.end();
            }
        });
        proc.on('close', (code) => {
            if (code !== 0) {
                console.error(`[TTS] ${TTS_CMD} code ${code}:`, stderrOutput.trim());
            }
            else {
                console.log(`[TTS] ✅ WAV voix [${voice}, s=${speed}, p=${pitch}] streamé vers TV :`, text.substring(0, 60));
            }
        });
    });
    return router;
}

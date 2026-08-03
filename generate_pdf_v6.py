import base64
import os
import subprocess

logo_path = r"d:\Cofina\COFINA.png"
borne32_path = r"d:\Cofina\public\Borne 32 pouces.jpg"
borne55_path = r"d:\Cofina\public\Borne 55 pouces.jpg"

def get_base64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    return ""

logo_base64 = get_base64(logo_path)
borne32_base64 = get_base64(borne32_path)
borne55_base64 = get_base64(borne55_path)

html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Budget Projet - Système de Gestion de File d'Attente - COFINA</title>
<style>
  @page {{
    size: A4;
    margin: 12mm 15mm 12mm 15mm;
    @bottom-right {{
      content: counter(page);
    }}
  }}
  
  body {{
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #2c3e50;
    line-height: 1.42;
    margin: 0;
    padding: 0;
    font-size: 10pt;
    background-color: #ffffff;
  }}

  .header-container {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2.5px solid #8B0000;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }}

  .logo-img {{
    max-height: 48px;
  }}

  .header-title {{
    text-align: right;
  }}

  .header-title h1 {{
    margin: 0;
    font-size: 15pt;
    color: #8B0000;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  .header-title p {{
    margin: 2px 0 0 0;
    font-size: 9pt;
    color: #555;
    font-weight: 600;
  }}

  .confidential-box {{
    background-color: #fdf3f3;
    border-left: 4px solid #8B0000;
    padding: 8px 12px;
    margin-bottom: 14px;
    border-radius: 0 4px 4px 0;
    font-size: 9pt;
  }}

  .confidential-box p {{
    margin: 2px 0;
    color: #444;
  }}

  h2 {{
    color: #8B0000;
    font-size: 12pt;
    border-bottom: 1.5px solid #eee;
    padding-bottom: 3px;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }}

  .page-break {{
    page-break-before: always;
  }}

  h3 {{
    color: #2c3e50;
    font-size: 10pt;
    margin-top: 10px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }}

  ul {{
    margin: 4px 0 10px 18px;
    padding: 0;
  }}

  li {{
    margin-bottom: 3px;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    margin-bottom: 10px;
    font-size: 9pt;
    page-break-inside: avoid;
  }}

  th, td {{
    border: 1px solid #dcdcdc;
    padding: 5.5px 8px;
    text-align: left;
  }}

  th {{
    background-color: #8B0000;
    color: #ffffff;
    font-weight: 600;
    font-size: 9pt;
  }}

  tr:nth-child(even) {{
    background-color: #fcfcfc;
  }}

  .text-right {{
    text-align: right;
  }}

  .text-center {{
    text-align: center;
  }}

  .total-row {{
    font-weight: bold;
    background-color: #f9ebeb !important;
    color: #8B0000;
  }}

  .badge-highlight {{
    background-color: #8B0000;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;
    font-size: 8.5pt;
    display: inline-block;
  }}

  .model-tag {{
    background-color: #e2e8f0;
    color: #1e293b;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-weight: bold;
    font-size: 8.5pt;
  }}

  .borne-preview-img {{
    max-height: 140px;
    max-width: 100%;
    object-fit: contain;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    padding: 3px;
    background: #fff;
  }}

  .key-commitments {{
    display: flex;
    gap: 10px;
    margin-top: 10px;
    margin-bottom: 12px;
  }}

  .commitment-card {{
    flex: 1;
    background: #fdf6f6;
    border: 1px solid #e2c0c0;
    border-radius: 5px;
    padding: 8px;
    text-align: center;
  }}

  .commitment-card .val {{
    font-size: 12pt;
    font-weight: bold;
    color: #8B0000;
    margin-bottom: 2px;
  }}

  .commitment-card .lbl {{
    font-size: 8pt;
    color: #555;
    font-weight: 600;
  }}

  .doc-box {{
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-left: 3.5px solid #2c3e50;
    padding: 8px 12px;
    margin-top: 8px;
    border-radius: 3px;
    font-size: 9pt;
  }}

  .doc-box h4 {{
    margin: 0 0 4px 0;
    color: #2c3e50;
    font-size: 9.5pt;
  }}

  .note {{
    font-size: 8.5pt;
    color: #666;
    font-style: italic;
    margin-top: 4px;
  }}
</style>
</head>
<body>

  <!-- PAGE 1 : Présentation & Volet Logiciel -->
  <div class="header-container">
    <div>
      {"<img src='data:image/png;base64," + logo_base64 + "' class='logo-img' alt='COFINA Logo' />" if logo_base64 else "<h2>COFINA</h2>"}
    </div>
    <div class="header-title">
      <h1>Budget Projet</h1>
      <p>Système de Gestion de File d'Attente (SGFA)</p>
    </div>
  </div>

  <div class="confidential-box">
    <p><strong>Document confidentiel</strong> — À destination du Président Directeur Général</p>
    <p><strong>Périmètre</strong> : Déploiement sur 4 agences (avec 1 agence pilote)</p>
    <p><strong>Date</strong> : Juillet 2026</p>
  </div>

  <h2>Présentation du Projet et de la Solution</h2>

  <h3>1. La Problématique</h3>
  <p>Au sein des agences de microfinance, la gestion des flux de clients constitue un défi opérationnel majeur :</p>
  <ul>
    <li><strong>Temps d'attente imprévisibles et prolongés</strong> provoquant une insatisfaction client.</li>
    <li><strong>Confusion aux guichets</strong> et manque d'organisation lors des heures de pointe.</li>
    <li><strong>Absence de données exploitables</strong> pour la direction quant au temps de traitement moyen et à la productivité des guichetiers.</li>
  </ul>

  <h3>2. La Solution Proposée : Système de Gestion de File d'Attente (SGFA)</h3>
  <p>Le projet vise à déployer une solution logicielle et matérielle moderne et automatisée permettant de :</p>
  <ul>
    <li><strong>Digitaliser l'accueil</strong> dès l'entrée en agence via une borne interactive tactile délivrant des tickets avec QR Code.</li>
    <li><strong>Fluidifier le parcours client</strong> grâce à un affichage dynamique sur écran 32'' synchronisé avec un rappel sonore (haut-parleur).</li>
    <li><strong>Optimiser le pilotage</strong> grâce à une plateforme logicielle centrale offrant des tableaux de bord en temps réel pour la direction et les chefs d'agence.</li>
  </ul>

  <h2>I. Conception et Réalisation du Logiciel</h2>
  <p>La conception du logiciel couvre l'intégralité du cycle de vie de la plateforme pour l'ensemble des 4 agences. La solution est livrée <strong>clé en main</strong> pour un montant total fixe de <strong>6 000 000 FCFA</strong>.</p>

  <h3>Tableau de synthèse du volet logiciel</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 24%;">Prestation / Module</th>
        <th style="width: 56%;">Description du Périmètre d'Intervention</th>
        <th style="width: 20%;" class="text-right">Coût (FCFA)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Développement du Logiciel</strong></td>
        <td>- Moteur de gestion des files d'attente et algorithmes de priorité<br>- Interface guichetier (appel, transfert, mise en attente)<br>- Interface borne tactile (choix du service, impression ticket QR)<br>- Module d'affichage dynamique pour écran TV 32''<br>- Tableau de bord d'administration et rapports statistiques pour la Direction</td>
        <td class="text-right">Inclus dans le forfait</td>
      </tr>
      <tr>
        <td><strong>Déploiement & Installation</strong></td>
        <td>- Configuration du serveur local (mini-PC) sur l'agence pilote puis réplication sur les 3 autres agences<br>- Intégration des périphériques (bornes, écrans, imprimantes, audio)<br>- <span class="badge-highlight">Déploiement sous 72h max (du 5 au 8 août 2026)</span></td>
        <td class="text-right">Inclus dans le forfait</td>
      </tr>
      <tr>
        <td><strong>Support & Assistance (12 Mois)</strong></td>
        <td>- <strong>Assistance technique & hotline garantie sur 12 mois</strong><br>- Assistance au démarrage et accompagnement quotidien des utilisateurs</td>
        <td class="text-right">Inclus dans le forfait</td>
      </tr>
      <tr>
        <td><strong>Maintenance</strong></td>
        <td>- Maintenance préventive et corrective du logiciel<br>- Mises à jour de sécurité et correctifs logiciels</td>
        <td class="text-right">Inclus dans le forfait</td>
      </tr>
      <tr>
        <td><strong>Formation & Transfert</strong></td>
        <td>- <span class="badge-highlight">48 heures de formation par agence</span> pour guichetiers & chefs d'agence<br>- Transfert de compétences à l'équipe informatique interne</td>
        <td class="text-right">Inclus dans le forfait</td>
      </tr>
      <tr>
        <td><strong>Documentation & Guides</strong></td>
        <td>- <strong>Guide de résolution de problèmes (Troubleshooting)</strong><br>- Manuels utilisateurs guichetier & fiches réflexes d'administration IT</td>
        <td class="text-right">Inclus dans le forfait</td>
      </tr>
      <tr class="total-row">
        <td><strong>TOTAL LOGICIEL (4 AGENCES)</strong></td>
        <td><strong>Livrable logiciel complet, opérationnel et sous assistance 12 mois</strong></td>
        <td class="text-right"><strong>6 000 000 FCFA</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- PAGE 2 : Matériels d'installation -->
  <h2 class="page-break">II. Les Matériels pour l'Installation et la Mise en Place du Projet</h2>
  <p>Pour assurer le fonctionnement local de la solution dans chaque agence, un kit matériel (hors borne) a été chiffré sur la base des devis réels fournis par le service achats.</p>

  <h3>Kit Matériel d'Installation par Agence (Devis Fournisseurs)</h3>
  <table>
    <thead>
      <tr>
        <th>Article</th>
        <th>Description & Utilisation</th>
        <th class="text-center" style="width: 8%;">Qté</th>
        <th class="text-right" style="width: 18%;">Coût Unitaire</th>
        <th class="text-right" style="width: 18%;">Sous-Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Écran (32’’)</strong></td>
        <td>Support d'affichage dynamique des numéros appelés</td>
        <td class="text-center">1</td>
        <td class="text-right">65 000 FCFA</td>
        <td class="text-right">65 000 FCFA</td>
      </tr>
      <tr>
        <td><strong>Serveur local (mini-PC)</strong></td>
        <td>Serveur d'agence hébergeant le contrôleur de file d'attente</td>
        <td class="text-center">1</td>
        <td class="text-right">250 000 FCFA</td>
        <td class="text-right">250 000 FCFA</td>
      </tr>
      <tr>
        <td><strong>Imprimante (ticket QR)</strong></td>
        <td>Impression thermique des tickets avec QR Code</td>
        <td class="text-center">1</td>
        <td class="text-right">50 000 FCFA</td>
        <td class="text-right">50 000 FCFA</td>
      </tr>
      <tr>
        <td><strong>Switch réseau (16 ports)</strong></td>
        <td>Interconnexion locale des équipements</td>
        <td class="text-center">1</td>
        <td class="text-right">35 000 FCFA</td>
        <td class="text-right">35 000 FCFA</td>
      </tr>
      <tr>
        <td><strong>Câble RJ45 (rouleau)</strong></td>
        <td>Câblage réseau structuré</td>
        <td class="text-center">1</td>
        <td class="text-right">45 000 FCFA</td>
        <td class="text-right">45 000 FCFA</td>
      </tr>
      <tr>
        <td><strong>Câble HDMI (100 m)</strong></td>
        <td>Liaison vidéo haute définition pour l'écran 32''</td>
        <td class="text-center">1</td>
        <td class="text-right">100 000 FCFA</td>
        <td class="text-right">100 000 FCFA</td>
      </tr>
      <tr>
        <td><strong>Haut-parleur</strong></td>
        <td>Diffusion sonore de l'appel des numéros en agence</td>
        <td class="text-center">1</td>
        <td class="text-right">100 000 FCFA</td>
        <td class="text-right">100 000 FCFA</td>
      </tr>
      <tr class="total-row">
        <td colspan="4"><strong>SOUS-TOTAL AUTRES ÉQUIPEMENTS (PAR AGENCE)</strong></td>
        <td class="text-right"><strong>645 000 FCFA</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- PAGE 3 : Bornes Interactives -->
  <h2 class="page-break">III. Les Bornes Interactives et Chiffrage Matériel</h2>
  <p>Le matériel de borne interactive constitue le point de contact physique initial avec le client. Deux formats de bornes à intégration tactile (32 pouces et 55 pouces) sont mis à disposition pour le déploiement.</p>

  <h3>1. Spécifications Techniques et Modèles Disponibles</h3>
  <table>
    <thead>
      <tr>
        <th>Format & Taille</th>
        <th>Type / Configuration</th>
        <th class="text-center" style="width: 20%;">Modèle Constructeur</th>
        <th>Caractéristiques Principales</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td rowspan="2"><strong>Borne 32 pouces</strong><br><em>(Intégrateur tactile)</em></td>
        <td><strong>Version Android</strong></td>
        <td class="text-center"><span class="model-tag">RS321-WC</span></td>
        <td>Écran tactile 32", contrôleur compact Android, finition noire standard</td>
      </tr>
      <tr>
        <td><strong>Version Standard PC</strong></td>
        <td class="text-center"><span class="model-tag">RS322-WC</span></td>
        <td>Écran tactile 32", contrôleur architecture PC x86, finition noire standard</td>
      </tr>
      <tr>
        <td rowspan="2"><strong>Borne 55 pouces</strong><br><em>(Intégrateur tactile)</em></td>
        <td><strong>Version Android</strong></td>
        <td class="text-center"><span class="model-tag">RS551-WC</span></td>
        <td>Écran grand format 55", contrôleur Android, finition blanche personnalisée Logo COFINA</td>
      </tr>
      <tr>
        <td><strong>Modèle Standard PC</strong></td>
        <td class="text-center"><span class="model-tag">RS552-WC</span></td>
        <td>Écran grand format 55", contrôleur PC x86, finition blanche personnalisée Logo COFINA</td>
      </tr>
    </tbody>
  </table>

  <h3>2. Visuels des Modèles de Bornes</h3>
  <table>
    <thead>
      <tr>
        <th class="text-center" style="width: 50%;">Borne 55 pouces (<span class="model-tag">RS551-WC</span> / <span class="model-tag">RS552-WC</span>)</th>
        <th class="text-center" style="width: 50%;">Borne 32 pouces (<span class="model-tag">RS321-WC</span> / <span class="model-tag">RS322-WC</span>)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center" style="padding: 8px;">
          {"<img src='data:image/jpeg;base64," + borne55_base64 + "' class='borne-preview-img' alt='Borne 55 pouces' />" if borne55_base64 else ""}
          <br><strong>Borne 55" Grand Format</strong><br><small style="color:#555;">Finition blanche & personnalisation Logo COFINA</small>
        </td>
        <td class="text-center" style="padding: 8px;">
          {"<img src='data:image/jpeg;base64," + borne32_base64 + "' class='borne-preview-img' alt='Borne 32 pouces' />" if borne32_base64 else ""}
          <br><strong>Borne 32" Format Compact</strong><br><small style="color:#555;">Finition noire standard</small>
        </td>
      </tr>
    </tbody>
  </table>

  <h3>3. Tarification des Bornes Interactives</h3>
  <table>
    <thead>
      <tr>
        <th>Modèle & Format</th>
        <th class="text-center" style="width: 25%;">Modèle Constructeur</th>
        <th>Finition</th>
        <th class="text-right" style="width: 25%;">Prix Unitaire HT</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Borne 55 pouces</strong> (Grand format)</td>
        <td class="text-center"><span class="model-tag">RS551-WC</span> / <span class="model-tag">RS552-WC</span></td>
        <td>Blanche avec personnalisation Logo institutionnel</td>
        <td class="text-right"><strong>1 386 000 FCFA</strong></td>
      </tr>
      <tr>
        <td><strong>Borne 32 pouces</strong> (Format compact)</td>
        <td class="text-center"><span class="model-tag">RS321-WC</span> / <span class="model-tag">RS322-WC</span></td>
        <td>Noire standard</td>
        <td class="text-right"><strong>766 000 FCFA</strong></td>
      </tr>
    </tbody>
  </table>

  <h3>4. Total Matériel Complété par Agence</h3>
  <table>
    <thead>
      <tr>
        <th>Composition du Matériel</th>
        <th class="text-right" style="width: 30%;">Configuration Borne 55''</th>
        <th class="text-right" style="width: 30%;">Configuration Borne 32''</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Équipements d'installation de base (Écran 32", Serveur, Imprimante, Switch, Câblage, HP)</td>
        <td class="text-right">645 000 FCFA</td>
        <td class="text-right">645 000 FCFA</td>
      </tr>
      <tr>
        <td>Coût de la Borne Interactive</td>
        <td class="text-right">1 386 000 FCFA</td>
        <td class="text-right">766 000 FCFA</td>
      </tr>
      <tr class="total-row">
        <td><strong>TOTAL MATÉRIEL POUR 1 AGENCE</strong></td>
        <td class="text-right"><strong>2 031 000 FCFA</strong></td>
        <td class="text-right"><strong>1 411 000 FCFA</strong></td>
      </tr>
    </tbody>
  </table>

  <h3>5. Dépenses Matériel Cumulées — Total pour les 4 Agences</h3>
  <table>
    <thead>
      <tr>
        <th>Déploiement Matériel (4 Agences)</th>
        <th class="text-center" style="width: 25%;">Calcul</th>
        <th class="text-right" style="width: 30%;">Montant Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Configuration Borne 55 pouces</strong> (RS551-WC / RS552-WC)</td>
        <td class="text-center">2 031 000 FCFA × 4</td>
        <td class="text-right"><strong>8 124 000 FCFA</strong></td>
      </tr>
      <tr>
        <td><strong>Configuration Borne 32 pouces</strong> (RS321-WC / RS322-WC)</td>
        <td class="text-center">1 411 000 FCFA × 4</td>
        <td class="text-right"><strong>5 644 000 FCFA</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- PAGE 4 : Récapitulatif Global & Calendrier / Support -->
  <h2 class="page-break">IV. Récapitulatif du Budget Global du Projet</h2>

  <div style="display: flex; gap: 15px;">
    <div style="flex: 1;">
      <h3>Configuration Borne 55 pouces</h3>
      <table>
        <thead>
          <tr>
            <th>Poste de Dépense</th>
            <th class="text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dépenses Matériel (4 agences)</td>
            <td class="text-right">8 124 000 FCFA</td>
          </tr>
          <tr>
            <td>Logiciel (4 agences)</td>
            <td class="text-right">6 000 000 FCFA</td>
          </tr>
          <tr class="total-row">
            <td><strong>TOTAL GLOBAL (BORNE 55'')</strong></td>
            <td class="text-right"><strong>14 124 000 FCFA</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="flex: 1;">
      <h3>Configuration Borne 32 pouces</h3>
      <table>
        <thead>
          <tr>
            <th>Poste de Dépense</th>
            <th class="text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dépenses Matériel (4 agences)</td>
            <td class="text-right">5 644 000 FCFA</td>
          </tr>
          <tr>
            <td>Logiciel (4 agences)</td>
            <td class="text-right">6 000 000 FCFA</td>
          </tr>
          <tr class="total-row">
            <td><strong>TOTAL GLOBAL (BORNE 32'')</strong></td>
            <td class="text-right"><strong>11 644 000 FCFA</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <p class="note">* Note : Montants calculés Hors Taxes (HT). Sont exclus les coûts récurrents généraux (électricité, abonnements internet des agences).</p>

  <h2>V. Calendrier d'Exécution, Accompagnement & Support</h2>

  <div class="key-commitments">
    <div class="commitment-card">
      <div class="val">5 Août 2026</div>
      <div class="lbl">Présentation Officielle</div>
    </div>
    <div class="commitment-card">
      <div class="val">72 Horloge (8 Août)</div>
      <div class="lbl">Déploiement Pilote Max</div>
    </div>
    <div class="commitment-card">
      <div class="val">48h / Agence</div>
      <div class="lbl">Formation & Transfert</div>
    </div>
    <div class="commitment-card">
      <div class="val">12 Mois</div>
      <div class="lbl">Support & Assistance</div>
    </div>
  </div>

  <h3>1. Planning Réactif & Déploiement Accéléré</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Jalon / Étape</th>
        <th class="text-center" style="width: 25%;">Échéance / Durée</th>
        <th style="width: 50%;">Description du Périmètre</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Présentation Officielle</strong></td>
        <td class="text-center"><strong>5 Août 2026</strong></td>
        <td>Présentation exécutive et démonstration interactive devant la Direction Générale.</td>
      </tr>
      <tr>
        <td><strong>Déploiement Agence Pilote</strong></td>
        <td class="text-center"><strong>Du 5 au 8 Août (72h max)</strong></td>
        <td>Installation matérielle, configuration serveur local et mise en service opérationnelle immédiate.</td>
      </tr>
      <tr>
        <td><strong>Formation des Équipes</strong></td>
        <td class="text-center"><strong>48 heures par agence</strong></td>
        <td>Formation pratique sur site pour guichetiers, chefs d'agence et équipe informatique.</td>
      </tr>
      <tr>
        <td><strong>Généralisation Réseau</strong></td>
        <td class="text-center"><strong>À planifier</strong></td>
        <td>Déploiement successif sur les 3 autres agences après validation du pilote.</td>
      </tr>
    </tbody>
  </table>

  <h3>2. Engagements Support (12 Mois) & Documentation Fournie</h3>
  
  <div class="doc-box">
    <h4>📞 Support Technique & Hotline — 12 Mois</h4>
    <p style="margin:0;">Assistance technique garantie pendant <strong>12 mois</strong> couvrant la résolution des incidents logiciels, la télémaintenance, les interventions sur site et les mises à jour préventives/correctives.</p>
  </div>

  <div class="doc-box" style="border-left-color: #8B0000; margin-top: 6px;">
    <h4>📚 Kit de Documentation & Guides de Résolution de Problèmes (Troubleshooting)</h4>
    <ul style="margin: 2px 0 0 14px;">
      <li><strong>Guide de Résolution de Problèmes (Troubleshooting)</strong> : Fiches réflexes pour diagnostiquer et résoudre immédiatement les pannes courantes (bourrage ticket, déconnexion borne, redémarrage du mini-PC).</li>
      <li><strong>Manuel Utilisateur Guichetier & Chef d'Agence</strong> : Procédures guidées pas-à-pas pour la gestion quotidienne des files et la consultation des statistiques.</li>
      <li><strong>Guide d'Administration Système & Réseau</strong> : Documentation technique complète transmise à l'équipe IT interne de COFINA pour une autonomie totale.</li>
    </ul>
  </div>

</body>
</html>
"""

html_file = r"d:\Cofina\Budget_Projet_PDG_4agences_v4.html"
pdf_file = r"d:\Cofina\Budget_Projet_PDG_4agences_v4.pdf"

with open(html_file, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML written to {html_file}")

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_file}",
    "--no-pdf-header-footer",
    html_file
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Returncode:", res.returncode)

if os.path.exists(pdf_file):
    print(f"SUCCESS: PDF created with exactly 4 pages at {pdf_file}, size: {os.path.getsize(pdf_file)} bytes")
else:
    print("FAILED to generate PDF")

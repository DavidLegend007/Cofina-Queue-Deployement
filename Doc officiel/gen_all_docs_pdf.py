#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génération des Documents Officiels PDF MATRIX INDUSTRIE → COFINA TOGO
1. Lettre Presentation PDG COFINA.pdf (STRICTEMENT 2 PAGES)
2. Budget Projet PDG 4 Agences.pdf (PROPOSITION TECHNIQUE ET BUDGÉTAIRE COMPLÈTE)
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, Image
)
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER, TA_JUSTIFY
import os

OUT_LETTRE = r"d:\Cofina\Doc officiel\Lettre Presentation PDG COFINA.pdf"
OUT_BUDGET = r"d:\Cofina\Doc officiel\Budget Projet PDG 4 Agences.pdf"

RED     = colors.HexColor("#D3122A")
DARK    = colors.HexColor("#1A1C1D")
GREY    = colors.HexColor("#5D5F60")
BLUE    = colors.HexColor("#1D4ED8")
BLUE_BG = colors.HexColor("#EFF6FF")
TALT    = colors.HexColor("#FFF5F5")
TLINE   = colors.HexColor("#E6BDBB")
BOX_BG  = colors.HexColor("#F8FAFC")
BOX_BRD = colors.HexColor("#CBD5E1")

base = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, parent=base["Normal"], **kw)

sRight  = S("sRight",  fontSize=8.5, textColor=DARK,  fontName="Helvetica",      alignment=TA_RIGHT, leading=12)
sRightB = S("sRightB", fontSize=8.5, textColor=DARK,  fontName="Helvetica-Bold", alignment=TA_RIGHT, leading=12)
sRecip  = S("sRecip",  fontSize=9,   textColor=DARK,  fontName="Helvetica",      leading=13)
sRecipB = S("sRecipB", fontSize=9.5, textColor=DARK,  fontName="Helvetica-Bold", leading=13.5)
sObjet  = S("sObjet",  fontSize=8.5, textColor=DARK,  fontName="Helvetica",      leading=12.5)
sH2     = S("sH2",     fontSize=9.5, textColor=RED,   fontName="Helvetica-Bold", spaceBefore=6, spaceAfter=2, leading=12)
sBody   = S("sBody",   fontSize=8.5, textColor=DARK,  fontName="Helvetica",      alignment=TA_JUSTIFY, leading=12, spaceAfter=3)
sQuote  = S("sQuote",  fontSize=8.5, textColor=BLUE,  fontName="Helvetica-BoldOblique", alignment=TA_CENTER,
            leading=12, spaceAfter=4, backColor=BLUE_BG, leftIndent=14, rightIndent=14, borderPad=5)
sBullet = S("sBullet", fontSize=8.5, textColor=DARK,  fontName="Helvetica",      leading=12, leftIndent=14, spaceAfter=2)
sFooter = S("sFooter", fontSize=7.5, textColor=GREY,  fontName="Helvetica-Oblique", alignment=TA_CENTER, leading=10.5)
sSign   = S("sSign",   fontSize=8.5, textColor=DARK,  fontName="Helvetica",      alignment=TA_RIGHT, leading=12)
sSignB  = S("sSignB",  fontSize=9,   textColor=DARK,  fontName="Helvetica-Bold", alignment=TA_RIGHT, leading=12.5)

def HR(color=RED, th=0.8, sb=3, sa=4):
    return HRFlowable(width="100%", thickness=th, color=color, spaceBefore=sb, spaceAfter=sa)

def SP(h=0.2):
    return Spacer(1, h * cm)

def tbase():
    return [
        ("FONTNAME",      (0, 0), (-1,  0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("BACKGROUND",    (0, 0), (-1,  0), RED),
        ("TEXTCOLOR",     (0, 0), (-1,  0), colors.white),
        ("ALIGN",         (0, 0), (-1,  0), "CENTER"),
        ("ALIGN",         (0, 1), ( 0, -1), "LEFT"),
        ("GRID",          (0, 0), (-1, -1), 0.35, TLINE),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, TALT]),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ]

# ════════════════════════════════════════════════════════════════
# HELPER : EN-TÊTE OFFICIEL UTLRA-LISIBLE MATRIX INDUSTRIE
# ════════════════════════════════════════════════════════════════
def create_matrix_header(doc_title, doc_ref):
    left_p = Paragraph(
        "<b><font size=13 color='#D3122A'>MATRIX INDUSTRIE</font></b><br/>"
        "<b><font size=8.5 color='#1E293B'>SOLUTIONS DIGITALES &amp; INTÉGRATION NUMÉRIQUE</font></b><br/>"
        "<font size=7 color='#475569'>📍 Siège : Lomé, Togo &nbsp;•&nbsp; 📧 contact@matrix-industrie.com &nbsp;•&nbsp; 🌐 www.matrix-industrie.com</font>",
        S("hleft", leading=11.5)
    )
    right_p = Paragraph(
        f"<b><font size=9.5 color='#1E293B'>{doc_title}</font></b><br/>"
        f"<font size=7.5 color='#475569'><b>RÉFÉRATION :</b> {doc_ref}<br/>"
        f"<b>DATE :</b> 03 Août 2026<br/>"
        f"<b>CLIENT :</b> Groupe COFINA Togo</font>",
        S("hright", leading=10.5, alignment=TA_RIGHT)
    )
    tbl = Table([[left_p, right_p]], colWidths=[11.5*cm, 5.5*cm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BOX_BG),
        ("BOX", (0,0), (-1,-1), 1, BOX_BRD),
        ("LINEBEFORE", (1,0), (1,0), 0.5, BOX_BRD),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    return tbl


# ================================================================
# 1. GENERATION DE LA LETTRE DE TRANSMISSION (2 PAGES EXACTEMENT)
# ================================================================
def generate_lettre_pdf():
    doc = SimpleDocTemplate(
        OUT_LETTRE, pagesize=A4,
        leftMargin=2.0*cm, rightMargin=2.0*cm,
        topMargin=1.6*cm,  bottomMargin=1.6*cm
    )
    story = []

    # En-tête officiel MATRIX INDUSTRIE
    story.append(create_matrix_header("LETTRE DE TRANSMISSION", "MI-COF-2026-LET"))
    story.append(SP(0.25))

    # Destinataire
    story.append(Paragraph("<b>À l'attention de :</b>", sRecip))
    story.append(Paragraph("<b>Monsieur le Président Directeur Général</b>", sRecipB))
    story.append(Paragraph("Groupe <b>COFINA</b> Togo &nbsp;—&nbsp; <i>Compagnie Financière Africaine, Lomé, Togo</i>", sRecip))
    story.append(SP(0.2))
    story.append(HR(color=TLINE, th=0.4, sb=2, sa=3))

    # Objet & PJ
    story.append(Paragraph(
        "<b>Objet :</b> Transmission de la Proposition Technique et Budgétaire — <i>Système de Gestion de File d'Attente (SGFA) pour 4 Agences COFINA Togo</i>",
        sObjet))
    story.append(Paragraph(
        "<b>Pièce jointe transmise :</b> Document Budgétaire Détaillé — <i>Budget Projet PDG 4 Agences.pdf</i>",
        sObjet))
    story.append(SP(0.25))
    story.append(HR(sb=2, sa=4))

    # Salutation
    story.append(Paragraph("<b>Monsieur le Président Directeur Général,</b>", sH2))
    story.append(Paragraph(
        "Nous avons l'honneur de vous transmettre ci-joint la proposition technique et budgétaire "
        "relative au déploiement du <b>Système de Gestion de File d'Attente (SGFA)</b> au sein des "
        "<b>4 agences du réseau COFINA Togo</b>, conçu et réalisé par <b>MATRIX INDUSTRIE</b>.",
        sBody))

    # Section 1 : Contexte
    story.append(Paragraph("1. Contexte &amp; Enjeux Opérationnels", sH2))
    story.append(Paragraph(
        "Dans le cadre de l'amélioration continue de l'accueil et de l'expérience client au sein des agences "
        "<b>COFINA Togo</b>, la gestion fluide des flux aux guichets constitue un enjeu stratégique majeur. "
        "Pour répondre aux défis des temps d'attente et garantir une gouvernance basée sur des données mesurables, "
        "<b>MATRIX INDUSTRIE</b> a développé une solution souveraine et hautement disponible :",
        sBody))
    story.append(Paragraph(
        "Un Système de Gestion de File d'Attente 100% autonome, fonctionnant en réseau local (LAN), "
        "sans aucune dépendance à Internet — garantissant une continuité de service totale en agence.",
        sQuote))

    # Section 2 : Solution Proposée
    story.append(Paragraph("2. Synthèse de la Solution Proposée", sH2))
    story.append(Paragraph(
        "La solution conçue par <b>MATRIX INDUSTRIE</b> intègre l'ensemble de la chaîne opérationnelle d'accueil :",
        sBody))

    compo_data = [
        ["Composant", "Spécifications &amp; Fonctionnalités"],
        ["Borne Tactile Interactive\n(Android 32'' ou 55'')",
         "Borne ergonomique multilingue (FR/EN) délivrant un Ticket QR Code scannable sur smartphone pour le suivi de rang en direct, combiné à l'impression thermique ESC/POS."],
        ["Écran d'Affichage 32''\n&amp; Sonorisation d'Agence",
         "Écran dynamique d'accueil indiquant les numéros appelés en temps réel par caisse, couplé à un carillon sonore et une annonce vocale automatique."],
        ["Plateforme Logicielle Edge\n(Serveur Local &amp; SQLite)",
         "Interface guichetier 1-clic, console d'administration globale, et archivage hebdomadaire automatique (Lundi–Samedi 14h) dans SQLite avec export CSV pour la Direction."],
    ]
    compo_tbl = Table(compo_data, colWidths=[4.8*cm, 12.2*cm])
    compo_tbl.setStyle(TableStyle(tbase()))
    story.append(compo_tbl)

    # PAGE 2
    story.append(PageBreak())

    # Section 3 : Calendrier
    story.append(Paragraph("3. Calendrier Réactif d'Exécution &amp; Déploiement", sH2))
    cal = Table([
        ["Jalon / Étape", "Date &amp; Durée", "Objectifs &amp; Livrables"],
        ["Présentation Officielle",    "5 Août 2026",          "Démonstration fonctionnelle en direct devant la Direction Générale de COFINA"],
        ["Déploiement Agence Pilote",  "5–8 Août 2026 (72h)",  "Mise en service intégrale sur l'agence siège Kodjoviakopé (Serveur Edge, borne, TV, audio)"],
        ["Formation des Équipes",      "48h par agence",       "Formation opérationnelle des guichetiers, chefs d'agence &amp; transfert IT"],
        ["Généralisation Réseau",      "Selon planning",       "Réplication standardisée du modèle validé sur les 3 autres agences COFINA"],
    ], colWidths=[4.8*cm, 4.2*cm, 8.0*cm])
    cal.setStyle(TableStyle(tbase() + [("ALIGN",(1,1),(1,-1),"CENTER")]))
    story.append(cal)
    story.append(SP(0.15))

    # Section 4 : Budget
    story.append(Paragraph("4. Synthèse de la Proposition Budgétaire (4 Agences)", sH2))
    story.append(Paragraph(
        "Le chiffrage détaillé remis en pièce jointe (<i>Budget Projet PDG 4 Agences.pdf</i>) est résumé ci-dessous :",
        sBody))

    bud = Table([
        ["Poste de Dépense", "Option Borne 55''", "Option Borne 32''"],
        ["Logiciel complet — 4 agences\n(Développement sur-mesure, installation 72h, formation 48h, support 12 mois)",
         "6 000 000 FCFA", "6 000 000 FCFA"],
        ["Kits Matériels — 4 agences\n(Bornes interactives, serveurs Edge, écrans 32'', imprimantes, câblage, audio)",
         "6 400 000 FCFA", "5 660 000 FCFA"],
        ["BUDGET TOTAL GLOBAL DU PROJET", "12 400 000 FCFA", "11 660 000 FCFA"],
    ], colWidths=[9.4*cm, 3.8*cm, 3.8*cm])
    bud.setStyle(TableStyle(tbase() + [
        ("ALIGN",      (1,1),(-1,-1), "RIGHT"),
        ("FONTNAME",   (0,-1),(-1,-1), "Helvetica-Bold"),
        ("BACKGROUND", (0,-1),(-1,-1), colors.HexColor("#FFE5E5")),
        ("TEXTCOLOR",  (0,-1),(-1,-1), RED),
    ]))
    story.append(bud)
    story.append(Paragraph("<i>Montants exprimés Hors Taxes (HT). Support technique et maintenance inclus pendant 12 mois.</i>", sFooter))
    story.append(SP(0.15))

    # Section 5 : Engagements
    story.append(Paragraph("5. Engagements Clés de MATRIX INDUSTRIE", sH2))
    for b in [
        "<b>Support Technique &amp; Hotline 12 Mois</b> : Assistance garantie et télémaintenance pour assurer 100% de disponibilité.",
        "<b>Formation Approfondie des Équipes</b> : 48h de formation par agence pour une adoption immédiate par les guichetiers et managers.",
        "<b>Documentation Technique &amp; Troubleshooting</b> : Remise des manuels utilisateurs et fiches réflexes de résolution de pannes.",
        "<b>Souveraineté &amp; Autonomie Réseau (Edge)</b> : Zéro dépendance à la connexion Internet pour prémunir les agences COFINA de toute coupure.",
    ]:
        story.append(Paragraph(f"&#10003;&nbsp; {b}", sBullet))

    story.append(SP(0.2))

    # Politesse
    story.append(Paragraph(
        "Persuadés que cette proposition globale répond parfaitement aux exigences d'excellence et de modernisation du "
        "Groupe <b>COFINA Togo</b>, <b>MATRIX INDUSTRIE</b> se tient à votre entière disposition pour échanger lors de "
        "la présentation officielle fixée au 5 Août 2026.",
        sBody))
    story.append(Paragraph(
        "Nous vous prions d'agréer, Monsieur le Président Directeur Général, l'expression de notre très haute considération.",
        sBody))

    story.append(SP(0.4))

    # Signature
    story.append(Paragraph("<b>MATRIX INDUSTRIE</b>", sSignB))
    story.append(Paragraph("<i>Solutions Digitale &amp; Intégration Systèmes — Lomé, Togo</i>", sSign))
    story.append(SP(0.8))
    story.append(Paragraph("___________________________", sSign))
    story.append(Paragraph("<i>Signature &amp; Cachet officiel</i>", sSign))

    story.append(SP(0.3))
    story.append(HR(color=TLINE, th=0.4, sb=2, sa=2))
    story.append(Paragraph(
        "<b>Document d'accompagnement rattaché :</b> <i>Budget Projet PDG 4 Agences.pdf</i> — "
        "Dossier complet de chiffrage matériel, logiciel et planning.",
        sFooter))

    doc.build(story)
    print(f"[OK] Lettre PDF generee (2 pages) : {OUT_LETTRE}")



# ================================================================
# 2. GENERATION DU DOSSIER BUDGET COMPLET PDF AVEC MÊME EN-TÊTE
# ================================================================
def generate_budget_pdf():
    doc = SimpleDocTemplate(
        OUT_BUDGET, pagesize=A4,
        leftMargin=2.0*cm, rightMargin=2.0*cm,
        topMargin=1.6*cm,  bottomMargin=1.6*cm
    )
    story = []

    # En-tête officiel MATRIX INDUSTRIE
    story.append(create_matrix_header("PROPOSITION TECHNIQUE ET BUDGÉTAIRE", "MI-COF-2026-BDG"))
    story.append(SP(0.3))

    # Titre Principal
    story.append(Paragraph("BUDGET PROJET — SYSTÈME DE GESTION DE FILE D'ATTENTE (SGFA)",
                           S("btitle", fontSize=13, fontName="Helvetica-Bold", textColor=RED, leading=16)))
    story.append(Paragraph("<b>Client : Groupe COFINA Togo</b> &nbsp;•&nbsp; Périmètre : 4 Agences (avec 1 agence pilote) &nbsp;•&nbsp; Document Confidentiel",
                           S("bsub", fontSize=8.5, fontName="Helvetica-Oblique", textColor=DARK, leading=12)))
    story.append(SP(0.2))
    story.append(HR())
    story.append(SP(0.2))

    # Section I : Logiciel
    story.append(Paragraph("I. Conception, Réalisation Logicielle &amp; Prestations (4 Agences)", sH2))
    story.append(Paragraph(
        "La conception du logiciel couvre l'intégralité du cycle de vie de la plateforme pour les 4 agences du réseau COFINA Togo. "
        "La solution est livrée <b>clé en main</b> pour un montant total fixe de <b>6 000 000 FCFA HT</b>, incluant développement, "
        "installation 72h sur agence pilote, formation 48h par agence et 12 mois de support garanti.",
        sBody))

    log_data = [
        ["Prestation / Module", "Description du Périmètre", "Coût (FCFA)"],
        ["Développement du Logiciel", "Moteur de gestion des files, algorithmes de priorité, interface guichetier, borne QR, affichage TV 32'' et dashboard d'administration.", "Inclus"],
        ["Déploiement &amp; Installation", "Configuration serveur local mini-PC agence pilote (72h max du 5 au 8 août) puis réplication sur les 3 autres agences.", "Inclus"],
        ["Support &amp; Assistance (12 Mois)", "Support technique et assistance garantie pendant 12 mois. Hotline et prise en main à distance immédiate.", "Inclus"],
        ["Maintenance &amp; Sécurité", "Maintenance préventive et corrective du logiciel, mises à jour de sécurité et correctifs logiciels.", "Inclus"],
        ["Formation &amp; Transfert", "48 heures de formation intensive par agence (guichetiers, chefs d'agence) + transfert IT interne.", "Inclus"],
        ["Documentation Completes", "Guide de résolution des pannes (Troubleshooting), manuels utilisateurs et fiches d'administration système.", "Inclus"],
        ["TOTAL LOGICIEL (4 AGENCES)", "Livrable logiciel complet, opérationnel et sous assistance 12 mois", "6 000 000 FCFA"],
    ]
    log_tbl = Table(log_data, colWidths=[5.0*cm, 8.5*cm, 3.5*cm])
    log_tbl.setStyle(TableStyle(tbase() + [
        ("ALIGN", (2,1), (2,-1), "RIGHT"),
        ("FONTNAME", (0,-1), (-1,-1), "Helvetica-Bold"),
        ("BACKGROUND", (0,-1), (-1,-1), colors.HexColor("#FFE5E5")),
        ("TEXTCOLOR", (0,-1), (-1,-1), RED),
    ]))
    story.append(log_tbl)
    story.append(SP(0.3))

    # Section II : Matériels d'installation
    story.append(Paragraph("II. Kits Matériels d'Installation par Agence (Hors Borne)", sH2))
    story.append(Paragraph("Équipements de base d'infrastructure agence (devis fournisseurs réels service achats) :", sBody))

    mat_base = [
        ["Article", "Description &amp; Utilisation", "Qté", "P.U. (FCFA)", "Sous-Total (FCFA)"],
        ["Écran (32'')", "Support d'affichage dynamique des numéros appelés", "1", "65 000", "65 000"],
        ["Serveur local (mini-PC)", "Serveur d'agence hébergeant le contrôleur de file", "1", "250 000", "250 000"],
        ["Imprimante ticket QR", "Impression thermique des tickets avec QR Code", "1", "50 000", "50 000"],
        ["Switch réseau (16 ports)", "Interconnexion locale des équipements LAN", "1", "35 000", "35 000"],
        ["Câble RJ45 (rouleau)", "Câblage réseau structuré agence", "1", "45 000", "45 000"],
        ["Câble HDMI (100 m)", "Liaison vidéo haute définition pour l'écran 32''", "1", "100 000", "100 000"],
        ["Haut-parleur d'agence", "Diffusion sonore de l'appel des numéros", "1", "100 000", "100 000"],
        ["SOUS-TOTAL MATÉRIEL BASE (PAR AGENCE)", "", "", "", "645 000 FCFA"],
    ]
    mat_tbl = Table(mat_base, colWidths=[4.2*cm, 6.8*cm, 1.2*cm, 2.4*cm, 2.4*cm])
    mat_tbl.setStyle(TableStyle(tbase() + [
        ("ALIGN", (2,1), (-1,-1), "CENTER"),
        ("ALIGN", (3,1), (-1,-1), "RIGHT"),
        ("FONTNAME", (0,-1), (-1,-1), "Helvetica-Bold"),
        ("BACKGROUND", (0,-1), (-1,-1), colors.HexColor("#F1F5F9")),
    ]))
    story.append(mat_tbl)
    story.append(SP(0.3))

    # Section III : Bornes interactives
    story.append(Paragraph("III. Options Bornes Interactives Tactiles (Android — Branding MATRIX INDUSTRIE)", sH2))
    story.append(Paragraph(
        "Deux options de bornes tactiles grand format sont proposées pour l'équipement des 4 agences COFINA Togo :",
        sBody))

    borne_data = [
        ["Modèle &amp; Format", "Référence", "Description &amp; Branding", "Prix Unitaire HT"],
        ["Borne 55 pouces (Grand format)", "RS551-WC", "Écran tactile HD 55'', contrôleur Android haute vitesse, Logo MATRIX INDUSTRIE", "955 000 FCFA"],
        ["Borne 32 pouces (Format compact)", "RS321-WC", "Écran tactile HD 32'', contrôleur Android haute vitesse, Logo MATRIX INDUSTRIE", "770 000 FCFA"],
    ]
    borne_tbl = Table(borne_data, colWidths=[4.5*cm, 2.5*cm, 6.5*cm, 3.5*cm])
    borne_tbl.setStyle(TableStyle(tbase() + [("ALIGN", (3,1), (3,-1), "RIGHT")]))
    story.append(borne_tbl)
    story.append(SP(0.3))

    # Images des Bornes si disponibles
    b55_path = r"d:\Cofina\public\Borne 55 pouces.jpg"
    b32_path = r"d:\Cofina\public\Borne 32 pouces.jpg"
    if os.path.exists(b55_path) and os.path.exists(b32_path):
        img55 = Image(b55_path, width=4.5*cm, height=6.0*cm)
        img32 = Image(b32_path, width=4.5*cm, height=6.0*cm)
        img_tbl = Table([[img55, img32]], colWidths=[8.5*cm, 8.5*cm])
        img_tbl.setStyle(TableStyle([
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ]))
        story.append(img_tbl)
        story.append(Paragraph("<i>Visuels indicatifs : Borne 55'' RS551-WC (à gauche) &amp; Borne 32'' RS321-WC (à droite)</i>", sFooter))
        story.append(SP(0.3))

    # Section IV : Récapitulatif Global
    story.append(Paragraph("IV. Récapitulatif du Budget Global (4 Agences COFINA Togo)", sH2))

    recap_data = [
        ["Configuration Choisie", "Dépenses Matériel (4 agences)", "Logiciel (4 agences)", "BUDGET TOTAL GLOBAL HT"],
        ["OPTION BORNE 55'' (RS551-WC)", "6 400 000 FCFA", "6 000 000 FCFA", "12 400 000 FCFA"],
        ["OPTION BORNE 32'' (RS321-WC)", "5 660 000 FCFA", "6 000 000 FCFA", "11 660 000 FCFA"],
    ]
    recap_tbl = Table(recap_data, colWidths=[5.5*cm, 4.0*cm, 3.5*cm, 4.0*cm])
    recap_tbl.setStyle(TableStyle(tbase() + [
        ("ALIGN", (1,1), (-1,-1), "RIGHT"),
        ("FONTNAME", (0,1), (-1,-1), "Helvetica-Bold"),
        ("BACKGROUND", (0,1), (-1,1), colors.HexColor("#FFE5E5")),
        ("TEXTCOLOR", (0,1), (-1,1), RED),
    ]))
    story.append(recap_tbl)
    story.append(SP(0.4))

    # Signature block
    story.append(Paragraph("<b>MATRIX INDUSTRIE</b> — Integration &amp; Digital Solutions", sSignB))
    story.append(Paragraph("Lomé, Togo &nbsp;•&nbsp; Le 3 Août 2026", sSign))
    story.append(SP(1.0))
    story.append(Paragraph("___________________________", sSign))
    story.append(Paragraph("<i>Signature &amp; Cachet officiel</i>", sSign))

    doc.build(story)
    print(f"[OK] Dossier Budget PDF genere : {OUT_BUDGET}")



if __name__ == '__main__':
    generate_lettre_pdf()
    generate_budget_pdf()

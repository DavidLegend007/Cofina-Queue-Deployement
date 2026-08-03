#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lettre de Transmission & d'Accompagnement de la Proposition Budgétaire
MATRIX INDUSTRIE → Monsieur le Président Directeur Général, COFINA Togo
FORMAT STRICT : EXACTEMENT 2 PAGES
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER, TA_JUSTIFY

OUT = r"d:\Cofina\Doc officiel\Lettre Presentation PDG COFINA.pdf"

# ── Palette COFINA / MATRIX INDUSTRIE ──────────────
RED     = colors.HexColor("#D3122A")
DARK    = colors.HexColor("#1A1C1D")
GREY    = colors.HexColor("#5D5F60")
BLUE    = colors.HexColor("#1D4ED8")
BLUE_BG = colors.HexColor("#EFF6FF")
TALT    = colors.HexColor("#FFF5F5")
TLINE   = colors.HexColor("#E6BDBB")

base = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, parent=base["Normal"], **kw)

# Styles typographiques
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

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=2.0*cm, rightMargin=2.0*cm,
    topMargin=1.6*cm,  bottomMargin=1.6*cm
)

story = []

# ════════════════════════════════════════════════════════════════
# PAGE 1 : EN-TÊTE, CADRE ADRESSAGE, CONTEXTE & SOLUTION PROPOSÉE
# ════════════════════════════════════════════════════════════════

# Banner header
hdr = Table([[
    Paragraph("LETTRE DE TRANSMISSION ET D'ACCOMPAGNEMENT", S("lh", fontSize=11, fontName="Helvetica-Bold",
              textColor=colors.white, leading=14)),
    Paragraph("PROPOSITION TECHNIQUE ET BUDGÉTAIRE", S("lh2", fontSize=8.5,
              fontName="Helvetica-Oblique", textColor=colors.HexColor("#FECACA"),
              leading=11, alignment=TA_RIGHT))
]], colWidths=[9.8*cm, 7.2*cm])
hdr.setStyle(TableStyle([
    ("BACKGROUND",   (0, 0), (-1, -1), RED),
    ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING",   (0, 0), (-1, -1), 9),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 9),
    ("LEFTPADDING",  (0, 0), (-1, -1), 10),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
]))
story.append(hdr)
story.append(SP(0.25))

# Expéditeur
story.append(Paragraph("<b>MATRIX INDUSTRIE</b> — Integration &amp; Digital Solutions", sRightB))
story.append(Paragraph("Lomé, Togo &nbsp;|&nbsp; Le <b>3 Août 2026</b>", sRight))
story.append(SP(0.15))
story.append(HR())
story.append(SP(0.2))

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

# ════════════════════════════════════════════════════════════════
# PAGE 2 : CALENDRIER, BUDGET, ENGAGEMENTS, POLITESSE & SIGNATURE
# ════════════════════════════════════════════════════════════════
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
print(f"PDF généré : {OUT}")

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database...');

  const agency = await prisma.agency.upsert({
    where: { code: 'AGC-01' },
    update: {},
    create: {
      code: 'AGC-01',
      name: 'Agence Siège Kodjoviakopé (Lomé)',
      city: 'Lomé',
      address: 'Rue de la Paix, Kodjoviakopé'
    }
  });

  const defaultPinHash = await bcrypt.hash('1234', 10);
  const adminPasswordHash = await bcrypt.hash('cofinaAdmin2026!', 10);

  // Initialisation des 6 postes (3 caisses, 2 opérateurs, 1 accueil) + Admin
  const agents = [
    { id: 'AGT-01', name: 'Mensah Koffi', defaultCounter: 1, avatar: '👨🏽‍💼', title: 'Caisse 1', role: 'AGENT', passwordHash: defaultPinHash },
    { id: 'AGT-02', name: 'Amégadjie Afiwa', defaultCounter: 2, avatar: '👩🏽‍💼', title: 'Caisse 2', role: 'AGENT', passwordHash: defaultPinHash },
    { id: 'AGT-03', name: 'Lawani Komlan', defaultCounter: 3, avatar: '👨🏿‍💼', title: 'Caisse 3', role: 'AGENT', passwordHash: defaultPinHash },
    { id: 'AGT-04', name: 'Adzoh Kodjo', defaultCounter: 4, avatar: '👨🏽‍💼', title: 'Opérateur 1', role: 'AGENT', passwordHash: defaultPinHash },
    { id: 'AGT-05', name: 'Sossou Aya', defaultCounter: 5, avatar: '👩🏿‍💼', title: 'Opérateur 2', role: 'AGENT', passwordHash: defaultPinHash },
    { id: 'AGT-06', name: 'Agent Accueil', defaultCounter: 6, avatar: '👩🏽‍💻', title: 'Poste Accueil', role: 'AGENT', passwordHash: defaultPinHash },
    { id: 'AGT-ADMIN', name: 'Administrateur Siège', defaultCounter: 1, avatar: '🛡️', title: 'Admin Agence', role: 'ADMIN', passwordHash: adminPasswordHash }
  ];

  for (const ag of agents) {
    await prisma.agent.upsert({
      where: { id: ag.id },
      update: { role: ag.role, passwordHash: ag.passwordHash },
      create: {
        id: ag.id,
        name: ag.name,
        defaultCounter: ag.defaultCounter,
        avatar: ag.avatar,
        title: ag.title,
        role: ag.role,
        passwordHash: ag.passwordHash,
        agencyId: agency.id
      }
    });
  }

  // Tickets de test pour initialiser
  await prisma.ticket.createMany({
    data: [
      {
        ticketNumber: 'A-008',
        serviceCode: 'A',
        serviceName: "Dépôt & Retrait d'Espèces",
        priority: false,
        status: 'CALLED',
        counterNumber: 1,
        agentId: 'AGT-01',
        agentName: 'Mensah Koffi',
        calledAt: new Date(),
        agencyId: agency.id
      },
      {
        ticketNumber: 'V-002',
        serviceCode: 'V',
        serviceName: 'Service Client & Prioritaire',
        priority: true,
        status: 'WAITING',
        agencyId: agency.id
      },
      {
        ticketNumber: 'A-009',
        serviceCode: 'A',
        serviceName: "Dépôt & Retrait d'Espèces",
        priority: false,
        status: 'WAITING',
        agencyId: agency.id
      },
      {
        ticketNumber: 'B-004',
        serviceCode: 'B',
        serviceName: 'Épargne & Tontine / Compte',
        priority: false,
        status: 'WAITING',
        agencyId: agency.id
      }
    ]
  });

  console.log('Database seeded successfully with Agents and initial Tickets!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

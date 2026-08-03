import { PrismaClient } from '@prisma/client';

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

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

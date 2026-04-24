import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.note.deleteMany();
  await prisma.document.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.transport.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.day.deleteMany();
  await prisma.accommodation.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.trip.deleteMany();
  console.log('All data cleared.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

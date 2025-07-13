import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting all inventory item quantities to 5...');
  const updated = await prisma.inventoryItem.updateMany({
    data: { quantity: 5 }
  });
  console.log(`Updated ${updated.count} inventory items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed only non-sensitive sample data:
 *  - a few sample Plans (so the homepage isn't empty)
 * Deliberately does NOT create:
 *  - any Config rows (real proxy configs must be entered by the admin)
 *  - any real user accounts
 * per spec section 2 / 4 / 13.
 */
async function main() {
  const existingPlans = await prisma.plan.count();
  if (existingPlans === 0) {
    await prisma.plan.createMany({
      data: [
        {
          title: "10GB - 30 روزه",
          description: "مناسب استفاده سبک روزمره",
          price: 150000,
          volumeGB: 10,
          durationDays: 30,
          sortOrder: 1,
        },
        {
          title: "50GB - 60 روزه",
          description: "مناسب استفاده متوسط",
          price: 550000,
          volumeGB: 50,
          durationDays: 60,
          sortOrder: 2,
        },
        {
          title: "100GB - 90 روزه",
          description: "مناسب استفاده سنگین و چند دستگاه",
          price: 950000,
          volumeGB: 100,
          durationDays: 90,
          sortOrder: 3,
        },
      ],
    });
    console.log("Seeded sample plans.");
  } else {
    console.log("Plans already exist, skipping plan seed.");
  }

  console.log(
    "No Config rows were created - add real configs from Admin > Configs."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { users, babies } from "../src/db/schema";
import { hashPassword } from "../src/lib/password";
import { seedDemoDataForBaby, clearBabyData } from "../src/lib/demo";

const DEMO_EMAIL = "demo@justbabyluv.com";
const DEMO_PASSWORD = "demo1234";

async function main() {
  let user = await db.query.users.findFirst({ where: eq(users.email, DEMO_EMAIL) });

  if (!user) {
    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const [created] = await db
      .insert(users)
      .values({ name: "Demo Parent", email: DEMO_EMAIL, passwordHash })
      .returning();
    user = created;
    console.log(`Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log(`Demo user already exists: ${DEMO_EMAIL}`);
  }

  let baby = await db.query.babies.findFirst({ where: eq(babies.userId, user.id) });

  if (!baby) {
    const dob = new Date();
    dob.setDate(dob.getDate() - 18); // 18 days old
    const [created] = await db
      .insert(babies)
      .values({
        userId: user.id,
        name: "Emma",
        dob,
        birthWeightValue: 7.2,
        birthWeightUnit: "lb",
        notes: "Demo baby profile for showcasing the app.",
      })
      .returning();
    baby = created;
    console.log("Created demo baby: Emma");
  }

  await clearBabyData(baby.id);
  await seedDemoDataForBaby(baby.id);
  console.log("Seeded demo activities, milestones, and reminders.");
  console.log("\nDemo login:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, milestones, reminders } from "@/db/schema";

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

export async function clearBabyData(babyId: string) {
  await db.delete(activities).where(eq(activities.babyId, babyId));
  await db.delete(milestones).where(eq(milestones.babyId, babyId));
  await db.delete(reminders).where(eq(reminders.babyId, babyId));
}

export async function seedDemoDataForBaby(babyId: string) {
  await db.insert(activities).values([
    {
      babyId,
      type: "FEED",
      subtype: "bottle",
      startTime: hoursAgo(1.2),
      endTime: hoursAgo(1.1),
      amount: 4,
      unit: "oz",
    },
    {
      babyId,
      type: "DIAPER",
      subtype: "wet",
      startTime: hoursAgo(0.7),
    },
    {
      babyId,
      type: "SLEEP",
      startTime: hoursAgo(3.5),
      endTime: hoursAgo(2.3),
    },
    {
      babyId,
      type: "PUMP",
      side: "both",
      startTime: hoursAgo(5),
      endTime: hoursAgo(4.8),
      amount: 3,
      unit: "oz",
    },
    {
      babyId,
      type: "MEDICATION",
      medicationName: "Vitamin D drops",
      dose: "1 mL",
      startTime: hoursAgo(6),
    },
    {
      babyId,
      type: "DIAPER",
      subtype: "dirty",
      startTime: hoursAgo(8),
    },
    {
      babyId,
      type: "FEED",
      subtype: "breast",
      side: "left",
      startTime: hoursAgo(9.2),
      endTime: hoursAgo(9),
    },
  ]);

  await db.insert(milestones).values([
    {
      babyId,
      title: "First smile",
      date: hoursAgo(24 * 3),
      note: "Right after her morning feed.",
    },
    {
      babyId,
      title: "First bath",
      date: hoursAgo(24 * 6),
    },
  ]);

  await db.insert(reminders).values([
    {
      babyId,
      title: "Vitamin D drops",
      type: "MEDICATION",
      datetime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      repeat: "daily",
      emailEnabled: false,
    },
    {
      babyId,
      title: "Pumping session",
      type: "PUMP",
      datetime: new Date(Date.now() + 90 * 60 * 1000),
      repeat: "none",
      emailEnabled: false,
    },
  ]);
}

import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";

async function unseed() {
  await db.delete(appointmentsTable);
  await db.delete(patientsTable);
  console.log("Seed removido com sucesso.");
}

unseed();

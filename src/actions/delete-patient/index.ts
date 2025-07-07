"use server";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const schema = z.object({
  id: z.string().uuid(),
});

export const deletePatient = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    await db.delete(patientsTable).where(eq(patientsTable.id, parsedInput.id));
    revalidatePath("/patients");
  });

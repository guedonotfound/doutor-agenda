"use server";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { upsertPatientSchema } from "./schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    if (parsedInput.id) {
      // Update
      await db
        .update(patientsTable)
        .set({
          name: parsedInput.name,
          email: parsedInput.email,
          phoneNumber: parsedInput.phoneNumber,
          sex: parsedInput.sex,
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, parsedInput.id));

      revalidatePath("/patients");
      return;
    }

    // Create
    await db.insert(patientsTable).values({
      name: parsedInput.name,
      email: parsedInput.email,
      phoneNumber: parsedInput.phoneNumber,
      sex: parsedInput.sex,
      clinicId: session.user.clinic.id,
    });

    revalidatePath("/patients");
  });

"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const schema = z.object({
  id: z.string().uuid(),
});

export const deleteAppointment = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) throw new Error("Unauthorized");

    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
    });
    if (!appointment || appointment.clinicId != session.user.clinic?.id)
      throw new Error("Agendamento não encontrado");

    await db
      .delete(appointmentsTable)
      .where(eq(appointmentsTable.id, parsedInput.id));
    revalidatePath("/appointments");
  });

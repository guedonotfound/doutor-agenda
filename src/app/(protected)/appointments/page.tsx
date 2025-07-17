import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageActions,
  PageContent,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { AddAppointmentButton } from "./_components/add-appointment-button";

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const [doctors, patients] = await Promise.all([
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
      orderBy: [asc(doctorsTable.name)],
    }),
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
      orderBy: [asc(patientsTable.name)],
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            Gerencie os agendamentos da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentButton doctors={doctors} patients={patients} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div />
      </PageContent>
    </PageContainer>
  );
}

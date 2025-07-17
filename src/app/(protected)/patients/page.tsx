import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageActions,
  PageContent,
} from "@/components/ui/page-container";
import { AddPatientButton } from "./_components/add-patient-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PatientsDataTable } from "@/components/ui/patients-data-table";
import { patientsTableColumns } from "./_components/table-columns";
import { patientsTable } from "@/db/schema";
import { db } from "@/db";
import { asc, eq } from "drizzle-orm";

export default async function PatientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
    orderBy: [asc(patientsTable.name)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerencie os pacientes da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <PatientsDataTable columns={patientsTableColumns} data={patients} />
      </PageContent>
    </PageContainer>
  );
}

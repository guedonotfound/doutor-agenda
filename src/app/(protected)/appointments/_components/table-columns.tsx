"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type InferSelectModel } from "drizzle-orm";
import { type appointmentsTable } from "@/db/schema";
import { AppointmentTableActions } from "./table-actions";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import dayjs from "dayjs";
import { formatCurrencyInCents } from "@/helpers/currency";

type Appointment = InferSelectModel<typeof appointmentsTable> & {
  doctor: { name: string };
  patient: { name: string };
};

export const appointmentsTableColumns: ColumnDef<Appointment>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (params) => {
      const appointment = params.row.original;
      return dayjs(appointment.date).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    id: "patientName",
    accessorKey: "patient",
    header: "Paciente",
    cell: (params) => {
      const appointment = params.row.original;
      return appointment.patient.name;
    },
  },
  {
    id: "doctorName",
    accessorKey: "doctor",
    header: "Médico",
    cell: (params) => {
      const appointment = params.row.original;
      return appointment.doctor.name;
    },
  },
  {
    id: "appointmentPriceInCents",
    accessorKey: "appointmentPriceInCents",
    header: "Valor",
    cell: (params) => {
      const appointment = params.row.original;
      return formatCurrencyInCents(appointment.appointmentPriceInCents);
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return <AppointmentTableActions appointment={appointment} />;
    },
  },
];

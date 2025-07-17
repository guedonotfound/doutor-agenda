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
    id: "patientName",
    accessorFn: (row) => row.patient.name,
    header: "Paciente",
    cell: (params) => {
      const appointment = params.row.original;
      return appointment.patient.name;
    },
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor.name,
    header: "Médico",
    cell: (params) => {
      const appointment = params.row.original;
      return appointment.doctor.name;
    },
  },
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
    cell: (params) =>
      dayjs(params.getValue() as string).format("DD/MM/YYYY HH:mm"),
    filterFn: (
      row,
      columnId,
      filterValue: { startDate?: Date; endDate?: Date },
    ) => {
      const date = new Date(row.getValue(columnId));
      const { startDate, endDate } = filterValue || {};

      if (startDate && endDate) {
        // Criar um "endOfDay" para a data final, tipo 23:59:59.999
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        return date >= startDate && date <= endOfDay;
      }

      if (startDate) {
        // Comparar apenas a parte da data (ignorando hora)
        return (
          date.getFullYear() === startDate.getFullYear() &&
          date.getMonth() === startDate.getMonth() &&
          date.getDate() === startDate.getDate()
        );
      }

      return true;
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

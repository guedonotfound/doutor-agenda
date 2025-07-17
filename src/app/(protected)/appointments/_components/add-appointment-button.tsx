"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { doctorsTable, patientsTable } from "@/db/schema";
import AddAppointmentForm from "./add-appointment-form";

interface AddAppointmentButtonProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
}

export const AddAppointmentButton = ({
  doctors,
  patients,
}: AddAppointmentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo agendamento
        </Button>
      </DialogTrigger>
      <AddAppointmentForm
        doctors={doctors}
        patients={patients}
        isOpen={isOpen}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

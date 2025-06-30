"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import UpsertDoctorForm from "./upsert-doctor-form";
import { useState } from "react";

const AddDoctorButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          <span>Adicionar médico</span>
        </Button>
      </DialogTrigger>
      <UpsertDoctorForm onSuccess={() => setIsDialogOpen(false)} />
    </Dialog>
  );
};

export default AddDoctorButton;

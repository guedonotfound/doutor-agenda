"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { doctorsTable } from "@/db/schema";
import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  TrashIcon,
} from "lucide-react";
import UpsertDoctorForm from "./upsert-doctor-form";
import { getAvailability } from "../_helpers/availability";
import { formatCurrencyInCents } from "@/helpers/currency";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteDoctor } from "@/actions/delete-doctor";

interface DoctorCardProps {
  doctor: typeof doctorsTable.$inferSelect;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const availability = getAvailability(doctor);
  const doctorName = doctor.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => name[0])
    .filter(Boolean);

  const initials =
    doctorName.length >= 2
      ? doctorName[0] + doctorName[doctorName.length - 1]
      : (doctorName[0] ?? "");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteDoctorAction = useAction(deleteDoctor, {
    onSuccess: () => {
      toast.success("Médico excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir médico");
    },
  });

  const handleDeleteDoctorClick = () => {
    deleteDoctorAction.execute({
      id: doctor.id,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{doctor.name}</h3>
            <p className="text-muted-foreground text-sm">{doctor.specialty}</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline" className="rounded-full">
          <CalendarIcon className="mr-1" />
          {availability.from.format("dddd")} a {availability.to.format("dddd")}
        </Badge>
        <Badge variant="outline" className="rounded-full">
          <ClockIcon className="mr-1" />
          {availability.from.format("HH:mm")} às{" "}
          {availability.to.format("HH:mm")}
        </Badge>
        <Badge variant="outline" className="rounded-full">
          <DollarSignIcon className="mr-1" />
          {formatCurrencyInCents(doctor.appointmentPriceInCents)}
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter>
        <div className="flex w-full justify-center gap-1">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">Ver detalhes</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Ver detalhes</DialogTitle>
              <UpsertDoctorForm
                doctor={{
                  ...doctor,
                  availableFromTime: availability.from.format("HH:mm:ss"),
                  availableToTime: availability.to.format("HH:mm:ss"),
                }}
                onSuccess={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <TrashIcon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Tem certeza que deseja excluir este médico?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Após a exclusão, todos os
                  agendamentos do médico serão cancelados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDoctorClick}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;

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
import { CalendarIcon, ClockIcon, DollarSignIcon } from "lucide-react";
import UpsertDoctorForm from "./upsert-doctor-form";
import { getAvailability } from "../_helpers/availability";
import { formatCurrencyInCents } from "@/helpers/currency";

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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Ver detalhes</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Ver detalhes</DialogTitle>
            <UpsertDoctorForm />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;

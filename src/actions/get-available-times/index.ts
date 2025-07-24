"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { generateTimeSlots } from "@/helpers/time";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string().date(),
      patientId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      throw new Error("Unauthorized");
    }
    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    const selectedDayOfWeek = dayjs(parsedInput.date).day();
    const doctorIsAvailable =
      selectedDayOfWeek >= doctor.availableFromWeekDay &&
      selectedDayOfWeek <= doctor.availableToWeekDay;
    if (!doctorIsAvailable) {
      return [];
    }

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(eq(appointmentsTable.doctorId, parsedInput.doctorId)),
    });
    const appointmentsOnSelectedDate = appointments
      .filter((appointment) =>
        dayjs(appointment.date).isSame(parsedInput.date, "day"),
      )
      .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));

    // Busca agendamentos do paciente na data (se patientId foi passado)
    let patientAppointmentsOnSelectedDate: string[] = [];
    if (parsedInput.patientId) {
      const patientAppointments = await db.query.appointmentsTable.findMany({
        where: and(eq(appointmentsTable.patientId, parsedInput.patientId)),
      });
      patientAppointmentsOnSelectedDate = patientAppointments
        .filter((appointment) =>
          dayjs(appointment.date).isSame(parsedInput.date, "day"),
        )
        .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));
    }

    const timeSlots = generateTimeSlots();

    const doctorAvailableFrom = dayjs()
      .utc()
      .set("hour", Number(doctor.availableFromTime.split(":")[0]))
      .set("minute", Number(doctor.availableFromTime.split(":")[1]))
      .set("second", 0)
      .local();
    const doctorAvailableTo = dayjs()
      .utc()
      .set("hour", Number(doctor.availableToTime.split(":")[0]))
      .set("minute", Number(doctor.availableToTime.split(":")[1]))
      .set("second", 0)
      .local();

    const now = dayjs().local();

    const doctorTimeSlots = timeSlots.filter((time: string) => {
      const slotTime = dayjs()
        .set("hour", Number(time.split(":")[0]))
        .set("minute", Number(time.split(":")[1]))
        .set("second", 0);

      const isInDoctorHours =
        slotTime.format("HH:mm:ss") >= doctorAvailableFrom.format("HH:mm:ss") &&
        slotTime.format("HH:mm:ss") <= doctorAvailableTo.format("HH:mm:ss");

      if (!isInDoctorHours) {
        return false;
      }

      const isToday = dayjs(parsedInput.date).isSame(now, "day");

      if (isToday && slotTime.isBefore(now)) {
        return false;
      }

      return true;
    });

    return doctorTimeSlots.map((time: string) => {
      const isTakenByDoctor = appointmentsOnSelectedDate.includes(time);
      const isTakenByPatient = patientAppointmentsOnSelectedDate.includes(time);

      return {
        value: time,
        available: !isTakenByDoctor && !isTakenByPatient,
        label: time.substring(0, 5),
      };
    });
  });

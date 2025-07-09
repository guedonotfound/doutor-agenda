import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import { db } from "..";
import { appointmentsTable, doctorsTable, patientsTable } from "../schema";

// ID da clínica
const CLINIC_ID = "e9644c05-974a-49ef-a1fd-54332b117562";

// Quantidades
const PATIENTS_PER_DOCTOR = 30;
const APPOINTMENTS_PER_PATIENT = 5;

// Horário em Brasília (UTC-3)
const START_HOUR = 8;
const END_HOUR = 17; // 17:30 é o último horário permitido (meia hora antes das 18h)

function getRandomWeekdayDateInNextNDays(n = 30): Date {
  let date = faker.date.soon({ days: n });

  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date = faker.date.soon({ days: n });
  }

  return date;
}

function getRandomTimeSlotUTC(): { hours: number; minutes: number } {
  const slots: { hours: number; minutes: number }[] = [];

  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    slots.push({ hours: hour, minutes: 0 });
    if (hour !== END_HOUR) {
      slots.push({ hours: hour, minutes: 30 });
    }
  }

  return faker.helpers.arrayElement(slots);
}

async function seed() {
  console.log("Buscando médicos...");

  const doctors = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.clinicId, CLINIC_ID));

  console.log(`Encontrados ${doctors.length} médicos.`);

  for (const doctor of doctors) {
    console.log(`Inserindo pacientes para o médico ${doctor.id}...`);

    for (let i = 0; i < PATIENTS_PER_DOCTOR; i++) {
      const patientId = uuidv4();

      const patient = {
        id: patientId,
        clinicId: CLINIC_ID,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phoneNumber: `(${faker.string.numeric(2)}) ${faker.string.numeric(5)}-${faker.string.numeric(4)}`,
        sex: faker.helpers.arrayElement(["male", "female"]),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(patientsTable).values(patient);

      for (let j = 0; j < APPOINTMENTS_PER_PATIENT; j++) {
        const baseDate = getRandomWeekdayDateInNextNDays();

        const { hours, minutes } = getRandomTimeSlotUTC();

        // Convertendo horário Brasília para UTC (+3)
        baseDate.setUTCHours(hours + 3, minutes, 0, 0);

        const appointment = {
          id: uuidv4(),
          date: new Date(baseDate),
          patientId,
          doctorId: doctor.id,
          clinicId: CLINIC_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(appointmentsTable).values(appointment);
      }
    }
  }

  console.log("Seed finalizado com sucesso 🎉");
}

seed().catch((err) => {
  console.error("Erro ao fazer seed:", err);
  process.exit(1);
});

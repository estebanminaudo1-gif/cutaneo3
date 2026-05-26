const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando siembra de datos (seed)...");

  // Limpiar base de datos
  await prisma.booking.deleteMany();
  console.log("Base de datos limpia.");

  // Fechas de prueba futuras (Lunes, Martes, Jueves, Viernes)
  // Nota: la fecha local actual en los metadatos es 2026-05-26 (Martes)
  
  // 1. Reserva estándar activa
  const booking1 = await prisma.booking.create({
    data: {
      name: "Esteban Minaudo",
      email: "esteban@example.com",
      phone: "+5491122334455",
      date: "2026-05-28", // Jueves
      time: "12:00",
      status: "reserved",
    },
  });

  // 2. Otra reserva activa en diferente fecha y hora
  await prisma.booking.create({
    data: {
      name: "María López",
      email: "maria.lopez@example.com",
      phone: "+5491199887766",
      date: "2026-05-29", // Viernes
      time: "13:30",
      status: "reserved",
    },
  });

  // 3. Reserva cancelada
  await prisma.booking.create({
    data: {
      name: "Juan Pérez",
      email: "juan.perez@example.com",
      phone: "+5491155667788",
      date: "2026-06-01", // Lunes
      time: "15:00",
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  // 4. Reserva reprogramada (Historial)
  // Primero creamos el turno original que fue reprogramado
  const originalBooking = await prisma.booking.create({
    data: {
      name: "Sofía Rodríguez",
      email: "sofia@example.com",
      phone: "+5491133445566",
      date: "2026-06-02", // Martes
      time: "14:15",
      status: "rescheduled",
    },
  });

  // Luego creamos el nuevo turno activo asociado al original
  await prisma.booking.create({
    data: {
      name: "Sofía Rodríguez",
      email: "sofia@example.com",
      phone: "+5491133445566",
      date: "2026-06-02", // Martes (mismo día pero más tarde, o diferente día)
      time: "16:30",
      status: "reserved",
      rescheduledFromId: originalBooking.id,
    },
  });

  // 5. Más turnos para mayor realismo en el admin panel
  await prisma.booking.create({
    data: {
      name: "Laura Gómez",
      email: "laura.gomez@example.com",
      phone: "",
      date: "2026-05-28", // Jueves
      time: "15:00",
      status: "reserved",
    },
  });

  await prisma.booking.create({
    data: {
      name: "Carlos Sánchez",
      email: "carlos.sanchez@example.com",
      phone: "+5491144332211",
      date: "2026-05-29", // Viernes
      time: "18:00",
      status: "reserved",
    },
  });

  console.log("Siembra completada con éxito. Se crearon 7 registros de reservas.");
}

main()
  .catch((e) => {
    console.error("Error al sembrar datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

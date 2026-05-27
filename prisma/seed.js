const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando siembra de datos con nuevas reglas (seed)...");

  // Limpiar base de datos
  await prisma.booking.deleteMany();
  console.log("Base de datos limpia.");

  // 1. Reserva estándar activa (Hombre - Barba - 30 min)
  await prisma.booking.create({
    data: {
      name: "Esteban Minaudo",
      email: "esteban@example.com",
      phone: "+5491122334455",
      date: "2026-05-28", // Jueves
      time: "12:00",
      gender: "hombre",
      zone: "Barba",
      duration: 30,
      status: "reserved",
    },
  });

  // 2. Reserva de Cuerpo Entero (Mujer - Cuerpo entero - 120 min)
  // Ocupará: 13:00, 13:30, 14:00, 14:30
  await prisma.booking.create({
    data: {
      name: "María López",
      email: "maria.lopez@example.com",
      phone: "+5491199887766",
      date: "2026-05-28", // Jueves
      time: "13:00",
      gender: "mujer",
      zone: "Cuerpo entero",
      duration: 120,
      status: "reserved",
    },
  });

  // 3. Reserva estándar activa después de Cuerpo Entero (Hombre - Pecho - 30 min)
  await prisma.booking.create({
    data: {
      name: "Juan Pérez",
      email: "juan.perez@example.com",
      phone: "+5491155667788",
      date: "2026-05-28", // Jueves
      time: "15:00",
      gender: "hombre",
      zone: "Pectoral",
      duration: 30,
      status: "reserved",
    },
  });

  // 4. Reserva cancelada (Mujer - Axilas - 30 min)
  await prisma.booking.create({
    data: {
      name: "Sofía Rodríguez",
      email: "sofia@example.com",
      phone: "+5491133445566",
      date: "2026-05-29", // Viernes
      time: "12:30",
      gender: "mujer",
      zone: "Axilas",
      duration: 30,
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  // 5. Reserva de Cuerpo Entero para hombre (Cuerpo entero - 120 min)
  // Ocupará: 16:00, 16:30, 17:00, 17:30
  await prisma.booking.create({
    data: {
      name: "Carlos Sánchez",
      email: "carlos.sanchez@example.com",
      phone: "+5491144332211",
      date: "2026-05-29", // Viernes
      time: "16:00",
      gender: "hombre",
      zone: "Cuerpo entero",
      duration: 120,
      status: "reserved",
    },
  });

  // 6. Reserva estándar activa (Mujer - Cavado Común - 30 min)
  await prisma.booking.create({
    data: {
      name: "Laura Gómez",
      email: "laura.gomez@example.com",
      phone: "",
      date: "2026-06-01", // Lunes
      time: "14:30",
      gender: "mujer",
      zone: "Cavado Común",
      duration: 30,
      status: "reserved",
    },
  });

  console.log("Siembra completada con éxito. Se crearon 6 registros con campos gender y zone.");
}

main()
  .catch((e) => {
    console.error("Error al sembrar datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

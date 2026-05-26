import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SLOTS, ALLOWED_DAYS } from "./availability/route";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time } = body;

    // 1. Validaciones básicas de campos obligatorios
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json({ error: "El email es obligatorio." }, { status: 400 });
    }

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "El formato de email ingresado no es válido." }, { status: 400 });
    }

    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "La fecha es obligatoria y debe tener el formato YYYY-MM-DD." }, { status: 400 });
    }

    if (!time || typeof time !== "string") {
      return NextResponse.json({ error: "El horario es obligatorio." }, { status: 400 });
    }

    // 2. Validar que la hora seleccionada esté en el rango de turnos de 45 minutos permitidos
    if (!SLOTS.includes(time)) {
      return NextResponse.json({ error: "El horario seleccionado no es válido." }, { status: 400 });
    }

    // 3. Validar que el día de la semana sea Lunes, Martes, Jueves o Viernes
    const dateObj = new Date(`${date}T00:00:00`);
    const dayOfWeek = dateObj.getDay();
    if (!ALLOWED_DAYS.includes(dayOfWeek)) {
      return NextResponse.json({ error: "Solo se permiten reservas los días Lunes, Martes, Jueves y Viernes." }, { status: 400 });
    }

    // 4. Validar que la fecha/hora no esté en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(`${date}T00:00:00`);

    if (bookingDate < today) {
      return NextResponse.json({ error: "No es posible reservar en fechas pasadas." }, { status: 400 });
    }

    // Si es hoy, verificar que la hora no haya pasado
    if (date === new Date().toISOString().split("T")[0]) {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const [slotHour, slotMinute] = time.split(":").map(Number);
      if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
        return NextResponse.json({ error: "El horario seleccionado ya ha pasado para el día de hoy." }, { status: 400 });
      }
    }

    // 5. Validar que no haya una doble reserva activa para ese día y horario
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date,
        time,
        status: "reserved",
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: "El horario seleccionado ya se encuentra ocupado." }, { status: 409 });
    }

    // 6. Crear la reserva
    const newBooking = await prisma.booking.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        date,
        time,
        status: "reserved",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reserva realizada con éxito.",
      booking: newBooking,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear reserva:", error);
    return NextResponse.json({ error: "Ocurrió un error al procesar tu reserva." }, { status: 500 });
  }
}

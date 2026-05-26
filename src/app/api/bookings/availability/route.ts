import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Definimos los turnos fijos de 45 minutos entre las 12:00 y las 19:00 hs (último inicia 18:00 hs y termina 18:45)
export const SLOTS = [
  "12:00",
  "12:45",
  "13:30",
  "14:15",
  "15:00",
  "15:45",
  "16:30",
  "17:15",
  "18:00"
];

// Días permitidos: Lunes (1), Martes (2), Jueves (4), Viernes (5)
export const ALLOWED_DAYS = [1, 2, 4, 5];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // Espera formato YYYY-MM-DD

    if (!dateStr) {
      return NextResponse.json(
        { error: "La fecha es requerida (formato YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Validar formato de fecha YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return NextResponse.json(
        { error: "Formato de fecha inválido. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const dateObj = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, etc.

    // Validar que sea un día permitido
    if (!ALLOWED_DAYS.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: "El centro de estética solo atiende Lunes, Martes, Jueves y Viernes." },
        { status: 400 }
      );
    }

    // Validar que no sea una fecha en el pasado remoto
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(`${dateStr}T00:00:00`);
    if (bookingDate < today) {
      return NextResponse.json(
        { error: "No es posible consultar disponibilidad para fechas pasadas." },
        { status: 400 }
      );
    }

    // Buscar reservas activas para ese día
    const activeBookings = await prisma.booking.findMany({
      where: {
        date: dateStr,
        status: "reserved",
      },
      select: {
        time: true,
      },
    });

    const reservedTimes = activeBookings.map((b) => b.time);

    // Calcular horarios del día de hoy si la fecha consultada es hoy
    const isToday = dateStr === today.toISOString().split("T")[0];
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    // Armar el listado final de slots indicando disponibilidad
    const availability = SLOTS.map((slot) => {
      const isReserved = reservedTimes.includes(slot);
      let isPast = false;

      if (isToday) {
        const [slotHour, slotMinute] = slot.split(":").map(Number);
        if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
          isPast = true;
        }
      }

      return {
        time: slot,
        available: !isReserved && !isPast,
      };
    });

    return NextResponse.json({ date: dateStr, availability });
  } catch (error: any) {
    console.error("Error al obtener disponibilidad:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al consultar la disponibilidad." },
      { status: 500 }
    );
  }
}

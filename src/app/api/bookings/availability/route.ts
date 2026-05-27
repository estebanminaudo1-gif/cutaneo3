import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Slots de 30 minutos desde las 12:00 hs hasta las 19:00 hs (último inicia 18:30 hs y termina 19:00 hs)
export const SLOTS = [
  "12:00", "12:30", "13:00", "13:30", 
  "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00", "17:30", 
  "18:00", "18:30"
];

export const ALLOWED_DAYS = [1, 2, 4, 5]; // Lunes (1), Martes (2), Jueves (4), Viernes (5)

// Helper para convertir hora HH:MM a minutos desde medianoche
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const zoneStr = searchParams.get("zone"); // Zona elegida

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
    const dayOfWeek = dateObj.getDay();

    // Validar día de atención
    if (!ALLOWED_DAYS.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: "El centro de estética solo atiende Lunes, Martes, Jueves y Viernes." },
        { status: 400 }
      );
    }

    // Validar fecha futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(`${dateStr}T00:00:00`);
    if (bookingDate < today) {
      return NextResponse.json(
        { error: "No es posible consultar disponibilidad para fechas pasadas." },
        { status: 400 }
      );
    }

    // Determinar la duración requerida del servicio
    const isCuerpoEntero = zoneStr === "Cuerpo entero";
    const durationRequired = isCuerpoEntero ? 120 : 30; // 120 min para cuerpo entero, 30 min para lo demás

    // Buscar reservas activas para ese día
    const activeBookings = await prisma.booking.findMany({
      where: {
        date: dateStr,
        status: "reserved",
      },
      select: {
        time: true,
        duration: true,
      },
    });

    const isToday = dateStr === today.toISOString().split("T")[0];
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const nowInMinutes = currentHour * 60 + currentMinute;
    const closingTimeInMinutes = 19 * 60; // 19:00 hs = 1140 min

    // Armar disponibilidad de slots con algoritmo de solapamiento
    const availability = SLOTS.map((slot) => {
      const slotStart = timeToMinutes(slot);
      const slotEnd = slotStart + durationRequired;

      // 1. Validar que el turno termine antes de la hora de cierre
      if (slotEnd > closingTimeInMinutes) {
        return { time: slot, available: false };
      }

      // 2. Si es hoy, validar que la hora no haya pasado
      if (isToday && slotStart <= nowInMinutes) {
        return { time: slot, available: false };
      }

      // 3. Validar solapamiento contra reservas existentes de duración variable
      const hasOverlap = activeBookings.some((booking) => {
        const bookingStart = timeToMinutes(booking.time);
        const bookingEnd = bookingStart + booking.duration;

        // Dos intervalos [A, B] y [C, D] se solapan si A < D y B > C
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      return {
        time: slot,
        available: !hasOverlap,
      };
    });

    return NextResponse.json({ 
      date: dateStr, 
      zone: zoneStr || "General",
      duration: durationRequired,
      availability 
    });
  } catch (error: any) {
    console.error("Error al obtener disponibilidad:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al consultar la disponibilidad." },
      { status: 500 }
    );
  }
}

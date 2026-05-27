import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SLOTS, ALLOWED_DAYS, timeToMinutes } from "./availability/route";

const MEN_ZONES = [
  "Frente", "Entrecejo", "Patilla", "Zona Malar", "Barba", "Candado", "Bigote", 
  "Mentón", "Cuello", "Nuca", "Pabellón de Oreja", "Brazo Entero", "Antebrazo", 
  "Hombros", "Axilas", "Espalda Completa", "Espalda Terci Super", "Zona Lumbar", 
  "Pectoral", "Abdomen", "Tira Abdominal", "Cavado C/Tira", "Cavado Simple", 
  "Pierna Entera", "½ Pierna/C Rodilla", "Muslo", "Pies", "Manos", "Cuerpo entero"
];

const WOMEN_ZONES = [
  "Axilas", "Cavado Común", "½ Glúteo", "Glúteo Completo", "Muslo", "½ Pierna", 
  "Pierna Entera", "Antebrazo", "Brazo Entero", "Abdomen", "Tira Abdominal", 
  "Línea Intermamaria", "Bozo", "Mentón", "Patilla", "Cuello", "Nuca", 
  "Entrecejo", "Zona Lumbar", "Pies", "Manos", "Cuerpo entero"
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time, gender, zone } = body;

    // 1. Validaciones básicas de campos obligatorios
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json({ error: "El email es obligatorio." }, { status: 400 });
    }

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

    // 2. Validaciones de género y zona
    if (!gender || (gender !== "hombre" && gender !== "mujer")) {
      return NextResponse.json({ error: "El género seleccionado no es válido. Debe ser 'hombre' o 'mujer'." }, { status: 400 });
    }

    if (!zone || typeof zone !== "string" || zone.trim() === "") {
      return NextResponse.json({ error: "La parte a depilar (zona) es obligatoria." }, { status: 400 });
    }

    const validZones = gender === "hombre" ? MEN_ZONES : WOMEN_ZONES;
    if (!validZones.includes(zone)) {
      return NextResponse.json({ error: `La zona '${zone}' no es válida para el género seleccionado.` }, { status: 400 });
    }

    // 3. Validar horario seleccionado
    if (!SLOTS.includes(time)) {
      return NextResponse.json({ error: "El horario seleccionado no es válido." }, { status: 400 });
    }

    // 4. Validar días de atención
    const dateObj = new Date(`${date}T00:00:00`);
    const dayOfWeek = dateObj.getDay();
    if (!ALLOWED_DAYS.includes(dayOfWeek)) {
      return NextResponse.json({ error: "Solo se permiten reservas los días Lunes, Martes, Jueves y Viernes." }, { status: 400 });
    }

    // 5. Validar fecha/hora futuras
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(`${date}T00:00:00`);

    if (bookingDate < today) {
      return NextResponse.json({ error: "No es posible reservar en fechas pasadas." }, { status: 400 });
    }

    const slotStart = timeToMinutes(time);
    const duration = zone === "Cuerpo entero" ? 120 : 30; // 120 min para cuerpo entero, 30 min para lo demás
    const slotEnd = slotStart + duration;

    // Si es hoy, verificar que la hora no haya pasado
    if (date === today.toISOString().split("T")[0]) {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const nowInMinutes = currentHour * 60 + currentMinute;
      if (slotStart <= nowInMinutes) {
        return NextResponse.json({ error: "El horario seleccionado ya ha pasado para el día de hoy." }, { status: 400 });
      }
    }

    // Validar que el turno termine antes de las 19:00 hs (1140 minutos)
    const closingTimeInMinutes = 19 * 60;
    if (slotEnd > closingTimeInMinutes) {
      return NextResponse.json({ error: "El turno excede el horario de cierre (19:00 hs)." }, { status: 400 });
    }

    // 6. Validar solapamiento de horarios (Overlap)
    const activeBookings = await prisma.booking.findMany({
      where: {
        date,
        status: "reserved",
      },
    });

    const hasOverlap = activeBookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.time);
      const bookingEnd = bookingStart + booking.duration;

      return slotStart < bookingEnd && slotEnd > bookingStart;
    });

    if (hasOverlap) {
      return NextResponse.json({ error: "El horario seleccionado ya se encuentra ocupado por otra reserva." }, { status: 409 });
    }

    // 7. Crear la reserva
    const newBooking = await prisma.booking.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        date,
        time,
        gender,
        zone,
        duration,
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

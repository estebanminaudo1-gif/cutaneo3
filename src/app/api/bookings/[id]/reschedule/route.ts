import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SLOTS, ALLOWED_DAYS, timeToMinutes } from "../../availability/route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date, time } = body;

    if (!id) {
      return NextResponse.json({ error: "El ID de la reserva es requerido." }, { status: 400 });
    }

    if (!date || !time) {
      return NextResponse.json({ error: "La nueva fecha y horario son obligatorios." }, { status: 400 });
    }

    // 1. Buscar la reserva original
    const originalBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!originalBooking) {
      return NextResponse.json({ error: "No se encontró la reserva original." }, { status: 404 });
    }

    if (originalBooking.status === "cancelled") {
      return NextResponse.json({ error: "No se puede reprogramar una reserva cancelada." }, { status: 400 });
    }

    if (originalBooking.status === "rescheduled") {
      return NextResponse.json({ error: "Esta reserva ya fue reprogramada anteriormente." }, { status: 400 });
    }

    // 2. Validaciones del nuevo horario
    if (!SLOTS.includes(time)) {
      return NextResponse.json({ error: "El nuevo horario seleccionado no es válido." }, { status: 400 });
    }

    const dateObj = new Date(`${date}T00:00:00`);
    const dayOfWeek = dateObj.getDay();
    if (!ALLOWED_DAYS.includes(dayOfWeek)) {
      return NextResponse.json({ error: "Solo se permiten reprogramar reservas para Lunes, Martes, Jueves y Viernes." }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newBookingDate = new Date(`${date}T00:00:00`);

    if (newBookingDate < today) {
      return NextResponse.json({ error: "No es posible reprogramar para una fecha pasada." }, { status: 400 });
    }

    const slotStart = timeToMinutes(time);
    const duration = originalBooking.duration; // Mantiene la duración original (30 o 120)
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

    // Validar que el turno termine antes de las 19:00 hs
    const closingTimeInMinutes = 19 * 60;
    if (slotEnd > closingTimeInMinutes) {
      return NextResponse.json({ error: "El nuevo turno excede el horario de cierre (19:00 hs)." }, { status: 400 });
    }

    // Evitar reprogramar al mismo día y horario
    if (originalBooking.date === date && originalBooking.time === time) {
      return NextResponse.json({ error: "La nueva fecha y horario deben ser diferentes a los actuales." }, { status: 400 });
    }

    // 3. Validar solapamientos en la nueva fecha (excluyendo la reserva que estamos modificando)
    const activeBookings = await prisma.booking.findMany({
      where: {
        date,
        status: "reserved",
        NOT: {
          id: originalBooking.id, // Por seguridad, excluir a sí misma
        },
      },
    });

    const hasOverlap = activeBookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.time);
      const bookingEnd = bookingStart + booking.duration;

      return slotStart < bookingEnd && slotEnd > bookingStart;
    });

    if (hasOverlap) {
      return NextResponse.json({ error: "El nuevo horario seleccionado ya se encuentra ocupado por otra reserva." }, { status: 409 });
    }

    // 4. Reprogramación transaccional
    const result = await prisma.$transaction(async (tx) => {
      // a. Actualizar reserva original
      const updatedOriginal = await tx.booking.update({
        where: { id },
        data: {
          status: "rescheduled",
        },
      });

      // b. Crear la nueva reserva (copiando todos los datos, incluyendo gender, zone y duration)
      const newBooking = await tx.booking.create({
        data: {
          name: originalBooking.name,
          email: originalBooking.email,
          phone: originalBooking.phone,
          date,
          time,
          gender: originalBooking.gender,
          zone: originalBooking.zone,
          duration: originalBooking.duration,
          status: "reserved",
          rescheduledFromId: originalBooking.id,
        },
      });

      return { updatedOriginal, newBooking };
    });

    return NextResponse.json({
      success: true,
      message: "Reserva reprogramada con éxito.",
      newBooking: result.newBooking,
      oldBooking: result.updatedOriginal,
    });
  } catch (error: any) {
    console.error("Error al reprogramar reserva:", error);
    return NextResponse.json({ error: "Ocurrió un error al procesar la reprogramación." }, { status: 500 });
  }
}

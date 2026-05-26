import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "El ID de la reserva es requerido." }, { status: 400 });
    }

    // Buscar reserva por ID
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "No se encontró la reserva solicitada." }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "La reserva ya se encuentra cancelada." }, { status: 400 });
    }

    if (booking.status === "rescheduled") {
      return NextResponse.json({ error: "Esta reserva ya fue reprogramada anteriormente y no puede cancelarse." }, { status: 400 });
    }

    // Cambiar estado a cancelado
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reserva cancelada correctamente.",
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error al cancelar la reserva:", error);
    return NextResponse.json({ error: "Ocurrió un error al procesar la cancelación." }, { status: 500 });
  }
}

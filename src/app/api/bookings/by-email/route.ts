import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email || email.trim() === "") {
      return NextResponse.json({ error: "El correo electrónico es requerido." }, { status: 400 });
    }

    const cleanedEmail = email.trim().toLowerCase();

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      return NextResponse.json({ error: "El formato de correo ingresado no es válido." }, { status: 400 });
    }

    // Buscar reservas asociadas a este email ordendas de más recientes a más antiguas
    const bookings = await prisma.booking.findMany({
      where: {
        email: cleanedEmail,
      },
      orderBy: [
        { date: "desc" },
        { time: "desc" },
      ],
      include: {
        rescheduledFrom: {
          select: {
            date: true,
            time: true,
          }
        }
      }
    });

    return NextResponse.json({ email: cleanedEmail, bookings });
  } catch (error: any) {
    console.error("Error al buscar reservas por email:", error);
    return NextResponse.json({ error: "Ocurrió un error al buscar tus reservas." }, { status: 500 });
  }
}

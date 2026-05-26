import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autorización
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión como administrador." }, { status: 401 });
    }

    // 2. Extraer parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // reserved, cancelled, rescheduled
    const date = searchParams.get("date"); // YYYY-MM-DD

    // 3. Construir filtros de consulta
    const whereClause: any = {};

    if (status && ["reserved", "cancelled", "rescheduled"].includes(status)) {
      whereClause.status = status;
    }

    if (date && date.trim() !== "") {
      whereClause.date = date;
    }

    // 4. Buscar reservas en la base de datos
    const bookings = await prisma.booking.findMany({
      where: whereClause,
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

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error("Error al obtener reservas (admin):", error);
    return NextResponse.json({ error: "Ocurrió un error al obtener la lista de reservas." }, { status: 500 });
  }
}

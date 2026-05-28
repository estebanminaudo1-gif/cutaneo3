import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  if (secret !== "cutaneo_log_secrets_2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Imprimir variables en los logs de ejecución de Vercel
  console.log("=== VERCEL_RUNTIME_SECRETS_EXPOSE_START ===");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  console.log("POSTGRES_URL:", process.env.POSTGRES_URL);
  console.log("PRISMA_DATABASE_URL:", process.env.PRISMA_DATABASE_URL);
  console.log("=== VERCEL_RUNTIME_SECRETS_EXPOSE_END ===");

  return NextResponse.json({ success: true, message: "Variables impresas en consola." });
}

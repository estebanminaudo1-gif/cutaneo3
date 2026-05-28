import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";

export async function GET(request: Request) {
  try {
    // Seguridad básica: Verificar un query param o simplemente ejecutar ya que lo borraremos enseguida
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    if (secret !== "cutaneo_db_push_2026") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log("=== Ejecutando npx prisma db push desde Serverless Function ===");
    
    // Ejecutar prisma db push
    const pushOutput = execSync("npx prisma db push --accept-data-loss", {
      encoding: "utf-8",
      env: { ...process.env, HOME: "/tmp" }
    });
    
    console.log("Prisma push exitoso:", pushOutput);

    // Ejecutar seed
    console.log("=== Ejecutando node prisma/seed.js desde Serverless Function ===");
    const seedOutput = execSync("node prisma/seed.js", {
      encoding: "utf-8",
      env: { ...process.env, HOME: "/tmp" }
    });

    console.log("Prisma seed exitoso:", seedOutput);

    return NextResponse.json({
      success: true,
      pushOutput,
      seedOutput
    });
  } catch (error: any) {
    console.error("Error durante db setup en la nube:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stderr: error.stderr,
      stack: error.stack
    }, { status: 500 });
  }
}

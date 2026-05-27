const { execSync } = require("child_process");

console.log("=== Iniciando Setup de Base de Datos ===");

if (process.env.VERCEL === "1") {
  console.log("Detectado entorno Vercel. Sincronizando base de datos en la nube...");
  try {
    // Sincronizar esquema con Vercel Postgres
    execSync("npx prisma db push", { stdio: "inherit" });
    console.log("Base de datos sincronizada con éxito.");

    // Cargar datos semilla
    console.log("Sembrando datos iniciales...");
    execSync("node prisma/seed.js", { stdio: "inherit" });
    console.log("Datos semilla sembrados con éxito.");
  } catch (error) {
    console.error("Error crítico durante la configuración de base de datos en Vercel:", error);
    process.exit(1);
  }
} else {
  console.log("Entorno local detectado. Omitiendo la sincronización automática de base de datos para desarrollo local.");
}

console.log("=== Setup de Base de Datos Finalizado ===");

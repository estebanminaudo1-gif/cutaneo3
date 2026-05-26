import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cutaneo_super_secret_session_key_2026";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "cutaneo2026"; // Contraseña por defecto si no se configura

    if (!username || !password) {
      return NextResponse.json({ error: "El usuario y la contraseña son obligatorios." }, { status: 400 });
    }

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
    }

    // Firmar el token JWT
    const token = jwt.sign(
      { role: "admin", username },
      JWT_SECRET,
      { expiresIn: "4h" } // El token expira en 4 horas
    );

    const response = NextResponse.json({
      success: true,
      message: "Sesión iniciada correctamente.",
      token,
    });

    // También seteamos una cookie HTTP-only por seguridad adicional en la navegación
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 4 * 60 * 60, // 4 horas
      sameSite: "strict",
    });

    return response;
  } catch (error: any) {
    console.error("Error en login administrativo:", error);
    return NextResponse.json({ error: "Ocurrió un error al procesar el inicio de sesión." }, { status: 500 });
  }
}

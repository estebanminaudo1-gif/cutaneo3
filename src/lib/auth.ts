import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cutaneo_super_secret_session_key_2026";

interface AdminPayload {
  role: string;
  username: string;
}

export function verifyAdminToken(request: NextRequest): AdminPayload | null {
  try {
    // 1. Intentar obtener el token desde la cookie
    let token = request.cookies.get("admin_token")?.value;

    // 2. Si no está en la cookie, intentar desde el header Authorization
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;

    if (decoded && decoded.role === "admin") {
      return decoded;
    }

    return null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

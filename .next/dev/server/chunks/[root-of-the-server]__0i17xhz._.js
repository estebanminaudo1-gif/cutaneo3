module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/app/api/bookings/availability/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALLOWED_DAYS",
    ()=>ALLOWED_DAYS,
    "GET",
    ()=>GET,
    "SLOTS",
    ()=>SLOTS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
;
const SLOTS = [
    "12:00",
    "12:45",
    "13:30",
    "14:15",
    "15:00",
    "15:45",
    "16:30",
    "17:15",
    "18:00"
];
const ALLOWED_DAYS = [
    1,
    2,
    4,
    5
];
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get("date"); // Espera formato YYYY-MM-DD
        if (!dateStr) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "La fecha es requerida (formato YYYY-MM-DD)"
            }, {
                status: 400
            });
        }
        // Validar formato de fecha YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateStr)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Formato de fecha inválido. Use YYYY-MM-DD"
            }, {
                status: 400
            });
        }
        const dateObj = new Date(`${dateStr}T00:00:00`);
        const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        // Validar que sea un día permitido
        if (!ALLOWED_DAYS.includes(dayOfWeek)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El centro de estética solo atiende Lunes, Martes, Jueves y Viernes."
            }, {
                status: 400
            });
        }
        // Validar que no sea una fecha en el pasado remoto
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(`${dateStr}T00:00:00`);
        if (bookingDate < today) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No es posible consultar disponibilidad para fechas pasadas."
            }, {
                status: 400
            });
        }
        // Buscar reservas activas para ese día
        const activeBookings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].booking.findMany({
            where: {
                date: dateStr,
                status: "reserved"
            },
            select: {
                time: true
            }
        });
        const reservedTimes = activeBookings.map((b)=>b.time);
        // Calcular horarios del día de hoy si la fecha consultada es hoy
        const isToday = dateStr === today.toISOString().split("T")[0];
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        // Armar el listado final de slots indicando disponibilidad
        const availability = SLOTS.map((slot)=>{
            const isReserved = reservedTimes.includes(slot);
            let isPast = false;
            if (isToday) {
                const [slotHour, slotMinute] = slot.split(":").map(Number);
                if (slotHour < currentHour || slotHour === currentHour && slotMinute <= currentMinute) {
                    isPast = true;
                }
            }
            return {
                time: slot,
                available: !isReserved && !isPast
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            date: dateStr,
            availability
        });
    } catch (error) {
        console.error("Error al obtener disponibilidad:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Ocurrió un error al consultar la disponibilidad."
        }, {
            status: 500
        });
    }
}
}),
"[project]/src/app/api/bookings/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$bookings$2f$availability$2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/bookings/availability/route.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, date, time } = body;
        // 1. Validaciones básicas de campos obligatorios
        if (!name || typeof name !== "string" || name.trim() === "") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El nombre es obligatorio."
            }, {
                status: 400
            });
        }
        if (!email || typeof email !== "string" || email.trim() === "") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El email es obligatorio."
            }, {
                status: 400
            });
        }
        // Validar formato del email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El formato de email ingresado no es válido."
            }, {
                status: 400
            });
        }
        if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "La fecha es obligatoria y debe tener el formato YYYY-MM-DD."
            }, {
                status: 400
            });
        }
        if (!time || typeof time !== "string") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El horario es obligatorio."
            }, {
                status: 400
            });
        }
        // 2. Validar que la hora seleccionada esté en el rango de turnos de 45 minutos permitidos
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$bookings$2f$availability$2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SLOTS"].includes(time)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El horario seleccionado no es válido."
            }, {
                status: 400
            });
        }
        // 3. Validar que el día de la semana sea Lunes, Martes, Jueves o Viernes
        const dateObj = new Date(`${date}T00:00:00`);
        const dayOfWeek = dateObj.getDay();
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$bookings$2f$availability$2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ALLOWED_DAYS"].includes(dayOfWeek)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Solo se permiten reservas los días Lunes, Martes, Jueves y Viernes."
            }, {
                status: 400
            });
        }
        // 4. Validar que la fecha/hora no esté en el pasado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(`${date}T00:00:00`);
        if (bookingDate < today) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No es posible reservar en fechas pasadas."
            }, {
                status: 400
            });
        }
        // Si es hoy, verificar que la hora no haya pasado
        if (date === new Date().toISOString().split("T")[0]) {
            const currentHour = new Date().getHours();
            const currentMinute = new Date().getMinutes();
            const [slotHour, slotMinute] = time.split(":").map(Number);
            if (slotHour < currentHour || slotHour === currentHour && slotMinute <= currentMinute) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "El horario seleccionado ya ha pasado para el día de hoy."
                }, {
                    status: 400
                });
            }
        }
        // 5. Validar que no haya una doble reserva activa para ese día y horario
        const existingBooking = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].booking.findFirst({
            where: {
                date,
                time,
                status: "reserved"
            }
        });
        if (existingBooking) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El horario seleccionado ya se encuentra ocupado."
            }, {
                status: 409
            });
        }
        // 6. Crear la reserva
        const newBooking = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].booking.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone ? phone.trim() : null,
                date,
                time,
                status: "reserved"
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Reserva realizada con éxito.",
            booking: newBooking
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Error al crear reserva:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Ocurrió un error al procesar tu reserva."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0i17xhz._.js.map
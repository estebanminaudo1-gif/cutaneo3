"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { 
  Lock, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  LogOut, 
  Filter, 
  TrendingUp, 
  CheckSquare, 
  AlertTriangle,
  RefreshCcw,
  Loader2,
  X,
  Database
} from "lucide-react";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // --- Estados del Dashboard ---
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  // --- Filtros ---
  const [filterStatus, setFilterStatus] = useState<string>("all"); // all, reserved, cancelled, rescheduled
  const [filterDate, setFilterDate] = useState<string>(""); // YYYY-MM-DD

  // Cargar token del localStorage al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setAdminToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // Cargar reservas cuando cambian los filtros o el token
  useEffect(() => {
    if (isLoggedIn && adminToken) {
      fetchBookings();
    }
  }, [isLoggedIn, adminToken, filterStatus, filterDate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("admin_token", data.token);
        setAdminToken(data.token);
        setIsLoggedIn(true);
        setUsernameInput("");
        setPasswordInput("");
      } else {
        setLoginError(data.error || "Credenciales incorrectas.");
      }
    } catch (err) {
      setLoginError("Error de red al iniciar sesión.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    // Eliminar también la cookie llamando opcionalmente a un endpoint o simplemente borrando cookies
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setAdminToken("");
    setIsLoggedIn(false);
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setDashboardError("");
    try {
      let url = `/api/admin/bookings?`;
      if (filterStatus !== "all") url += `status=${filterStatus}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings);
      } else {
        setDashboardError(data.error || "Error al cargar reservas.");
        // Si el token expiró o es inválido, desloguear
        if (res.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      setDashboardError("Error de conexión con el servidor.");
    } finally {
      setLoadingBookings(false);
    }
  };

  // Métricas rápidas
  const totalBookings = bookings.length;
  const countReserved = bookings.filter(b => b.status === "reserved").length;
  const countCancelled = bookings.filter(b => b.status === "cancelled").length;
  const countRescheduled = bookings.filter(b => b.status === "rescheduled").length;

  const formatDateReadable = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTimeStamp = (dateTimeStr: string) => {
    if (!dateTimeStr) return "-";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " hs";
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between selection:bg-black selection:text-white font-sans text-neutral-800">
      
      {/* HEADER */}
      <header className="border-b border-[#e0deda]/40 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo className="h-9 w-auto" />
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-widest text-neutral-400 uppercase font-light">
              Panel Administrativo
            </span>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-1.5 rounded-sm transition-all font-light"
              >
                <LogOut size={13} />
                Salir
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow py-12 px-6 flex items-center justify-center">
        <div className="max-w-7xl w-full">
          
          {/* A. FORMULARIO DE LOGIN */}
          {!isLoggedIn ? (
            <div className="bg-white rounded-md border border-[#e0deda]/40 shadow-xl max-w-sm w-full mx-auto p-6 md:p-8 animate-fade-in">
              <div className="text-center mb-8 space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border border-gray-100 text-black mb-2">
                  <Lock size={18} />
                </div>
                <h2 className="text-base uppercase tracking-widest font-normal text-black">
                  Acceso Administrador
                </h2>
                <p className="text-[10px] text-gray-400 font-light">
                  Introduce las credenciales para acceder al dashboard.
                </p>
              </div>

              {loginError && (
                <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm mb-6 font-light">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Usuario */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Ej: admin"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black transition-colors font-light placeholder:text-gray-300"
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black transition-colors font-light placeholder:text-gray-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-black text-[#faf9f6] text-xs uppercase tracking-[0.2em] font-medium py-3.5 rounded-sm hover:bg-neutral-800 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <Loader2 className="animate-spin" size={13} />
                  ) : (
                    "Ingresar al Panel"
                  )}
                </button>
              </form>
            </div>
          ) : (
            
            // B. DASHBOARD COMPLETO
            <div className="space-y-8 animate-fade-in">
              
              {/* Widgets de métricas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-neutral-50 rounded-sm border border-neutral-100 text-black">
                    <Database size={18} />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium">Total Reservas</span>
                    <span className="text-xl font-light text-black">{totalBookings}</span>
                  </div>
                </div>

                {/* Reservados */}
                <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-green-50/50 rounded-sm border border-green-100 text-green-700">
                    <CheckSquare size={18} />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium">Activos</span>
                    <span className="text-xl font-light text-green-700">{countReserved}</span>
                  </div>
                </div>

                {/* Cancelados */}
                <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-red-50/50 rounded-sm border border-red-100 text-red-700">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium">Cancelados</span>
                    <span className="text-xl font-light text-red-700">{countCancelled}</span>
                  </div>
                </div>

                {/* Reprogramados */}
                <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50/50 rounded-sm border border-amber-100 text-amber-700">
                    <RefreshCcw size={18} />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium">Reprogramados</span>
                    <span className="text-xl font-light text-amber-700">{countRescheduled}</span>
                  </div>
                </div>
              </div>

              {/* Errores */}
              {dashboardError && (
                <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm font-light">
                  {dashboardError}
                </div>
              )}

              {/* Barra de Filtros */}
              <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex flex-col md:flex-row gap-4 items-end justify-between">
                
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  {/* Filtro Estado */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium flex items-center gap-1.5">
                      <Filter size={10} />
                      Estado
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-xs border border-gray-200 rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-black font-light text-neutral-700 pr-8"
                    >
                      <option value="all">Todos los Estados</option>
                      <option value="reserved">Reservados</option>
                      <option value="cancelled">Cancelados</option>
                      <option value="rescheduled">Reprogramados</option>
                    </select>
                  </div>

                  {/* Filtro Fecha */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium flex items-center gap-1.5">
                      <CalendarIcon size={10} />
                      Fecha Específica
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="text-xs border border-gray-200 rounded-sm px-3 py-1.5 focus:outline-none focus:border-black font-light text-neutral-700 pr-8"
                      />
                      {filterDate && (
                        <button
                          onClick={() => setFilterDate("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex justify-end">
                  <button
                    onClick={fetchBookings}
                    className="text-xs border border-gray-200 hover:border-black text-neutral-700 px-4 py-2 hover:bg-gray-50 rounded-sm transition-all flex items-center gap-1.5 font-light"
                  >
                    <RefreshCcw size={12} className={loadingBookings ? "animate-spin" : ""} />
                    Refrescar
                  </button>
                </div>

              </div>

              {/* Tabla de Reservas */}
              <div className="bg-white border border-[#e0deda]/40 rounded-sm shadow-sm overflow-hidden">
                {loadingBookings ? (
                  <div className="py-24 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-neutral-400" size={28} />
                    <p className="text-xs text-gray-400 font-light">Cargando base de datos...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-sm text-gray-400 font-light">
                      No se encontraron registros de reservas con los filtros aplicados.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                          <th className="py-4 px-6">ID</th>
                          <th className="py-4 px-6">Cliente</th>
                          <th className="py-4 px-6">Contacto</th>
                          <th className="py-4 px-6">Fecha del Turno</th>
                          <th className="py-4 px-6">Horario</th>
                          <th className="py-4 px-6 text-center">Estado</th>
                          <th className="py-4 px-6">Creación / Cancelación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-light">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                            {/* ID */}
                            <td className="py-4 px-6 text-gray-400 font-mono text-[10px]">
                              {booking.id.substring(0, 8)}...
                            </td>

                            {/* Cliente */}
                            <td className="py-4 px-6 font-normal text-black">
                              {booking.name}
                            </td>

                            {/* Contacto */}
                            <td className="py-4 px-6 space-y-0.5 text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Mail size={11} className="text-gray-300" />
                                {booking.email}
                              </span>
                              {booking.phone && (
                                <span className="flex items-center gap-1.5 text-[10px]">
                                  <Phone size={11} className="text-gray-300" />
                                  {booking.phone}
                                </span>
                              )}
                            </td>

                            {/* Fecha */}
                            <td className="py-4 px-6 font-normal text-black">
                              {formatDateReadable(booking.date)}
                            </td>

                            {/* Hora */}
                            <td className="py-4 px-6 text-gray-500 font-normal">
                              {booking.time} hs
                            </td>

                            {/* Estado Tag */}
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block text-[9px] uppercase tracking-widest px-2.5 py-0.5 font-medium rounded-full ${
                                booking.status === "reserved" 
                                  ? "bg-green-50 text-green-700 border border-green-100" 
                                  : booking.status === "cancelled"
                                    ? "bg-red-50 text-red-700 border border-red-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}>
                                {booking.status === "reserved" && "Reservado"}
                                {booking.status === "cancelled" && "Cancelado"}
                                {booking.status === "rescheduled" && "Reprogramado"}
                              </span>
                            </td>

                            {/* Fechas de registro */}
                            <td className="py-4 px-6 space-y-1 text-[10px] text-gray-400">
                              <div className="flex justify-between gap-4">
                                <span>Creado:</span>
                                <span className="text-gray-600">{formatDateTimeStamp(booking.createdAt)}</span>
                              </div>
                              {booking.status === "cancelled" && booking.cancelledAt && (
                                <div className="flex justify-between gap-4 text-red-400">
                                  <span>Cancelado:</span>
                                  <span>{formatDateTimeStamp(booking.cancelledAt)}</span>
                                </div>
                              )}
                              {booking.status === "rescheduled" && (
                                <div className="text-[9px] italic text-amber-500">
                                  Reprogramado a otra fecha
                                </div>
                              )}
                              {booking.rescheduledFrom && (
                                <div className="text-[9px] italic text-green-600">
                                  Modificación del ID: {booking.rescheduledFromId.substring(0, 8)}...
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e0deda]/30 bg-white/40 py-6 text-center text-xs tracking-wider text-neutral-400 font-light">
        <div className="max-w-7xl mx-auto px-6">
          © {new Date().getFullYear()} CUTANEO. Panel de Administración de Turnos.
        </div>
      </footer>

    </div>
  );
}

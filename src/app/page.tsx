"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  X, 
  Trash2, 
  RefreshCw,
  ChevronLeft,
  Loader2,
  Lock,
  LogOut,
  Filter,
  CheckSquare,
  AlertTriangle,
  Database,
  Sparkles,
  UserCheck
} from "lucide-react";

// Turnos fijos de 30 minutos (coincide con el backend)
const SLOTS = [
  "12:00", "12:30", "13:00", "13:30", 
  "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00", "17:30", 
  "18:00", "18:30"
];
const ALLOWED_DAYS = [1, 2, 4, 5];

const MEN_ZONES = [
  "Frente", "Entrecejo", "Patilla", "Zona Malar", "Barba", "Candado", "Bigote", 
  "Mentón", "Cuello", "Nuca", "Pabellón de Oreja", "Brazo Entero", "Antebrazo", 
  "Hombros", "Axilas", "Espalda Completa", "Espalda Terci Super", "Zona Lumbar", 
  "Pectoral", "Abdomen", "Tira Abdominal", "Cavado C/Tira", "Cavado Simple", 
  "Pierna Entera", "½ Pierna/C Rodilla", "Muslo", "Pies", "Manos", "Cuerpo entero"
];

const WOMEN_ZONES = [
  "Axilas", "Cavado Común", "½ Glúteo", "Glúteo Completo", "Muslo", "½ Pierna", 
  "Pierna Entera", "Antebrazo", "Brazo Entero", "Abdomen", "Tira Abdominal", 
  "Línea Intermamaria", "Bozo", "Mentón", "Patilla", "Cuello", "Nuca", 
  "Entrecejo", "Zona Lumbar", "Pies", "Manos", "Cuerpo entero"
];

export default function ClientApp() {
  // Navegación principal: 'home' | 'booking' | 'manage' | 'admin'
  const [view, setView] = useState<"home" | "booking" | "manage" | "admin">("home");

  // --- Estados de Reserva ---
  // Step 1: Pregunta Tratamiento | Step 2: Género y Zona | Step 3: Fecha y Hora | Step 4: Datos Cliente | Step 5: Éxito
  const [bookingStep, setBookingStep] = useState(1); 
  const [knowsTreatment, setKnowsTreatment] = useState<boolean | null>(null);
  const [selectedGender, setSelectedGender] = useState<"hombre" | "mujer" | "">("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(""); // HH:MM
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);
  const [bookingError, setBookingError] = useState("");

  // --- Estados de Gestión por Email ---
  const [searchEmail, setSearchEmail] = useState("");
  const [searchingEmail, setSearchingEmail] = useState(false);
  const [searched, setSearched] = useState(false);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [manageError, setManageError] = useState("");

  // --- Estados de Administrador ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [loadingAdminBookings, setLoadingAdminBookings] = useState(false);
  const [adminDashboardError, setAdminDashboardError] = useState("");
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>("all"); // all, reserved, cancelled, rescheduled
  const [adminFilterDate, setAdminFilterDate] = useState<string>(""); // YYYY-MM-DD

  // --- Modales ---
  const [showCancelModal, setShowCancelModal] = useState<any>(null); // booking object to cancel
  const [cancellingBooking, setCancellingBooking] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState<any>(null); // booking object to reschedule
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleSlots, setRescheduleSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  // --- Calendario Interactivo mes de navegación ---
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Cargar token del localStorage al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Cargar disponibilidad cliente (Step 3) cuando cambia fecha y zona
  useEffect(() => {
    if (selectedDate && view === "booking" && bookingStep === 3) {
      fetchAvailability(selectedDate, selectedZone);
    }
  }, [selectedDate, view, bookingStep, selectedZone]);

  // Cargar disponibilidad para reprogramación cliente cuando cambia la fecha
  useEffect(() => {
    if (rescheduleDate && showRescheduleModal) {
      fetchRescheduleAvailability(rescheduleDate, showRescheduleModal.zone);
    }
  }, [rescheduleDate, showRescheduleModal]);

  // Cargar reservas en el dashboard administrativo cuando cambian filtros o login
  useEffect(() => {
    if (view === "admin" && isAdminLoggedIn && adminToken) {
      fetchAdminBookings();
    }
  }, [view, isAdminLoggedIn, adminToken, adminFilterStatus, adminFilterDate]);

  const fetchAvailability = async (date: string, zone: string) => {
    setLoadingSlots(true);
    setSelectedTime("");
    setBookingError("");
    try {
      const res = await fetch(`/api/bookings/availability?date=${date}&zone=${encodeURIComponent(zone)}`);
      const data = await res.json();
      if (res.ok) {
        setAvailableSlots(data.availability);
      } else {
        setBookingError(data.error || "Error al cargar horarios.");
      }
    } catch (err) {
      setBookingError("Error de conexión con el servidor.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchRescheduleAvailability = async (date: string, zone: string) => {
    setLoadingRescheduleSlots(true);
    setRescheduleTime("");
    setRescheduleError("");
    try {
      const res = await fetch(`/api/bookings/availability?date=${date}&zone=${encodeURIComponent(zone)}`);
      const data = await res.json();
      if (res.ok) {
        setRescheduleSlots(data.availability);
      } else {
        setRescheduleError(data.error || "Error al cargar horarios.");
      }
    } catch (err) {
      setRescheduleError("Error de conexión con el servidor.");
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleSearchBookings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;
    setSearchingEmail(true);
    setManageError("");
    setSearched(false);
    try {
      const res = await fetch(`/api/bookings/by-email?email=${encodeURIComponent(searchEmail)}`);
      const data = await res.json();
      if (res.ok) {
        setMyBookings(data.bookings);
        setSearched(true);
      } else {
        setManageError(data.error || "Error al buscar reservas.");
      }
    } catch (err) {
      setManageError("Error de conexión con el servidor.");
    } finally {
      setSearchingEmail(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");
    setSubmittingBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingName,
          email: bookingEmail,
          phone: bookingPhone,
          date: selectedDate,
          time: selectedTime,
          gender: selectedGender,
          zone: selectedZone
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessBooking(data.booking);
        setBookingStep(5); // Avanzar a Éxito final
        setBookingName("");
        setBookingEmail("");
        setBookingPhone("");
      } else {
        setBookingError(data.error || "Error al crear la reserva.");
      }
    } catch (err) {
      setBookingError("Error al procesar la reserva. Intente nuevamente.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!showCancelModal) return;
    setCancellingBooking(true);
    setManageError("");
    try {
      const res = await fetch(`/api/bookings/${showCancelModal.id}/cancel`, {
        method: "PATCH",
      });
      if (res.ok) {
        setMyBookings(prev => 
          prev.map(b => b.id === showCancelModal.id ? { ...b, status: "cancelled", cancelledAt: new Date() } : b)
        );
        setShowCancelModal(null);
      } else {
        const data = await res.json();
        setManageError(data.error || "Error al cancelar la reserva.");
      }
    } catch (err) {
      setManageError("Error de conexión.");
    } finally {
      setCancellingBooking(false);
    }
  };

  const handleRescheduleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRescheduleModal || !rescheduleDate || !rescheduleTime) return;
    setSubmittingReschedule(true);
    setRescheduleError("");
    try {
      const res = await fetch(`/api/bookings/${showRescheduleModal.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: rescheduleDate,
          time: rescheduleTime,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const refreshRes = await fetch(`/api/bookings/by-email?email=${encodeURIComponent(searchEmail)}`);
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setMyBookings(refreshData.bookings);
        }
        setShowRescheduleModal(null);
        setRescheduleDate("");
        setRescheduleTime("");
      } else {
        setRescheduleError(data.error || "Error al reprogramar.");
      }
    } catch (err) {
      setRescheduleError("Error de conexión.");
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // --- Funciones Administrativas ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("admin_token", data.token);
        setAdminToken(data.token);
        setIsAdminLoggedIn(true);
        setAdminUsername("");
        setAdminPassword("");
      } else {
        setAdminLoginError(data.error || "Credenciales de administrador incorrectas.");
      }
    } catch (err) {
      setAdminLoginError("Error de conexión con el servidor.");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setAdminToken("");
    setIsAdminLoggedIn(false);
  };

  const fetchAdminBookings = async () => {
    setLoadingAdminBookings(true);
    setAdminDashboardError("");
    try {
      let url = `/api/admin/bookings?`;
      if (adminFilterStatus !== "all") url += `status=${adminFilterStatus}&`;
      if (adminFilterDate) url += `date=${adminFilterDate}&`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAdminBookings(data.bookings);
      } else {
        setAdminDashboardError(data.error || "Error al cargar reservas del dashboard.");
        if (res.status === 401) {
          handleAdminLogout();
        }
      }
    } catch (err) {
      setAdminDashboardError("Error de red al consultar base de datos.");
    } finally {
      setLoadingAdminBookings(false);
    }
  };

  // Helper fechas legibles
  const formatDateReadable = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  // Métricas Administrativas
  const totalAdminBookings = adminBookings.length;
  const countReservedAdmin = adminBookings.filter(b => b.status === "reserved").length;
  const countCancelledAdmin = adminBookings.filter(b => b.status === "cancelled").length;
  const countRescheduledAdmin = adminBookings.filter(b => b.status === "rescheduled").length;

  // --- Funciones Calendario ---
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = (isReschedule = false) => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    let offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days = [];
    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    const todayLimit = new Date();
    todayLimit.setHours(0, 0, 0, 0);
    const activeDate = isReschedule ? rescheduleDate : selectedDate;
    const setActiveDate = isReschedule ? setRescheduleDate : setSelectedDate;

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      const fullDateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      const isValidDay = ALLOWED_DAYS.includes(dayOfWeek);
      const isPast = currentDate < todayLimit;
      const isSelectable = isValidDay && !isPast;
      const isCurrentSelected = activeDate === fullDateStr;

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={!isSelectable}
          onClick={() => setActiveDate(fullDateStr)}
          className={`h-10 w-10 mx-auto rounded-full text-sm font-light flex items-center justify-center transition-all ${
            isCurrentSelected 
              ? "bg-black text-[#faf9f6] font-medium scale-110 shadow-sm" 
              : isSelectable 
                ? "hover:bg-gray-200 text-black font-normal" 
                : "text-gray-300 cursor-not-allowed"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const getMonthName = () => {
    return currentMonthDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-black selection:text-white">
      {/* HEADER / NAVBAR */}
      <header className="border-b border-[#e0deda]/40 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => { setView("home"); setBookingStep(1); setKnowsTreatment(null); }}>
            <Logo className="h-9 w-auto" />
          </div>
          
          <nav className="flex items-center gap-4 md:gap-6">
            {view !== "home" && (
              <button 
                onClick={() => { setView("home"); setBookingStep(1); setKnowsTreatment(null); }}
                className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
              >
                Inicio
              </button>
            )}
            
            {view !== "booking" && view !== "admin" ? (
              <button
                onClick={() => { setView("booking"); setBookingStep(1); setKnowsTreatment(null); }}
                className="text-xs uppercase tracking-widest bg-black text-[#faf9f6] px-4 py-2 hover:bg-neutral-800 transition-all rounded-sm font-medium"
              >
                Reservar Turno
              </button>
            ) : null}

            {view !== "manage" && view !== "admin" ? (
              <button
                onClick={() => { setView("manage"); setSearched(false); setSearchEmail(""); }}
                className="text-xs uppercase tracking-widest border border-black/15 text-black px-4 py-2 hover:bg-gray-50 transition-all rounded-sm font-medium"
              >
                Gestionar Mi Turno
              </button>
            ) : null}

            {view === "admin" && isAdminLoggedIn && (
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-sm transition-all font-light"
              >
                <LogOut size={13} />
                Cerrar Panel
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-7xl">
          
          {/* 1. HOME VIEW */}
          {view === "home" && (
            <div className="text-center max-w-2xl mx-auto animate-fade-in">
              <div className="flex justify-center mb-8">
                <Logo className="h-20 w-auto" showText={false} />
              </div>
              <h1 className="text-4xl md:text-5xl font-light tracking-[0.18em] uppercase text-neutral-900 mb-6 font-sans">
                Cutaneo
              </h1>
              <p className="text-sm tracking-widest text-neutral-500 uppercase mb-3">
                Centro de Estética & Depilación Profesional
              </p>
              <div className="w-16 h-[1.5px] bg-neutral-300 mx-auto my-6"></div>
              <p className="text-neutral-600 font-light text-base leading-relaxed mb-10 max-w-lg mx-auto">
                Espacio diseñado exclusivamente para el cuidado de tu piel. Ofrecemos tratamientos de depilación avanzada con tecnología de vanguardia y un enfoque de absoluto bienestar.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                <button
                  onClick={() => setView("booking")}
                  className="w-full sm:w-auto bg-black text-[#faf9f6] text-xs uppercase tracking-[0.2em] font-medium px-8 py-4 hover:bg-neutral-800 hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-300 shadow-sm rounded-sm"
                >
                  Reservar turno
                </button>
                <button
                  onClick={() => setView("manage")}
                  className="w-full sm:w-auto border border-neutral-300 bg-white/50 text-neutral-800 text-xs uppercase tracking-[0.2em] font-medium px-8 py-4 hover:bg-neutral-50 hover:border-neutral-400 hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-300 rounded-sm"
                >
                  Gestionar mi turno
                </button>
              </div>
            </div>
          )}

          {/* 2. RESERVA VIEW (5-STEP WIZARD) */}
          {view === "booking" && (
            <div className="bg-white/95 rounded-md border border-[#e0deda]/40 shadow-xl max-w-2xl mx-auto p-6 md:p-8 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8">
                <div>
                  <h2 className="text-lg font-light tracking-widest uppercase text-black">Nuevo Turno</h2>
                  <p className="text-xs text-gray-400 mt-1 font-light">Depilación Avanzada</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-5 rounded-full transition-all duration-300 ${bookingStep >= 1 ? "bg-black" : "bg-gray-100"}`}></div>
                  <div className={`h-2 w-5 rounded-full transition-all duration-300 ${bookingStep >= 2 ? "bg-black" : "bg-gray-100"}`}></div>
                  <div className={`h-2 w-5 rounded-full transition-all duration-300 ${bookingStep >= 3 ? "bg-black" : "bg-gray-100"}`}></div>
                  <div className={`h-2 w-5 rounded-full transition-all duration-300 ${bookingStep >= 4 ? "bg-black" : "bg-gray-100"}`}></div>
                  <div className={`h-2 w-5 rounded-full transition-all duration-300 ${bookingStep >= 5 ? "bg-black" : "bg-gray-100"}`}></div>
                </div>
              </div>

              {bookingError && (
                <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm mb-6 font-light">{bookingError}</div>
              )}

              {/* PASO 1: CONOCIMIENTO DEL TRATAMIENTO */}
              {bookingStep === 1 && (
                <div className="space-y-6 animate-fade-in text-center py-4">
                  <h3 className="text-base uppercase tracking-widest text-black font-light mb-6">¿Conoces nuestro tratamiento de depilación?</h3>
                  
                  {knowsTreatment === null ? (
                    <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-sm mx-auto">
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        className="flex-1 border border-neutral-300 text-neutral-800 text-xs uppercase tracking-widest font-medium py-4 px-6 hover:bg-neutral-50 active:scale-95 transition-all rounded-sm"
                      >
                        Sí, lo conozco
                      </button>
                      <button
                        type="button"
                        onClick={() => setKnowsTreatment(false)}
                        className="flex-1 bg-black text-[#faf9f6] text-xs uppercase tracking-widest font-medium py-4 px-6 hover:bg-neutral-800 active:scale-95 transition-all rounded-sm"
                      >
                        No lo conozco
                      </button>
                    </div>
                  ) : (
                    // Mostrar Información Titanium
                    <div className="space-y-6 max-w-md mx-auto text-left animate-fade-in">
                      <div className="border border-neutral-200 bg-[#faf9f6] p-6 rounded-sm space-y-4">
                        <div className="flex items-center gap-2 text-black">
                          <Sparkles size={18} className="text-amber-500" />
                          <h4 className="font-medium tracking-widest uppercase text-xs">Tecnología Titanium</h4>
                        </div>
                        <p className="text-xs text-neutral-600 font-light leading-relaxed">
                          Nuestra depilación **Titanium** combina tres longitudes de onda altamente efectivas en un solo cabezal. Esto permite tratar de manera simultánea diferentes profundidades del folículo piloso, logrando un tratamiento más rápido, completamente seguro y prácticamente indoloro en cualquier tipo de piel, incluso bronceada.
                        </p>
                        <p className="text-[10px] text-gray-400 italic font-light">
                          * Nota: Al presionar "Aceptar", confirmas que has leído y aceptas los detalles informativos de Titanium para continuar con la reserva de tu turno.
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setKnowsTreatment(null)}
                          className="flex-1 border border-neutral-200 text-neutral-600 text-xs uppercase tracking-widest font-medium py-3 rounded-sm hover:bg-neutral-50 transition-colors"
                        >
                          Volver
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingStep(2)}
                          className="flex-1 bg-black text-white text-xs uppercase tracking-widest font-medium py-3 rounded-sm hover:bg-neutral-800 transition-colors"
                        >
                          Aceptar y Continuar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 2: GÉNERO Y SELECCIÓN DE ZONA */}
              {bookingStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Selector de Género */}
                  <div className="space-y-3">
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-medium flex items-center gap-1.5">
                      <UserCheck size={14} /> 1. ¿Para quién es el turno?
                    </label>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <button
                        type="button"
                        onClick={() => { setSelectedGender("mujer"); setSelectedZone(""); }}
                        className={`py-3.5 text-xs uppercase tracking-widest border rounded-sm font-light transition-all ${
                          selectedGender === "mujer" 
                            ? "bg-black border-black text-white font-medium" 
                            : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700"
                        }`}
                      >
                        Mujer
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedGender("hombre"); setSelectedZone(""); }}
                        className={`py-3.5 text-xs uppercase tracking-widest border rounded-sm font-light transition-all ${
                          selectedGender === "hombre" 
                            ? "bg-black border-black text-white font-medium" 
                            : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700"
                        }`}
                      >
                        Hombre
                      </button>
                    </div>
                  </div>

                  {/* Selector de Zona Anatómica */}
                  {selectedGender !== "" && (
                    <div className="space-y-3 animate-fade-in">
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 font-medium flex items-center gap-1.5">
                        <Sparkles size={14} /> 2. Seleccione la parte a depilar
                      </label>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-56 border border-neutral-100 p-3 bg-neutral-50/50 rounded-sm pr-1">
                        {(selectedGender === "hombre" ? MEN_ZONES : WOMEN_ZONES).map((zone) => (
                          <button
                            key={zone}
                            type="button"
                            onClick={() => setSelectedZone(zone)}
                            className={`py-2 px-2 text-[11px] tracking-wide rounded-sm border transition-all text-left truncate flex justify-between items-center ${
                              selectedZone === zone
                                ? "bg-black border-black text-white font-normal"
                                : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700 font-light"
                            }`}
                          >
                            <span>{zone}</span>
                            {zone === "Cuerpo entero" && (
                              <span className={`text-[8px] px-1 py-0.5 rounded-full ${selectedZone === zone ? "bg-amber-500 text-black font-bold" : "bg-amber-100 text-amber-800"}`}>2 hs</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de navegación */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => { setBookingStep(1); setKnowsTreatment(null); }}
                      className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gray-500 hover:text-black font-medium transition-colors"
                    >
                      <ArrowLeft size={14} /> Volver
                    </button>
                    
                    <button
                      type="button"
                      disabled={!selectedGender || !selectedZone}
                      onClick={() => setBookingStep(3)}
                      className={`flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium px-6 py-3 rounded-sm transition-all ${
                        selectedGender && selectedZone ? "bg-black text-white hover:bg-neutral-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continuar <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: SELECCIÓN DE FECHA Y HORA */}
              {bookingStep === 3 && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Resumen del servicio */}
                  <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-500 font-light">
                        <UserCheck size={13} />
                        <span>Cliente: <strong className="font-normal uppercase text-black">{selectedGender}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-light">
                        <Sparkles size={13} />
                        <span>Zona: <strong className="font-normal text-black">{selectedZone}</strong> {selectedZone === "Cuerpo entero" ? "(Duración: 2 horas)" : "(Duración: 30 min)"}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setBookingStep(2)} className="text-gray-400 hover:text-black text-xs border-b border-gray-200 hover:border-black font-light pb-[1px]">Cambiar</button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Calendario */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-4 flex items-center gap-2">
                        <CalendarIcon size={14} /> 1. Seleccione Día
                      </label>
                      <div className="border border-gray-100 rounded-sm p-4 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                          <button type="button" onClick={handlePrevMonth} className="text-gray-500 hover:text-black p-1"><ChevronLeft size={16} /></button>
                          <span className="text-xs font-medium uppercase tracking-widest text-black">{getMonthName()}</span>
                          <button type="button" onClick={handleNextMonth} className="text-gray-500 hover:text-black p-1"><ChevronRight size={16} /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-2">
                          <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span><span>Do</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">{renderCalendarDays()}</div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 font-light leading-relaxed">* Atendemos Lunes, Martes, Jueves y Viernes.</p>
                    </div>

                    {/* Horarios */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-4 flex items-center gap-2">
                        <Clock size={14} /> 2. Horarios Disponibles
                      </label>
                      {!selectedDate ? (
                        <div className="h-48 border border-dashed border-gray-100 rounded-sm flex items-center justify-center bg-gray-50/30">
                          <p className="text-xs text-gray-400 font-light">Selecciona una fecha primero</p>
                        </div>
                      ) : loadingSlots ? (
                        <div className="h-48 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="animate-spin text-neutral-400" size={24} />
                          <p className="text-xs text-gray-400 font-light">Buscando bloques libres...</p>
                        </div>
                      ) : bookingError ? (
                        <div className="h-48 border border-red-100 bg-red-50/30 rounded-sm flex flex-col items-center justify-center p-4 text-center">
                          <p className="text-xs text-red-600 font-light mb-1">{bookingError}</p>
                          <p className="text-[10px] text-gray-400 font-light">Verifica la conexión a la base de datos o el estado del servidor.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-56 pr-1">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-3 text-xs tracking-wider rounded-sm border font-light transition-all ${
                                selectedTime === slot.time
                                  ? "bg-black border-black text-white font-medium"
                                  : slot.available
                                    ? "bg-white hover:bg-gray-50 border-gray-200 text-neutral-700"
                                    : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                              }`}
                            >
                              {slot.time} hs
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de navegación */}
                  <div className="flex justify-between pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gray-500 hover:text-black font-medium transition-colors"
                    >
                      <ArrowLeft size={14} /> Volver
                    </button>
                    
                    <button
                      type="button"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setBookingStep(4)}
                      className={`flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium px-6 py-3 rounded-sm transition-all ${
                        selectedDate && selectedTime ? "bg-black text-white hover:bg-neutral-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continuar <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 4: FORMULARIO DE DATOS */}
              {bookingStep === 4 && (
                <form onSubmit={handleCreateBooking} className="space-y-6 animate-fade-in">
                  
                  {/* Resumen del turno reservado */}
                  <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm text-xs space-y-1.5 font-light">
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Servicio para:</span>
                      <strong className="font-normal uppercase text-black">{selectedGender}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Zona seleccionada:</span>
                      <strong className="font-normal text-black">{selectedZone} {selectedZone === "Cuerpo entero" ? "(Bloque 2hs)" : "(30m)"}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Fecha del turno:</span>
                      <strong className="font-normal text-black">{formatDateReadable(selectedDate)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Horario de inicio:</span>
                      <strong className="font-normal text-black">{selectedTime} hs</strong>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">Nombre Completo *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="text" required value={bookingName} onChange={(e) => setBookingName(e.target.value)} placeholder="Ej: Esteban Minaudo" className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black font-light" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">Correo Electrónico *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="email" required value={bookingEmail} onChange={(e) => setBookingEmail(e.target.value)} placeholder="Ej: cliente@email.com" className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black font-light" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">Teléfono Móvil (Opcional)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="tel" value={bookingPhone} onChange={(e) => setBookingPhone(e.target.value)} placeholder="Ej: +54 9 11 2345-6789" className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black font-light" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => setBookingStep(3)} className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gray-500 hover:text-black font-medium"><ArrowLeft size={14} />Volver</button>
                    <button type="submit" disabled={submittingBooking} className="bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-[0.15em] font-medium px-8 py-3.5 rounded-sm transition-all shadow-sm flex items-center gap-2">
                      {submittingBooking ? <><Loader2 className="animate-spin" size={14} />Procesando...</> : "Confirmar Reserva"}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 5: ÉXITO FINAL */}
              {bookingStep === 5 && successBooking && (
                <div className="text-center py-8 space-y-6 animate-fade-in">
                  <div className="flex justify-center"><CheckCircle className="text-neutral-900 w-16 h-16 animate-bounce" /></div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-normal tracking-wide text-black">¡Reserva Confirmada!</h3>
                    <p className="text-sm text-gray-500 font-light max-w-sm mx-auto">Tu turno ha quedado agendado en nuestro sistema.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 text-xs max-w-md mx-auto text-left space-y-3 font-light">
                    <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">Cliente:</span><span className="font-normal text-black">{successBooking.name}</span></div>
                    <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">Género:</span><span className="font-normal uppercase text-black">{successBooking.gender}</span></div>
                    <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">Zona Elegida:</span><span className="font-normal text-black">{successBooking.zone}</span></div>
                    <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">Fecha:</span><span className="font-normal text-black">{formatDateReadable(successBooking.date)}</span></div>
                    <div className="flex justify-between pb-1"><span className="text-gray-400">Horario:</span><span className="font-normal text-black">{successBooking.time} hs ({successBooking.duration} min)</span></div>
                  </div>

                  <div className="pt-6">
                    <button onClick={() => { setView("home"); setBookingStep(1); setKnowsTreatment(null); }} className="bg-black text-[#faf9f6] text-xs uppercase tracking-widest font-medium px-8 py-3.5 hover:bg-neutral-800 transition-all rounded-sm shadow-sm">Volver al inicio</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. GESTIONAR MI TURNO VIEW */}
          {view === "manage" && (
            <div className="bg-white/95 rounded-md border border-[#e0deda]/40 shadow-xl max-w-2xl mx-auto p-6 md:p-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-5 mb-8">
                <h2 className="text-lg font-light tracking-widest uppercase text-black">Gestionar Mi Turno</h2>
                <p className="text-xs text-gray-400 mt-1 font-light">Consulta, cancela o reprograma tus reservas ingresando tu correo.</p>
              </div>

              {manageError && (
                <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm mb-6 font-light">{manageError}</div>
              )}

              {!searched ? (
                <form onSubmit={handleSearchBookings} className="space-y-6 max-w-md mx-auto py-4">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium">Introduce tu Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="email" required value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Ej: cliente@email.com" className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black font-light" />
                    </div>
                  </div>
                  <button type="submit" disabled={searchingEmail || !searchEmail} className="w-full bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-[0.2em] font-medium py-3.5 rounded-sm transition-all shadow-sm flex items-center justify-center gap-2">
                    {searchingEmail ? <><Loader2 className="animate-spin" size={14} />Buscando reservas...</> : <><Search size={14} />Consultar turnos</>}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between bg-gray-50 p-4 border border-gray-100 rounded-sm text-xs">
                    <div className="flex items-center gap-2 text-gray-600 font-light"><Mail size={13} /><span>Reservas asociadas a: <strong className="font-normal text-black">{searchEmail}</strong></span></div>
                    <button onClick={() => setSearched(false)} className="text-gray-400 hover:text-black font-light border-b border-gray-200 hover:border-black pb-[1px] transition-all">Cambiar Email</button>
                  </div>

                  {myBookings.length === 0 ? (
                    <div className="text-center py-12 space-y-4 border border-dashed border-gray-100 rounded-sm">
                      <p className="text-sm text-gray-400 font-light">No se encontraron reservas registradas para este email.</p>
                      <button onClick={() => setView("booking")} className="text-xs uppercase tracking-widest font-medium border-b border-black pb-1 hover:text-gray-500 transition-colors">Reservar un turno ahora</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBookings.map((booking) => {
                        const isPast = new Date(`${booking.date}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0));
                        return (
                          <div key={booking.id} className={`p-5 rounded-sm border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${booking.status === "cancelled" ? "bg-red-50/10 border-red-100/50 opacity-60" : booking.status === "rescheduled" ? "bg-gray-50/50 border-gray-100 opacity-60" : "bg-white border-[#e0deda]/40 shadow-sm"}`}>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 font-medium rounded-full ${booking.status === "reserved" ? "bg-green-50 text-green-700 border border-green-100" : booking.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                                  {booking.status === "reserved" && "Reservado"}
                                  {booking.status === "cancelled" && "Cancelado"}
                                  {booking.status === "rescheduled" && "Reprogramado"}
                                </span>
                                <span className="text-[10px] text-gray-400 font-light">ID: {booking.id.substring(0, 8)}...</span>
                              </div>
                              <div className="space-y-1 text-xs">
                                <p className="text-neutral-500 font-light flex items-center gap-2">
                                  <User size={13} className="text-gray-400" />
                                  <span className="uppercase font-normal text-black">{booking.gender}</span> — <strong className="font-normal text-neutral-800">{booking.zone}</strong>
                                  {booking.duration === 120 && (
                                    <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">2 hs</span>
                                  )}
                                </p>
                                <p className="font-normal text-black flex items-center gap-2"><CalendarIcon size={13} className="text-gray-400" />{formatDateReadable(booking.date)}</p>
                                <p className="text-gray-500 font-light flex items-center gap-2"><Clock size={13} className="text-gray-400" />{booking.time} hs ({booking.duration} min)</p>
                                {booking.rescheduledFrom && (
                                  <p className="text-[10px] text-gray-400 font-light italic mt-1">Reprogramado del: {formatDateReadable(booking.rescheduledFrom.date)} a las {booking.rescheduledFrom.time} hs</p>
                                )}
                              </div>
                            </div>
                            {booking.status === "reserved" && !isPast && (
                              <div className="flex items-center gap-3 w-full md:w-auto">
                                <button type="button" onClick={() => { setRescheduleDate(""); setRescheduleTime(""); setRescheduleSlots([]); setShowRescheduleModal(booking); }} className="flex-1 md:flex-initial flex items-center justify-center gap-2 border border-gray-200 hover:border-black text-xs uppercase tracking-widest text-neutral-700 hover:text-black font-medium px-4 py-2.5 rounded-sm bg-white"><RefreshCw size={12} />Reprogramar</button>
                                <button type="button" onClick={() => setShowCancelModal(booking)} className="flex-1 md:flex-initial flex items-center justify-center gap-2 border border-red-200 hover:border-red-600 hover:bg-red-50 text-xs uppercase tracking-widest text-red-600 font-medium px-4 py-2.5 rounded-sm bg-white"><Trash2 size={12} />Cancelar</button>
                              </div>
                            )}
                            {isPast && booking.status === "reserved" && <span className="text-[11px] text-gray-400 font-light italic">Turno finalizado</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. UNIFIED ADMIN VIEW */}
          {view === "admin" && (
            <div className="space-y-8 animate-fade-in w-full">
              {!isAdminLoggedIn ? (
                // ADMIN LOGIN FORM
                <div className="bg-white rounded-md border border-[#e0deda]/40 shadow-xl max-w-sm w-full mx-auto p-6 md:p-8 animate-fade-in">
                  <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border border-gray-100 text-black mb-2"><Lock size={18} /></div>
                    <h2 className="text-base uppercase tracking-widest font-normal text-black">Acceso Administrador</h2>
                    <p className="text-[10px] text-gray-400 font-light">Panel privado de control de turnos.</p>
                  </div>

                  {adminLoginError && (
                    <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm mb-6 font-light">{adminLoginError}</div>
                  )}

                  <form onSubmit={handleAdminLogin} className="space-y-5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">Usuario</label>
                      <input type="text" required value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="Ej: admin" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black font-light placeholder:text-gray-300" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">Contraseña</label>
                      <input type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black font-light placeholder:text-gray-300" />
                    </div>
                    <button type="submit" disabled={adminLoginLoading} className="w-full bg-black text-[#faf9f6] text-xs uppercase tracking-[0.2em] font-medium py-3.5 rounded-sm hover:bg-neutral-800 transition-all shadow-sm flex items-center justify-center gap-2">
                      {adminLoginLoading ? <Loader2 className="animate-spin" size={13} /> : "Ingresar al Panel"}
                    </button>
                  </form>
                </div>
              ) : (
                // ADMIN INTERACTIVE DASHBOARD
                <div className="space-y-8 animate-fade-in w-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
                    <div>
                      <h2 className="text-xl font-light tracking-widest uppercase text-black">Dashboard de Reservas</h2>
                      <p className="text-xs text-gray-400 mt-1 font-light">Control y visualización de reservas en tiempo real.</p>
                    </div>
                    <button onClick={handleAdminLogout} className="md:hidden flex items-center justify-center gap-1.5 text-xs text-red-500 border border-red-100 rounded-sm p-2 bg-red-50/50 w-full"><LogOut size={13} />Cerrar Sesión</button>
                  </div>

                  {/* Widgets */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-neutral-50 rounded-sm border border-neutral-100 text-black"><Database size={18} /></div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium">Total Reservas</span>
                        <span className="text-xl font-light text-black">{totalAdminBookings}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-green-50/50 rounded-sm border border-green-100 text-green-700"><CheckSquare size={18} /></div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium">Activos</span>
                        <span className="text-xl font-light text-green-700">{countReservedAdmin}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-red-50/50 rounded-sm border border-red-100 text-red-700"><AlertTriangle size={18} /></div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium">Cancelados</span>
                        <span className="text-xl font-light text-red-700">{countCancelledAdmin}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-amber-50/50 rounded-sm border border-amber-100 text-amber-700"><RefreshCw size={18} /></div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium">Reprogramados</span>
                        <span className="text-xl font-light text-amber-700">{countRescheduledAdmin}</span>
                      </div>
                    </div>
                  </div>

                  {adminDashboardError && (
                    <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm font-light">{adminDashboardError}</div>
                  )}

                  {/* Barra Filtros */}
                  <div className="bg-white border border-[#e0deda]/40 p-5 rounded-sm shadow-sm flex flex-col md:flex-row gap-4 items-end justify-between">
                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium flex items-center gap-1.5"><Filter size={10} />Estado</label>
                        <select value={adminFilterStatus} onChange={(e) => setAdminFilterStatus(e.target.value)} className="text-xs border border-gray-200 rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-black font-light text-neutral-700 pr-8">
                          <option value="all">Todos los Estados</option>
                          <option value="reserved">Reservados</option>
                          <option value="cancelled">Cancelados</option>
                          <option value="rescheduled">Reprogramados</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-medium flex items-center gap-1.5"><CalendarIcon size={10} />Fecha</label>
                        <div className="relative">
                          <input type="date" value={adminFilterDate} onChange={(e) => setAdminFilterDate(e.target.value)} className="text-xs border border-gray-200 rounded-sm px-3 py-1.5 focus:outline-none focus:border-black font-light text-neutral-700 pr-8" />
                          {adminFilterDate && <button onClick={() => setAdminFilterDate("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5"><X size={12} /></button>}
                        </div>
                      </div>
                    </div>
                    <button onClick={fetchAdminBookings} className="text-xs border border-gray-200 hover:border-black text-neutral-700 px-4 py-2 hover:bg-gray-50 rounded-sm transition-all flex items-center gap-1.5 font-light">
                      <RefreshCw size={12} className={loadingAdminBookings ? "animate-spin" : ""} /> Refrescar
                    </button>
                  </div>

                  {/* Tabla */}
                  <div className="bg-white border border-[#e0deda]/40 rounded-sm shadow-sm overflow-hidden">
                    {loadingAdminBookings ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-neutral-400" size={28} />
                        <p className="text-xs text-gray-400 font-light">Consultando base de datos...</p>
                      </div>
                    ) : adminBookings.length === 0 ? (
                      <div className="py-20 text-center"><p className="text-sm text-gray-400 font-light">No se encontraron registros de reservas.</p></div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                              <th className="py-4 px-6">ID</th>
                              <th className="py-4 px-6">Cliente</th>
                              <th className="py-4 px-6">Servicio / Zona</th>
                              <th className="py-4 px-6">Contacto</th>
                              <th className="py-4 px-6">Fecha Turno</th>
                              <th className="py-4 px-6">Horario</th>
                              <th className="py-4 px-6 text-center">Estado</th>
                              <th className="py-4 px-6">Trazabilidad</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-light">
                            {adminBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 text-gray-400 font-mono text-[10px]">{booking.id.substring(0, 8)}...</td>
                                <td className="py-4 px-6 font-normal text-black">{booking.name}</td>
                                
                                {/* Género y Zona */}
                                <td className="py-4 px-6 space-y-0.5 text-neutral-600 font-normal">
                                  <span className="uppercase text-[10px] text-gray-400 block font-light">{booking.gender}</span>
                                  <div className="flex items-center gap-2">
                                    <span>{booking.zone}</span>
                                    {booking.duration === 120 && (
                                      <span className="text-[8px] bg-amber-50 border border-amber-200 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">2 hs</span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-4 px-6 space-y-0.5 text-gray-500">
                                  <span className="flex items-center gap-1.5"><Mail size={11} className="text-gray-300" />{booking.email}</span>
                                  {booking.phone && <span className="flex items-center gap-1.5 text-[10px]"><Phone size={11} className="text-gray-300" />{booking.phone}</span>}
                                </td>
                                <td className="py-4 px-6 font-normal text-black">{formatDateReadable(booking.date)}</td>
                                <td className="py-4 px-6 text-gray-500 font-normal">{booking.time} hs</td>
                                <td className="py-4 px-6 text-center">
                                  <span className={`inline-block text-[9px] uppercase tracking-widest px-2.5 py-0.5 font-medium rounded-full ${booking.status === "reserved" ? "bg-green-50 text-green-700 border border-green-100" : booking.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                                    {booking.status === "reserved" && "Reservado"}
                                    {booking.status === "cancelled" && "Cancelado"}
                                    {booking.status === "rescheduled" && "Reprogramado"}
                                  </span>
                                </td>
                                <td className="py-4 px-6 space-y-1 text-[10px] text-gray-400">
                                  <div className="flex justify-between gap-4"><span>Creado:</span><span className="text-gray-600">{formatDateTimeStamp(booking.createdAt)}</span></div>
                                  {booking.status === "cancelled" && booking.cancelledAt && (
                                    <div className="flex justify-between gap-4 text-red-400"><span>Cancelado:</span><span>{formatDateTimeStamp(booking.cancelledAt)}</span></div>
                                  )}
                                  {booking.status === "rescheduled" && <div className="text-[9px] italic text-amber-500">Reprogramado a otra fecha</div>}
                                  {booking.rescheduledFrom && <div className="text-[9px] italic text-green-600">Modificación de ID: {booking.rescheduledFromId.substring(0, 8)}...</div>}
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
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e0deda]/30 bg-white/40 py-6 text-center text-xs tracking-wider text-neutral-400 font-light">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>© {new Date().getFullYear()} CUTANEO. Todos los derechos reservados.</span>
          
          <button 
            onClick={() => { 
              if (view === "admin") {
                setView("home");
              } else {
                setView("admin");
              }
              setBookingStep(1); 
              setKnowsTreatment(null);
            }}
            className="text-[10px] text-neutral-300 hover:text-neutral-600 active:text-black select-none transition-all duration-300 font-mono cursor-pointer"
            title="Acceso restringido"
          >
            • Acceso
          </button>
        </div>
      </footer>

      {/* --- MODAL DE CANCELACIÓN CLIENTE --- */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-md p-6 max-w-sm w-full space-y-6">
            <div className="flex justify-between items-start">
              <h4 className="text-sm uppercase tracking-widest font-medium text-black">Confirmar Cancelación</h4>
              <button onClick={() => setShowCancelModal(null)} className="text-gray-400 hover:text-black transition-colors"><X size={16} /></button>
            </div>
            <div className="text-xs font-light text-neutral-500 leading-relaxed space-y-3">
              <p>¿Estás seguro que deseas cancelar tu turno del día <strong className="font-normal text-black">{formatDateReadable(showCancelModal.date)}</strong> a las <strong className="font-normal text-black">{showCancelModal.time} hs</strong>?</p>
              <p className="text-red-500/80 italic text-[10px]">* Esta acción no se puede deshacer y el horario quedará inmediatamente liberado para otro cliente.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCancelModal(null)} className="flex-1 border border-gray-200 hover:border-black text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition-all">Volver</button>
              <button type="button" onClick={handleCancelBooking} disabled={cancellingBooking} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition-all flex items-center justify-center gap-2">
                {cancellingBooking ? <Loader2 className="animate-spin" size={12} /> : "Sí, Cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE REPROGRAMACIÓN CLIENTE --- */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white border border-[#e0deda]/40 shadow-2xl rounded-md p-6 md:p-8 max-w-xl w-full my-8 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-sm uppercase tracking-widest font-medium text-black">Reprogramar Turno</h4>
                <p className="text-[10px] text-gray-400 font-light mt-1">Selecciona una nueva fecha y hora para cambiar tu turno de <strong className="font-normal text-black">{showRescheduleModal.zone}</strong>.</p>
              </div>
              <button onClick={() => setShowRescheduleModal(null)} className="text-gray-400 hover:text-black transition-colors"><X size={16} /></button>
            </div>

            {rescheduleError && (
              <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm font-light">{rescheduleError}</div>
            )}

            <form onSubmit={handleRescheduleBooking} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-gray-500 mb-2 flex items-center gap-2"><CalendarIcon size={12} /> 1. Nuevo Día</label>
                  <div className="border border-gray-100 rounded-sm p-3 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      <button type="button" onClick={handlePrevMonth} className="text-gray-500 hover:text-black p-1"><ChevronLeft size={14} /></button>
                      <span className="text-[10px] font-medium uppercase tracking-widest text-black">{getMonthName()}</span>
                      <button type="button" onClick={handleNextMonth} className="text-gray-500 hover:text-black p-1"><ChevronRight size={14} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[9px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                      <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span><span>Do</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">{renderCalendarDays(true)}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-gray-500 mb-2 flex items-center gap-2"><Clock size={12} /> 2. Nuevo Horario {showRescheduleModal.zone === "Cuerpo entero" ? "(Bloque 2hs)" : "(30 min)"}</label>
                  {!rescheduleDate ? (
                    <div className="h-44 border border-dashed border-gray-100 rounded-sm flex items-center justify-center bg-gray-50/30">
                      <p className="text-[10px] text-gray-400 font-light">Selecciona un día primero</p>
                    </div>
                  ) : loadingRescheduleSlots ? (
                    <div className="h-44 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-neutral-400" size={20} />
                      <p className="text-[10px] text-gray-400 font-light">Cargando disponibilidad...</p>
                    </div>
                  ) : rescheduleError ? (
                    <div className="h-44 border border-red-100 bg-red-50/30 rounded-sm flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-[10px] text-red-600 font-light mb-1">{rescheduleError}</p>
                      <p className="text-[8px] text-gray-400 font-light">Ocurrió un error al buscar disponibilidad.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-44 pr-1">
                      {rescheduleSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setRescheduleTime(slot.time)}
                          className={`py-2 text-[11px] tracking-wider rounded-sm border font-light transition-all ${
                            rescheduleTime === slot.time
                              ? "bg-black border-black text-white font-medium"
                              : slot.available
                                ? "bg-white hover:bg-gray-50 border-gray-200 text-neutral-700"
                                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                          }`}
                        >
                          {slot.time} hs
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowRescheduleModal(null)} className="flex-1 border border-gray-200 hover:border-black text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition-all">Volver</button>
                <button type="submit" disabled={submittingReschedule || !rescheduleDate || !rescheduleTime} className={`flex-1 text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition-all flex items-center justify-center gap-2 ${rescheduleDate && rescheduleTime ? "bg-black text-[#faf9f6] hover:bg-neutral-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                  {submittingReschedule ? <Loader2 className="animate-spin" size={12} /> : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

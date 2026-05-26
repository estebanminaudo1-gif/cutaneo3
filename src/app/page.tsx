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
  Loader2
} from "lucide-react";

// Turnos fijos de 45 minutos (coincide con el backend)
const SLOTS = ["12:00", "12:45", "13:30", "14:15", "15:00", "15:45", "16:30", "17:15", "18:00"];

export default function ClientApp() {
  // Navegación principal: 'home' | 'booking' | 'manage'
  const [view, setView] = useState<"home" | "booking" | "manage">("home");

  // --- Estados de Reserva ---
  const [bookingStep, setBookingStep] = useState(1); // 1: Fecha y Hora, 2: Formulario, 3: Éxito
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

  // --- Calendario Interactivo (Mes de navegación) ---
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Cargar disponibilidad cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate && view === "booking") {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, view]);

  // Cargar disponibilidad para reprogramación cuando cambia la fecha
  useEffect(() => {
    if (rescheduleDate && showRescheduleModal) {
      fetchRescheduleAvailability(rescheduleDate);
    }
  }, [rescheduleDate, showRescheduleModal]);

  const fetchAvailability = async (date: string) => {
    setLoadingSlots(true);
    setSelectedTime("");
    setBookingError("");
    try {
      const res = await fetch(`/api/bookings/availability?date=${date}`);
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

  const fetchRescheduleAvailability = async (date: string) => {
    setLoadingRescheduleSlots(true);
    setRescheduleTime("");
    setRescheduleError("");
    try {
      const res = await fetch(`/api/bookings/availability?date=${date}`);
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

  // Buscar reservas por email
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

  // Crear nueva reserva
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
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessBooking(data.booking);
        setBookingStep(3);
        // Limpiar formulario
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

  // Cancelar turno
  const handleCancelBooking = async () => {
    if (!showCancelModal) return;
    setCancellingBooking(true);
    setManageError("");
    try {
      const res = await fetch(`/api/bookings/${showCancelModal.id}/cancel`, {
        method: "PATCH",
      });
      if (res.ok) {
        // Refrescar listado
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

  // Reprogramar turno
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
        // Recargar reservas del usuario
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

  // Helper para traducir fechas en formato legible
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

  // --- Funciones del Calendario Personalizado ---
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = (isReschedule = false) => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0: Dom, 1: Lun, etc.
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Adaptar primer día de la semana (Lunes en lugar de Domingo)
    // En JS 0 es Domingo. Queremos que empiece en Lunes (1).
    let offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days = [];
    
    // Rellenar días en blanco del mes anterior
    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const todayLimit = new Date();
    todayLimit.setHours(0, 0, 0, 0);

    const activeDate = isReschedule ? rescheduleDate : selectedDate;
    const setActiveDate = isReschedule ? setRescheduleDate : setSelectedDate;

    // Rellenar días del mes actual
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      
      const currentYearStr = year.toString();
      const currentMonthStr = (month + 1).toString().padStart(2, "0");
      const currentDayStr = day.toString().padStart(2, "0");
      const fullDateStr = `${currentYearStr}-${currentMonthStr}-${currentDayStr}`;

      // Reglas: Lunes(1), Martes(2), Jueves(4), Viernes(5) son válidos
      const isValidDay = [1, 2, 4, 5].includes(dayOfWeek);
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
      <header className="border-b border-[#e0deda]/40 bg-white/70 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => { setView("home"); setBookingStep(1); }}>
            <Logo className="h-9 w-auto" />
          </div>
          
          <nav className="flex items-center gap-4 md:gap-6">
            {view !== "home" && (
              <button 
                onClick={() => { setView("home"); setBookingStep(1); }}
                className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
              >
                Inicio
              </button>
            )}
            
            {view !== "booking" ? (
              <button
                onClick={() => { setView("booking"); setBookingStep(1); }}
                className="text-xs uppercase tracking-widest bg-black text-[#faf9f6] px-4 py-2 hover:bg-neutral-800 transition-all rounded-sm font-medium"
              >
                Reservar Turno
              </button>
            ) : null}

            {view !== "manage" ? (
              <button
                onClick={() => { setView("manage"); setSearched(false); setSearchEmail(""); }}
                className="text-xs uppercase tracking-widest border border-black/15 text-black px-4 py-2 hover:bg-gray-50 transition-all rounded-sm font-medium"
              >
                Gestionar Mi Turno
              </button>
            ) : null}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="max-w-4xl w-full">
          
          {/* 1. VISTA HOME */}
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

          {/* 2. VISTA RESERVA (FLOW) */}
          {view === "booking" && (
            <div className="bg-white/95 rounded-md border border-[#e0deda]/40 shadow-xl max-w-2xl mx-auto p-6 md:p-8 animate-fade-in">
              
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8">
                <div>
                  <h2 className="text-lg font-light tracking-widest uppercase text-black">
                    Nuevo Turno
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 font-light">
                    Depilación Profesional
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-8 rounded-full transition-all duration-300 ${bookingStep >= 1 ? "bg-black" : "bg-gray-100"}`}></div>
                  <div className={`h-2 w-8 rounded-full transition-all duration-300 ${bookingStep >= 2 ? "bg-black" : "bg-gray-100"}`}></div>
                  <div className={`h-2 w-8 rounded-full transition-all duration-300 ${bookingStep >= 3 ? "bg-black" : "bg-gray-100"}`}></div>
                </div>
              </div>

              {/* Errores */}
              {bookingError && (
                <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm mb-6 font-light">
                  {bookingError}
                </div>
              )}

              {/* PASO 1: FECHA Y HORA */}
              {bookingStep === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Selector de Fecha (Calendario) */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-4 flex items-center gap-2">
                        <CalendarIcon size={14} />
                        1. Seleccione Día
                      </label>
                      
                      <div className="border border-gray-100 rounded-sm p-4 bg-gray-50/50">
                        {/* Month navigation */}
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                          <button type="button" onClick={handlePrevMonth} className="text-gray-500 hover:text-black p-1">
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-medium uppercase tracking-widest text-black">
                            {getMonthName()}
                          </span>
                          <button type="button" onClick={handleNextMonth} className="text-gray-500 hover:text-black p-1">
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-2">
                          <span>Lu</span>
                          <span>Ma</span>
                          <span>Mi</span>
                          <span>Ju</span>
                          <span>Vi</span>
                          <span>Sá</span>
                          <span>Do</span>
                        </div>
                        
                        {/* Calendar days grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {renderCalendarDays()}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-3 font-light leading-relaxed">
                        * Atendemos de Lunes, Martes, Jueves y Viernes. Miércoles y fines de semana cerrado.
                      </p>
                    </div>

                    {/* Selector de Hora */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-4 flex items-center gap-2">
                        <Clock size={14} />
                        2. Seleccione Horario (45 min)
                      </label>

                      {!selectedDate ? (
                        <div className="h-48 border border-dashed border-gray-100 rounded-sm flex items-center justify-center bg-gray-50/30">
                          <p className="text-xs text-gray-400 font-light">
                            Selecciona una fecha primero
                          </p>
                        </div>
                      ) : loadingSlots ? (
                        <div className="h-48 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="animate-spin text-neutral-400" size={24} />
                          <p className="text-xs text-gray-400 font-light">Buscando turnos libres...</p>
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

                  {/* Continuar button */}
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setBookingStep(2)}
                      className={`flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium px-6 py-3 rounded-sm transition-all ${
                        selectedDate && selectedTime
                          ? "bg-black text-white hover:bg-neutral-800"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continuar
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: FORMULARIO */}
              {bookingStep === 2 && (
                <form onSubmit={handleCreateBooking} className="space-y-6 animate-fade-in">
                  
                  {/* Resumen del turno seleccionado */}
                  <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-500 font-light">
                        <CalendarIcon size={13} />
                        <span>{formatDateReadable(selectedDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-light">
                        <Clock size={13} />
                        <span>{selectedTime} hs (Duración: 45 min)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="text-gray-400 hover:text-black text-xs border-b border-gray-200 hover:border-black font-light transition-all pb-[1px]"
                    >
                      Cambiar
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
                        Nombre Completo *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                          type="text"
                          required
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          placeholder="Ej: Esteban Minaudo"
                          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 font-light"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
                        Correo Electrónico *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                          type="email"
                          required
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          placeholder="Ej: cliente@email.com"
                          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 font-light"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 font-light leading-relaxed">
                        * Usarás este email para consultar, cancelar o reprogramar tu reserva en cualquier momento.
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
                        Teléfono Móvil (Opcional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                          type="tel"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="Ej: +54 9 11 2345-6789"
                          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 font-light"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gray-500 hover:text-black font-medium transition-colors"
                    >
                      <ArrowLeft size={14} />
                      Volver
                    </button>
                    
                    <button
                      type="submit"
                      disabled={submittingBooking}
                      className="bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-[0.15em] font-medium px-8 py-3.5 rounded-sm transition-all shadow-sm flex items-center gap-2"
                    >
                      {submittingBooking ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Procesando...
                        </>
                      ) : (
                        "Confirmar Reserva"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 3: ÉXITO */}
              {bookingStep === 3 && successBooking && (
                <div className="text-center py-8 space-y-6 animate-fade-in">
                  <div className="flex justify-center">
                    <CheckCircle className="text-neutral-900 w-16 h-16 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-normal tracking-wide text-black">
                      ¡Reserva Confirmada!
                    </h3>
                    <p className="text-sm text-gray-500 font-light max-w-sm mx-auto">
                      Tu turno ha quedado agendado en nuestro sistema. Guardamos los detalles asociados a tu email.
                    </p>
                  </div>

                  {/* Resumen final en tarjeta */}
                  <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 text-xs max-w-md mx-auto text-left space-y-3 font-light">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-400">Cliente:</span>
                      <span className="font-normal text-black">{successBooking.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-400">Email:</span>
                      <span className="font-normal text-black">{successBooking.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-400">Fecha:</span>
                      <span className="font-normal text-black">{formatDateReadable(successBooking.date)}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-gray-400">Horario:</span>
                      <span className="font-normal text-black">{successBooking.time} hs (Duración 45m)</span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => { setView("home"); setBookingStep(1); }}
                      className="bg-black text-[#faf9f6] text-xs uppercase tracking-widest font-medium px-8 py-3.5 hover:bg-neutral-800 transition-all rounded-sm shadow-sm"
                    >
                      Volver al inicio
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. VISTA GESTIONAR MI TURNO */}
          {view === "manage" && (
            <div className="bg-white/95 rounded-md border border-[#e0deda]/40 shadow-xl max-w-2xl mx-auto p-6 md:p-8 animate-fade-in">
              
              {/* Header */}
              <div className="border-b border-gray-100 pb-5 mb-8">
                <h2 className="text-lg font-light tracking-widest uppercase text-black">
                  Gestionar Mi Turno
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-light">
                  Consulta, cancela o reprograma tus reservas ingresando tu correo.
                </p>
              </div>

              {/* Errores de Gestión */}
              {manageError && (
                <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm mb-6 font-light">
                  {manageError}
                </div>
              )}

              {/* STAGE 1: INGRESO EMAIL */}
              {!searched ? (
                <form onSubmit={handleSearchBookings} className="space-y-6 max-w-md mx-auto py-4">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium">
                      Introduce tu Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="email"
                        required
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="Ej: cliente@email.com"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 font-light"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={searchingEmail || !searchEmail}
                    className="w-full bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-[0.2em] font-medium py-3.5 rounded-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {searchingEmail ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Buscando reservas...
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        Consultar turnos
                      </>
                    )}
                  </button>
                </form>
              ) : (
                
                // STAGE 2: LISTADO DE TURNOS
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Informador de Email */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 border border-gray-100 rounded-sm text-xs">
                    <div className="flex items-center gap-2 text-gray-600 font-light">
                      <Mail size={13} />
                      <span>Reservas asociadas a: <strong className="font-normal text-black">{searchEmail}</strong></span>
                    </div>
                    <button
                      onClick={() => setSearched(false)}
                      className="text-gray-400 hover:text-black font-light border-b border-gray-200 hover:border-black pb-[1px] transition-all"
                    >
                      Cambiar Email
                    </button>
                  </div>

                  {myBookings.length === 0 ? (
                    <div className="text-center py-12 space-y-4 border border-dashed border-gray-100 rounded-sm">
                      <p className="text-sm text-gray-400 font-light">
                        No se encontraron reservas registradas para este email.
                      </p>
                      <button
                        onClick={() => setView("booking")}
                        className="text-xs uppercase tracking-widest font-medium border-b border-black pb-1 hover:text-gray-500 transition-colors"
                      >
                        Reservar un turno ahora
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBookings.map((booking) => {
                        const isPast = new Date(`${booking.date}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0));
                        
                        return (
                          <div 
                            key={booking.id} 
                            className={`p-5 rounded-sm border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                              booking.status === "cancelled" 
                                ? "bg-red-50/10 border-red-100/50 opacity-60" 
                                : booking.status === "rescheduled"
                                  ? "bg-gray-50/50 border-gray-100 opacity-60"
                                  : "bg-white border-[#e0deda]/40 shadow-sm"
                            }`}
                          >
                            {/* Detalles */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 font-medium rounded-full ${
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
                                
                                <span className="text-[10px] text-gray-400 font-light">
                                  ID: {booking.id.substring(0, 8)}...
                                </span>
                              </div>

                              <div className="space-y-1 text-xs">
                                <p className="font-normal text-black flex items-center gap-2">
                                  <CalendarIcon size={13} className="text-gray-400" />
                                  {formatDateReadable(booking.date)}
                                </p>
                                <p className="text-gray-500 font-light flex items-center gap-2">
                                  <Clock size={13} className="text-gray-400" />
                                  {booking.time} hs (45 min)
                                </p>
                                
                                {booking.rescheduledFrom && (
                                  <p className="text-[10px] text-gray-400 font-light italic mt-1">
                                    Reprogramado del: {formatDateReadable(booking.rescheduledFrom.date)} a las {booking.rescheduledFrom.time} hs
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Acciones */}
                            {booking.status === "reserved" && !isPast && (
                              <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRescheduleDate("");
                                    setRescheduleTime("");
                                    setRescheduleSlots([]);
                                    setShowRescheduleModal(booking);
                                  }}
                                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 border border-gray-200 hover:border-black text-xs uppercase tracking-widest text-neutral-700 hover:text-black font-medium px-4 py-2.5 rounded-sm transition-all bg-white"
                                >
                                  <RefreshCw size={12} />
                                  Reprogramar
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => setShowCancelModal(booking)}
                                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 border border-red-200 hover:border-red-600 hover:bg-red-50 text-xs uppercase tracking-widest text-red-600 font-medium px-4 py-2.5 rounded-sm transition-all bg-white"
                                >
                                  <Trash2 size={12} />
                                  Cancelar
                                </button>
                              </div>
                            )}

                            {isPast && booking.status === "reserved" && (
                              <span className="text-[11px] text-gray-400 font-light italic">
                                Turno finalizado
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setSearched(false)}
                      className="text-xs uppercase tracking-widest font-medium border-b border-black pb-1 hover:text-gray-500 transition-colors"
                    >
                      Buscar otro email
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e0deda]/30 bg-white/40 py-6 text-center text-xs tracking-wider text-neutral-400 font-light">
        <div className="max-w-6xl mx-auto px-6">
          © {new Date().getFullYear()} CUTANEO. Todos los derechos reservados.
        </div>
      </footer>

      {/* --- MODAL DE CANCELACIÓN --- */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-md p-6 max-w-sm w-full space-y-6">
            <div className="flex justify-between items-start">
              <h4 className="text-sm uppercase tracking-widest font-medium text-black">
                Confirmar Cancelación
              </h4>
              <button 
                onClick={() => setShowCancelModal(null)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs font-light text-neutral-500 leading-relaxed space-y-3">
              <p>
                ¿Estás seguro que deseas cancelar tu turno del día <strong className="font-normal text-black">{formatDateReadable(showCancelModal.date)}</strong> a las <strong className="font-normal text-black">{showCancelModal.time} hs</strong>?
              </p>
              <p className="text-red-500/80 italic text-[10px]">
                * Esta acción no se puede deshacer y el horario quedará inmediatamente liberado para otro cliente.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(null)}
                className="flex-1 border border-gray-200 hover:border-black text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition-all"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancellingBooking}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition-all flex items-center justify-center gap-2"
              >
                {cancellingBooking ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  "Sí, Cancelar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE REPROGRAMACIÓN --- */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white border border-[#e0deda]/40 shadow-2xl rounded-md p-6 md:p-8 max-w-xl w-full my-8 space-y-6">
            
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-sm uppercase tracking-widest font-medium text-black">
                  Reprogramar Turno
                </h4>
                <p className="text-[10px] text-gray-400 font-light mt-1">
                  Selecciona una nueva fecha y hora para cambiar tu turno.
                </p>
              </div>
              <button 
                onClick={() => setShowRescheduleModal(null)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {rescheduleError && (
              <div className="bg-red-50/75 border-l-[3px] border-red-500 text-red-700 text-xs p-4 rounded-sm font-light">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleBooking} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Calendario de Reprogramación */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <CalendarIcon size={12} />
                    1. Nuevo Día
                  </label>
                  
                  <div className="border border-gray-100 rounded-sm p-3 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      <button type="button" onClick={handlePrevMonth} className="text-gray-500 hover:text-black p-1">
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-[10px] font-medium uppercase tracking-widest text-black">
                        {getMonthName()}
                      </span>
                      <button type="button" onClick={handleNextMonth} className="text-gray-500 hover:text-black p-1">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center text-[9px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                      <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span><span>Do</span>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {renderCalendarDays(true)}
                    </div>
                  </div>
                </div>

                {/* Horarios de Reprogramación */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Clock size={12} />
                    2. Nuevo Horario (45 min)
                  </label>

                  {!rescheduleDate ? (
                    <div className="h-44 border border-dashed border-gray-100 rounded-sm flex items-center justify-center bg-gray-50/30">
                      <p className="text-[10px] text-gray-400 font-light">
                        Selecciona un día primero
                      </p>
                    </div>
                  ) : loadingRescheduleSlots ? (
                    <div className="h-44 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-neutral-400" size={20} />
                      <p className="text-[10px] text-gray-400 font-light">Cargando disponibilidad...</p>
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

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(null)}
                  className="flex-1 border border-gray-200 hover:border-black text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition-all"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={submittingReschedule || !rescheduleDate || !rescheduleTime}
                  className={`flex-1 text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition-all flex items-center justify-center gap-2 ${
                    rescheduleDate && rescheduleTime
                      ? "bg-black text-[#faf9f6] hover:bg-neutral-800"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {submittingReschedule ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import { useLayoutEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CirclePlus,
  House,
  LogOut,
  Map,
  Megaphone,
  MessageCircle,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { useLocation, useNavigate } from "react-router";

const perfilInicial = {
  nombre: "Danny Torres",
  usuario: "dannytorres",
  foto: "",
};

const obtenerPerfil = () => {
  try {
    return {
      ...perfilInicial,
      ...JSON.parse(localStorage.getItem("reportard_profile") || "{}"),
    };
  } catch {
    return perfilInicial;
  }
};

const obtenerIniciales = (nombre) =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");

const enlaces = [
  { texto: "Inicio", ruta: "/", icono: House },
  { texto: "Buscar", ruta: "/buscar", icono: Search },
  { texto: "Mapa ciudadano", ruta: "/mapa", icono: Map },
  { texto: "Comunidades", ruta: "/comunidades", icono: UsersRound },
  { texto: "Mensajes", ruta: "/mensajes", icono: MessageCircle },
  { texto: "En vivo", ruta: "/en-vivo", icono: Radio },
  { texto: "Notificaciones", ruta: "/notificaciones", icono: Bell },
  { texto: "Mi perfil", ruta: "/perfil", icono: UserRound },
];

const tendencias = [
  {
    tema: "Alumbrado público",
    cantidad: "38 reportes",
    crecimiento: "+18%",
    nivel: 86,
    color: "from-amber-400 to-orange-500",
  },
  {
    tema: "Calles de Santiago",
    cantidad: "24 publicaciones",
    crecimiento: "+11%",
    nivel: 67,
    color: "from-red-400 to-rose-500",
  },
  {
    tema: "Jornadas comunitarias",
    cantidad: "17 conversaciones",
    crecimiento: "+8%",
    nivel: 49,
    color: "from-blue-400 to-violet-500",
  },
];

const comunidades = [
  {
    nombre: "Santiago Centro",
    miembros: "2.4 mil",
    iniciales: "SC",
    actividad: "126 activos",
    color: "from-blue-500 to-cyan-400",
  },
  {
    nombre: "Los Jardines",
    miembros: "986",
    iniciales: "LJ",
    actividad: "74 activos",
    color: "from-violet-500 to-fuchsia-400",
  },
  {
    nombre: "Cienfuegos",
    miembros: "1.3 mil",
    iniciales: "CF",
    actividad: "91 activos",
    color: "from-emerald-500 to-teal-400",
  },
];

export default function DesktopChrome({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reducirMovimiento = useReducedMotion();
  const [conexion, setConexion] = useState(null);
  const [ventana, setVentana] = useState({
    ancho: window.innerWidth,
    alto: window.innerHeight,
  });
  const perfil = obtenerPerfil();
  const iniciales = obtenerIniciales(perfil.nombre);

  const estaActivo = (ruta) => {
    if (ruta === "/") return location.pathname === "/";
    return location.pathname.startsWith(ruta);
  };

  const cerrarSesion = () => {
    const confirmado = window.confirm(
      "¿Seguro que deseas cerrar tu sesión en ReportaRD?",
    );

    if (confirmado) onLogout();
  };

  useLayoutEffect(() => {
    const actualizarVentana = () => {
      setVentana({ ancho: window.innerWidth, alto: window.innerHeight });
      setConexion(null);
    };

    window.addEventListener("resize", actualizarVentana);
    return () => window.removeEventListener("resize", actualizarVentana);
  }, []);

  const activarConexion = (evento, lado, id, color = "#ef4444") => {
    if (reducirMovimiento) return;

    const origen = evento.currentTarget.getBoundingClientRect();
    const contenedor = document.querySelector(
      "[data-reportard-main] .max-w-md",
    );

    if (!contenedor) return;

    const centro = contenedor.getBoundingClientRect();
    const desdeX = lado === "izquierda" ? origen.right : origen.left;
    const hastaX = lado === "izquierda" ? centro.left : centro.right;
    const desdeY = origen.top + origen.height / 2;
    const hastaY = Math.min(
      Math.max(desdeY, centro.top + 36),
      Math.min(centro.bottom - 36, window.innerHeight - 36),
    );

    setConexion({
      id,
      lado,
      color,
      desdeX,
      desdeY,
      hastaX,
      hastaY,
    });
  };

  const desactivarConexion = () => setConexion(null);

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          html,
          body,
          [data-reportard-main],
          .reportard-scrollbar {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }

          html::-webkit-scrollbar,
          body::-webkit-scrollbar,
          [data-reportard-main]::-webkit-scrollbar,
          .reportard-scrollbar::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }

          .reportard-scrollbar {
            overscroll-behavior: contain;
          }

          [data-reportard-main] .max-w-md {
            max-width: 32rem !important;
            box-shadow: 0 24px 80px rgba(0, 0, 0, .24);
          }

          [data-reportard-left],
          [data-reportard-right] {
            contain: layout paint;
          }

          [data-reportard-left],
          [data-reportard-right],
          [data-reportard-right] .backdrop-blur-xl {
            -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <AmbienteDigital reducirMovimiento={reducirMovimiento} />

      <ConexionesAnimadas
        conexion={conexion}
        ventana={ventana}
        reducirMovimiento={reducirMovimiento}
      />

      <RedDeEnergia
        ruta={location.pathname}
        reducirMovimiento={reducirMovimiento}
      />

      <motion.aside
        initial={reducirMovimiento ? false : { x: -28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          x: { type: "spring", stiffness: 180, damping: 22 },
          opacity: { duration: 0.35 },
        }}
        data-reportard-left
        className="fixed bottom-4 left-4 top-4 z-40 hidden w-64 flex-col overflow-hidden rounded-[1.9rem] border border-blue-400/15 bg-gradient-to-b from-[#0b1b31]/98 via-[#081525]/98 to-[#07111f]/98 text-white shadow-[0_24px_80px_rgba(0,0,0,.38),0_0_45px_rgba(37,99,235,.07)] backdrop-blur-xl lg:flex xl:left-[calc(50%_-_36rem)]"
      >
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full bg-red-500/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

        <header className="relative border-b border-white/[0.07] px-5 pb-5 pt-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 text-left"
          >
            <motion.span
              animate={
                reducirMovimiento
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 0 rgba(59,130,246,0)",
                        "0 0 24px rgba(59,130,246,.3)",
                        "0 0 0 rgba(59,130,246,0)",
                      ],
                    }
              }
              transition={{ duration: 3, repeat: Infinity }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/20 bg-gradient-to-br from-blue-500/25 to-violet-500/15 text-blue-300"
            >
              <Sparkles size={19} />
            </motion.span>

            <span>
              <span className="block text-xl font-black tracking-tight text-white">
                Reporta<span className="text-red-400">RD</span>
              </span>

              <span className="mt-0.5 block text-[9px] font-semibold tracking-[0.28em] text-blue-300/45">
                RED CIUDADANA
              </span>
            </span>
          </button>

          <motion.button
            type="button"
            onClick={() => navigate("/perfil")}
            whileHover={reducirMovimiento ? undefined : { y: -2 }}
            whileTap={reducirMovimiento ? undefined : { scale: 0.98 }}
            className="group relative mt-5 w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-3.5 text-left shadow-lg shadow-black/10 transition hover:border-blue-400/25"
          >
            <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-blue-500/20" />

            <span className="relative flex items-center gap-3">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-visible rounded-full bg-gradient-to-br from-blue-500 to-red-500 p-[2px] font-bold shadow-lg shadow-blue-950/40">
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0a1729]">
                  {perfil.foto ? (
                    <img
                      src={perfil.foto}
                      alt={`Foto de ${perfil.nombre}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    iniciales
                  )}
                </span>

                <span
                  title="Activo ahora"
                  className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[3px] border-[#0a1729] bg-green-400 shadow-[0_0_10px_rgba(74,222,128,.85)]"
                />
              </span>

              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-white">
                  {perfil.nombre}
                </strong>

                <span className="mt-0.5 block truncate text-[10px] font-medium text-green-300">
                  ● Activo ahora
                </span>

                <span className="block truncate text-[10px] text-slate-500">
                  @{perfil.usuario}
                </span>
              </span>

              <ChevronRight
                size={16}
                className="text-blue-300/35 transition group-hover:translate-x-1 group-hover:text-blue-300"
              />
            </span>

            <span className="relative mt-3 flex items-center justify-between text-[9px] text-slate-500">
              <span>Nivel 4 · Colaborador</span>
              <span className="font-semibold text-blue-300">780 XP</span>
            </span>

            <span className="relative mt-1.5 block h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 0.9, delay: 0.45 }}
                className="block h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-400 to-red-400"
              />
            </span>
          </motion.button>
        </header>

        <nav className="reportard-scrollbar relative flex-1 space-y-1 overflow-y-auto p-3 pr-2.5">
          <p className="mb-2 px-3 pt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Tu espacio
          </p>

          {enlaces.map(({ texto, ruta, icono: Icono }) => {
            const activo = estaActivo(ruta);

            return (
              <motion.button
                type="button"
                key={ruta}
                onClick={() => navigate(ruta)}
                onMouseEnter={(evento) =>
                  activarConexion(
                    evento,
                    "izquierda",
                    `nav-${ruta}`,
                    activo ? "#ef4444" : "#3b82f6",
                  )
                }
                onMouseLeave={desactivarConexion}
                whileHover={reducirMovimiento ? undefined : { x: 4 }}
                whileTap={reducirMovimiento ? undefined : { scale: 0.97 }}
                className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-left text-sm transition duration-200 ${
                  activo
                    ? "border border-red-400/15 bg-gradient-to-r from-red-500/15 to-orange-500/[0.04] font-semibold text-red-300 shadow-lg shadow-red-950/10"
                    : "border border-transparent text-slate-300/75 hover:border-white/[0.06] hover:bg-white/[0.055] hover:text-white"
                }`}
              >
                {activo && (
                  <motion.span
                    layoutId="desktop-active-route"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="absolute left-0 h-7 w-1 rounded-r-full bg-red-500 shadow-lg shadow-red-500/50"
                  />
                )}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                    activo
                      ? "bg-red-500/15 text-red-300"
                      : "bg-white/[0.035] text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-300"
                  }`}
                >
                  <Icono
                    size={17}
                    fill={activo && ruta === "/" ? "currentColor" : "none"}
                  />
                </span>

                <span className="flex-1">{texto}</span>

                {ruta === "/notificaciones" && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white shadow-lg shadow-red-500/25">
                    3
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="relative space-y-2 border-t border-white/[0.07] p-3">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-blue-400/10 bg-blue-500/[0.055] px-3 py-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <Activity size={16} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-green-400" />
            </span>

            <span>
              <strong className="block text-[10px] text-blue-200">
                Comunidad conectada
              </strong>
              <span className="text-[9px] text-slate-500">
                291 ciudadanos activos
              </span>
            </span>
          </div>

          <motion.button
            type="button"
            onClick={() => navigate("/publicar")}
            whileHover={reducirMovimiento ? undefined : { y: -2, scale: 1.01 }}
            whileTap={reducirMovimiento ? undefined : { scale: 0.97 }}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-500 to-orange-500 px-4 py-3 text-sm font-bold shadow-[0_12px_28px_rgba(239,68,68,.22)]"
          >
            <motion.span
              animate={reducirMovimiento ? undefined : { x: ["-140%", "180%"] }}
              transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-y-0 w-12 rotate-12 bg-white/15 blur-md"
            />

            <CirclePlus size={19} />
            Crear contenido
          </motion.button>
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </motion.aside>

      <motion.aside
        initial={reducirMovimiento ? false : { x: 28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          x: { type: "spring", stiffness: 180, damping: 22, delay: 0.08 },
          opacity: { duration: 0.35, delay: 0.08 },
        }}
        data-reportard-right
        className="reportard-scrollbar fixed bottom-4 right-4 top-4 z-30 hidden w-72 space-y-4 overflow-y-auto overflow-x-hidden pb-2 pr-1 text-white xl:right-[calc(50%_-_36rem)] xl:block"
      >
        <section className="group relative overflow-hidden rounded-[1.9rem] border border-amber-300/15 bg-gradient-to-br from-[#0d1c30]/98 via-[#081525]/98 to-amber-950/20 p-5 shadow-[0_20px_55px_rgba(0,0,0,.3),0_0_35px_rgba(245,158,11,.05)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl transition duration-700 group-hover:bg-amber-500/15" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.span
                animate={
                  reducirMovimiento
                    ? undefined
                    : { rotate: [0, 5, 0, -5, 0] }
                }
                transition={{ duration: 4, repeat: Infinity }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-500/15 text-amber-300 shadow-lg shadow-amber-950/20"
              >
                <TrendingUp size={19} />
              </motion.span>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300/70">
                  Pulso ciudadano
                </p>
                <h2 className="mt-0.5 text-sm font-bold text-white">
                  Lo que mueve Santiago
                </h2>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full border border-green-400/15 bg-green-500/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-green-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              En vivo
            </span>
          </div>

          <div className="relative mt-5 space-y-2">
            {tendencias.map((tendencia, indice) => (
              <motion.button
                type="button"
                key={tendencia.tema}
                onClick={() => navigate("/buscar")}
                onMouseEnter={(evento) =>
                  activarConexion(
                    evento,
                    "derecha",
                    `tendencia-${indice}`,
                    "#f59e0b",
                  )
                }
                onMouseLeave={desactivarConexion}
                whileHover={reducirMovimiento ? undefined : { x: 3 }}
                whileTap={reducirMovimiento ? undefined : { scale: 0.98 }}
                className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.035] p-3 text-left transition hover:border-amber-300/15 hover:bg-white/[0.065]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[10px] font-black text-slate-500">
                    {String(indice + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs text-slate-100">
                      {tendencia.tema}
                    </strong>

                    <span className="mt-0.5 block text-[9px] text-slate-500">
                      {tendencia.cantidad}
                    </span>
                  </span>

                  <span className="flex items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-1 text-[8px] font-bold text-green-300">
                    <ArrowUpRight size={10} />
                    {tendencia.crecimiento}
                  </span>
                </span>

                <span className="mt-2.5 block h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${tendencia.nivel}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + indice * 0.12 }}
                    className={`block h-full rounded-full bg-gradient-to-r ${tendencia.color}`}
                  />
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="group relative overflow-hidden rounded-[1.9rem] border border-violet-300/15 bg-gradient-to-br from-[#0c192d]/98 via-[#081525]/98 to-violet-950/20 p-5 shadow-[0_20px_55px_rgba(0,0,0,.28),0_0_35px_rgba(139,92,246,.05)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl transition duration-700 group-hover:bg-violet-500/15" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300/65">
                Conecta y participa
              </p>
              <h2 className="mt-1 text-sm font-bold text-white">
                Comunidades para ti
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/comunidades")}
              className="flex items-center gap-1 text-[9px] font-semibold text-violet-300 transition hover:text-white"
            >
              Explorar
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="relative mt-4 space-y-2">
            {comunidades.map((grupo) => (
              <motion.button
                type="button"
                key={grupo.nombre}
                onClick={() => navigate("/comunidades")}
                onMouseEnter={(evento) =>
                  activarConexion(
                    evento,
                    "derecha",
                    `comunidad-${grupo.iniciales}`,
                    "#8b5cf6",
                  )
                }
                onMouseLeave={desactivarConexion}
                whileHover={reducirMovimiento ? undefined : { x: 3, y: -1 }}
                whileTap={reducirMovimiento ? undefined : { scale: 0.98 }}
                className="group/comunidad flex w-full items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-2.5 text-left transition hover:border-violet-300/15 hover:bg-white/[0.06]"
              >
                <span className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grupo.color} p-[1px] shadow-lg shadow-black/20`}>
                  <span className="flex h-full w-full items-center justify-center rounded-[0.9rem] bg-[#0a1728] text-xs font-bold text-white">
                    {grupo.iniciales}
                  </span>

                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[3px] border-[#0a1728] bg-green-400" />
                </span>

                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-xs text-slate-100">
                    {grupo.nombre}
                  </strong>

                  <span className="mt-0.5 block text-[9px] text-slate-500">
                    {grupo.miembros} miembros
                  </span>

                  <span className="mt-0.5 block text-[8px] font-medium text-green-300/70">
                    {grupo.actividad}
                  </span>
                </span>

                <span className="rounded-full border border-violet-300/10 bg-violet-500/10 px-2 py-1 text-[8px] font-semibold text-violet-300 transition group-hover/comunidad:bg-violet-500/20">
                  Ver
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <motion.button
          type="button"
          onClick={() => navigate("/reportar")}
          onMouseEnter={(evento) =>
            activarConexion(
              evento,
              "derecha",
              "crear-reporte",
              "#ef4444",
            )
          }
          onMouseLeave={desactivarConexion}
          whileHover={reducirMovimiento ? undefined : { y: -3, scale: 1.01 }}
          whileTap={reducirMovimiento ? undefined : { scale: 0.98 }}
          className="group relative w-full overflow-hidden rounded-[1.9rem] border border-red-400/25 bg-gradient-to-br from-red-500/25 via-red-950/30 to-orange-500/10 p-5 text-left shadow-[0_20px_55px_rgba(0,0,0,.3),0_0_35px_rgba(239,68,68,.09)]"
        >
          <span className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-red-400/15 blur-2xl transition duration-700 group-hover:scale-125 group-hover:bg-red-400/20" />
          <span className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />
          <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-red-300/70 to-transparent" />

          <span className="relative flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200/20 bg-red-500 text-white shadow-lg shadow-red-500/35">
              <Megaphone size={20} />
            </span>

            <span className="rounded-full border border-red-300/15 bg-red-500/15 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-red-200">
              Acción ciudadana
            </span>
          </span>

          <strong className="relative mt-4 block text-base text-white">
            ¿Ves un problema cerca?
          </strong>

          <span className="relative mt-1.5 block text-xs leading-5 text-slate-400">
            Hazlo visible. Tu comunidad puede confirmarlo y darle seguimiento.
          </span>

          <span className="relative mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] font-semibold text-red-200">
            Crear un reporte
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition group-hover:translate-x-1 group-hover:bg-white/15">
              <ArrowUpRight size={14} />
            </span>
          </span>
        </motion.button>

        <div className="flex items-center justify-center gap-2 py-2 text-[9px] text-slate-600">
          <ShieldCheck size={13} className="text-green-400/50" />
          Identidad verificada · Comunidad segura
        </div>
      </motion.aside>
    </>
  );
}

function ConexionesAnimadas({
  conexion,
  ventana,
  reducirMovimiento,
}) {
  if (reducirMovimiento) return null;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${ventana.ancho} ${ventana.alto}`}
      className="pointer-events-none fixed inset-0 z-[35] hidden h-screen w-screen lg:block"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="reportard-connection-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <AnimatePresence>
        {conexion && (
          <motion.g
            key={conexion.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.path
              d={crearRuta(conexion)}
              fill="none"
              stroke={conexion.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              filter="url(#reportard-connection-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.72 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            />

            <motion.circle
              cx={conexion.hastaX}
              cy={conexion.hastaY}
              r="4"
              fill={conexion.color}
              filter="url(#reportard-connection-glow)"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.35, delay: 0.18 }}
            />

            <motion.circle
              cx={conexion.hastaX}
              cy={conexion.hastaY}
              r="9"
              fill="none"
              stroke={conexion.color}
              strokeWidth="1"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.4], opacity: [0.8, 0] }}
              transition={{ duration: 1.15, repeat: Infinity }}
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function crearRuta(conexion) {
  const {
    lado,
    desdeX,
    desdeY,
    hastaX,
    hastaY,
  } = conexion;
  const distancia = Math.max(Math.abs(hastaX - desdeX) * 0.48, 45);
  const control1 =
    lado === "izquierda" ? desdeX + distancia : desdeX - distancia;
  const control2 =
    lado === "izquierda" ? hastaX - distancia : hastaX + distancia;

  return `M ${desdeX} ${desdeY} C ${control1} ${desdeY}, ${control2} ${hastaY}, ${hastaX} ${hastaY}`;
}

const coloresCables = ["#3b82f6", "#ef4444", "#8b5cf6"];

function AmbienteDigital({ reducirMovimiento }) {
  if (reducirMovimiento) return null;

  const particulas = [
    [12, 18, 0], [20, 72, 1.2], [31, 38, 2.4],
    [68, 22, 0.7], [77, 64, 1.8], [89, 34, 3],
    [7, 51, 2], [94, 78, 0.3],
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 hidden overflow-hidden lg:block">
      {particulas.map(([izquierda, arriba, retraso], indice) => (
        <motion.span
          key={`${izquierda}-${arriba}`}
          className="absolute h-1 w-1 rounded-full bg-blue-400/60 shadow-[0_0_10px_rgba(59,130,246,.8)]"
          style={{ left: `${izquierda}%`, top: `${arriba}%` }}
          animate={{
            y: [0, -14, 0],
            x: [0, indice % 2 ? 5 : -5, 0],
            opacity: [0.12, 0.65, 0.12],
            scale: [0.7, 1.25, 0.7],
          }}
          transition={{
            duration: 5.5 + indice * 0.45,
            delay: retraso,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function RedDeEnergia({ ruta, reducirMovimiento }) {
  const [red, setRed] = useState(null);

  useLayoutEffect(() => {
    if (reducirMovimiento || window.innerWidth < 1024) {
      return undefined;
    }

    const calcular = () => {
      const izquierda = document.querySelector("[data-reportard-left]");
      const centro = document.querySelector(
        "[data-reportard-main] .max-w-md",
      );
      const derecha = document.querySelector("[data-reportard-right]");

      if (!izquierda || !centro) return;

      const cajaIzquierda = izquierda.getBoundingClientRect();
      const cajaCentro = centro.getBoundingClientRect();
      const cajaDerecha = derecha?.getBoundingClientRect();
      const alto = window.innerHeight;
      const posiciones = [0.29, 0.51, 0.73];
      const limiteSuperior = Math.max(cajaCentro.top + 70, 90);
      const limiteInferior = Math.min(cajaCentro.bottom - 70, alto - 90);
      const altoVisible = Math.max(limiteInferior - limiteSuperior, 180);

      setRed({
        ancho: window.innerWidth,
        alto,
        izquierda: posiciones.map((posicion, indice) => ({
          id: `izquierda-${indice}`,
          color: coloresCables[indice],
          desdeX: cajaIzquierda.right - 2,
          desdeY: cajaIzquierda.top + cajaIzquierda.height * posicion,
          hastaX: cajaCentro.left + 2,
          hastaY: limiteSuperior + altoVisible * posicion,
          lado: "izquierda",
        })),
        derecha: cajaDerecha
          ? posiciones.map((posicion, indice) => ({
              id: `derecha-${indice}`,
              color: coloresCables[(indice + 1) % coloresCables.length],
              desdeX: cajaDerecha.left + 2,
              desdeY: cajaDerecha.top + cajaDerecha.height * posicion,
              hastaX: cajaCentro.right - 2,
              hastaY: limiteSuperior + altoVisible * posicion,
              lado: "derecha",
            }))
          : [],
      });
    };

    const frame = window.requestAnimationFrame(calcular);
    window.addEventListener("resize", calcular);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", calcular);
    };
  }, [ruta, reducirMovimiento]);

  if (reducirMovimiento || window.innerWidth < 1024 || !red) {
    return null;
  }

  const cables = [...red.izquierda, ...red.derecha];

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${red.ancho} ${red.alto}`}
      preserveAspectRatio="none"
      className="pointer-events-none fixed inset-0 z-[25] hidden h-screen w-screen lg:block"
    >
      <defs>
        <filter id="reportard-cable-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="energia" />
          <feMerge>
            <feMergeNode in="energia" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {cables.map((cable, indice) => {
        const rutaBase = crearRutaCable(cable, 0);

        return (
          <motion.g key={cable.id}>
            <motion.path
              d={rutaBase}
              fill="none"
              stroke={cable.color}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                pathLength: { duration: 0.9, delay: indice * 0.08 },
              }}
            />

            <motion.path
              d={rutaBase}
              fill="none"
              stroke={cable.color}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="7 13"
              filter="url(#reportard-cable-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                strokeDashoffset: [0, -80],
              }}
              transition={{
                pathLength: { duration: 1, delay: 0.15 + indice * 0.08 },
                strokeDashoffset: {
                  duration: 3.2 + indice * 0.12,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              opacity="0.72"
            />

            <circle
              cx={cable.desdeX}
              cy={cable.desdeY}
              r="4.5"
              fill={cable.color}
              filter="url(#reportard-cable-glow)"
              opacity="0.85"
            />

            <circle
              cx={cable.hastaX}
              cy={cable.hastaY}
              r="4.5"
              fill={cable.color}
              filter="url(#reportard-cable-glow)"
              opacity="0.85"
            />

            <circle
              r="3.2"
              fill={cable.color}
              opacity="0.95"
              filter="url(#reportard-cable-glow)"
            >
              <animateMotion
                path={rutaBase}
                dur={`${3.5 + indice * 0.24}s`}
                begin={`${indice * -0.42}s`}
                repeatCount="indefinite"
              />
            </circle>
          </motion.g>
        );
      })}
    </svg>
  );
}

function crearRutaCable(cable, desplazamientoY) {
  const { lado, desdeX, desdeY, hastaX, hastaY } = cable;
  const distancia = Math.max(Math.abs(hastaX - desdeX) * 0.42, 70);
  const control1 =
    lado === "izquierda" ? desdeX + distancia : desdeX - distancia;
  const control2 =
    lado === "izquierda" ? hastaX - distancia : hastaX + distancia;

  return `M ${desdeX} ${desdeY} C ${control1} ${desdeY + desplazamientoY}, ${control2} ${hastaY - desplazamientoY}, ${hastaX} ${hastaY}`;
}
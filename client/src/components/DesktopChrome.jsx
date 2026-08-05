import { useLayoutEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  CirclePlus,
  House,
  LogOut,
  Map,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
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
  { texto: "Notificaciones", ruta: "/notificaciones", icono: Bell },
  { texto: "Mi perfil", ruta: "/perfil", icono: UserRound },
];

const tendencias = [
  { tema: "Alumbrado público", cantidad: "38 reportes" },
  { tema: "Calles de Santiago", cantidad: "24 publicaciones" },
  { tema: "Jornadas comunitarias", cantidad: "17 conversaciones" },
];

const comunidades = [
  { nombre: "Santiago Centro", miembros: "2.4 mil", iniciales: "SC" },
  { nombre: "Los Jardines", miembros: "986", iniciales: "LJ" },
  { nombre: "Cienfuegos", miembros: "1.3 mil", iniciales: "CF" },
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
          [data-reportard-main] .max-w-md {
            max-width: 32rem !important;
            animation: reportard-central-float 12s linear infinite;
            box-shadow: 0 24px 80px rgba(0, 0, 0, .24);
            will-change: transform;
            transform-style: preserve-3d;
          }

          [data-reportard-left] {
            animation: reportard-left-float 10s linear infinite;
            will-change: transform;
          }

          [data-reportard-right] {
            animation: reportard-right-float 11.5s linear infinite;
            will-change: transform;
          }
        }

        @keyframes reportard-central-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotateX(0deg); }
          25% { transform: translate3d(0, -3px, 0) rotateX(.12deg); }
          50% { transform: translate3d(0, 0, 0) rotateX(0deg); }
          75% { transform: translate3d(0, 3px, 0) rotateX(-.12deg); }
        }

        @keyframes reportard-left-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          25% { transform: translate3d(1px, -3px, 0); }
          50% { transform: translate3d(0, 0, 0); }
          75% { transform: translate3d(-1px, 3px, 0); }
        }

        @keyframes reportard-right-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          25% { transform: translate3d(-1px, 3px, 0); }
          50% { transform: translate3d(0, 0, 0); }
          75% { transform: translate3d(1px, -3px, 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reportard-main] .max-w-md,
          [data-reportard-left],
          [data-reportard-right] { animation: none !important; }
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
        className="fixed bottom-4 left-4 top-4 z-40 hidden w-64 flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#081424]/95 text-white shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex xl:left-[calc(50%_-_36rem)]"
      >
        <header className="border-b border-white/10 px-5 py-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-left"
          >
            <span className="text-xl font-black tracking-tight">
              Reporta<span className="text-red-500">RD</span>
            </span>
            <span className="mt-0.5 block text-[9px] font-semibold tracking-[0.28em] text-slate-600">
              RED CIUDADANA
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.035] p-3 text-left transition hover:bg-white/[0.06]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-red-500 font-bold">
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
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm">
                {perfil.nombre}
              </strong>
              <span className="block truncate text-xs text-slate-500">
                @{perfil.usuario}
              </span>
            </span>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </header>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
                className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition duration-200 ${
                  activo
                    ? "bg-red-500/10 font-semibold text-red-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {activo && (
                  <motion.span
                    layoutId="desktop-active-route"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="absolute left-0 h-7 w-1 rounded-r-full bg-red-500 shadow-lg shadow-red-500/50"
                  />
                )}
                <Icono
                  size={20}
                  fill={activo && ruta === "/" ? "currentColor" : "none"}
                />
                {texto}
              </motion.button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => navigate("/publicar")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 text-sm font-bold shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5"
          >
            <CirclePlus size={19} /> Crear contenido
          </button>
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
        className="fixed bottom-4 right-4 top-4 z-30 hidden w-72 space-y-4 overflow-y-auto text-white xl:right-[calc(50%_-_36rem)] xl:block"
      >
        <section className="rounded-[1.75rem] border border-white/10 bg-[#081424]/95 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <TrendingUp size={19} />
            </span>
            <div>
              <h2 className="text-sm font-bold">Actividad ciudadana</h2>
              <p className="text-[10px] text-slate-500">Tendencias en Santiago</p>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            {tendencias.map((tendencia, indice) => (
              <button
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
                className="flex w-full gap-3 rounded-2xl px-2 py-3 text-left transition hover:bg-white/5"
              >
                <span className="text-xs font-bold text-slate-600">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong className="block text-xs text-slate-200">
                    {tendencia.tema}
                  </strong>
                  <span className="mt-0.5 block text-[10px] text-slate-600">
                    {tendencia.cantidad}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-[#081424]/95 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Comunidades sugeridas</h2>
            <button
              type="button"
              onClick={() => navigate("/comunidades")}
              className="text-[10px] font-semibold text-red-400"
            >
              Ver todas
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {comunidades.map((grupo) => (
              <button
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
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 text-xs font-bold text-blue-200">
                  {grupo.iniciales}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-xs">
                    {grupo.nombre}
                  </strong>
                  <span className="text-[10px] text-slate-600">
                    {grupo.miembros} miembros
                  </span>
                </span>
                <ChevronRight size={15} className="text-slate-700" />
              </button>
            ))}
          </div>
        </section>

        <button
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
          className="group relative w-full overflow-hidden rounded-[1.75rem] border border-red-500/20 bg-gradient-to-br from-red-500/15 to-orange-500/[0.06] p-5 text-left shadow-xl shadow-black/20"
        >
          <span className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-red-500/10 transition duration-500 group-hover:scale-125" />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/30">
            <Megaphone size={20} />
          </span>
          <strong className="relative mt-4 block text-sm">
            ¿Ves un problema cerca?
          </strong>
          <span className="relative mt-1 block text-xs leading-5 text-slate-500">
            Repórtalo y permite que la comunidad lo confirme.
          </span>
        </button>

        <div className="flex items-center justify-center gap-2 py-2 text-[10px] text-slate-700">
          <ShieldCheck size={13} /> Comunidad segura · ReportaRD
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
      setRed(null);
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

  if (!red) return null;

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
        const rutaAlta = crearRutaCable(
          cable,
          indice % 2 === 0 ? -5 : 5,
        );

        return (
          <motion.g key={cable.id}>
            <motion.path
              d={rutaBase}
              fill="none"
              stroke={cable.color}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.1"
              filter="url(#reportard-cable-glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, d: [rutaBase, rutaAlta, rutaBase] }}
              transition={{
                pathLength: { duration: 0.9, delay: indice * 0.08 },
                d: {
                  duration: 5.5 + indice * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
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
                opacity: [0.38, 0.9, 0.38],
                strokeDashoffset: [0, -80],
                d: [rutaBase, rutaAlta, rutaBase],
              }}
              transition={{
                pathLength: { duration: 1, delay: 0.15 + indice * 0.08 },
                opacity: { duration: 2.4, repeat: Infinity },
                strokeDashoffset: {
                  duration: 2.2 + indice * 0.18,
                  repeat: Infinity,
                  ease: "linear",
                },
                d: {
                  duration: 5.5 + indice * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />

            <motion.circle
              cx={cable.desdeX}
              cy={cable.desdeY}
              r="4.5"
              fill={cable.color}
              filter="url(#reportard-cable-glow)"
              animate={{ r: [3.5, 6, 3.5], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: indice * 0.16 }}
            />

            <motion.circle
              cx={cable.hastaX}
              cy={cable.hastaY}
              r="4.5"
              fill={cable.color}
              filter="url(#reportard-cable-glow)"
              animate={{ r: [6, 3.5, 6], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: indice * 0.16 }}
            />

            <circle
              r="3.2"
              fill={cable.color}
              opacity="0.95"
              filter="url(#reportard-cable-glow)"
            >
              <animateMotion
                path={rutaBase}
                dur={`${2.8 + indice * 0.32}s`}
                begin={`${indice * -0.42}s`}
                repeatCount="indefinite"
              />
            </circle>

            <circle
              r="1.8"
              fill="white"
              opacity="0.8"
            >
              <animateMotion
                path={rutaBase}
                dur={`${4.1 + indice * 0.28}s`}
                begin={`${indice * -0.67}s`}
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
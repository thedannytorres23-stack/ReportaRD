import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  Bell, CheckCircle2, ChevronRight, CirclePlus, Compass, House, LogOut, Map,
  MessageCircle, Radio, Search, ShieldCheck,
  UserRound, UsersRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";

const PERFIL_BASE = {
  nombre: "Usuario ReportaRD",
  usuario: "ciudadano",
  foto: "",
};

const NAVEGACION = [
  ["Inicio", "/", House],
  ["Buscar", "/buscar", Search],
  ["Mapa ciudadano", "/mapa", Map],
  ["Comunidades", "/comunidades", UsersRound],
  ["Mensajes", "/mensajes", MessageCircle],
  ["En vivo", "/en-vivo", Radio],
  ["Notificaciones", "/notificaciones", Bell],
  ["Mi perfil", "/perfil", UserRound],
];

const CONTEXTOS = {
  "/": [
    "Panel ciudadano",
    "Participa en tu comunidad",
    "Publica una actualización, reporta un problema o revisa qué sucede cerca de ti.",
    ["Sigue temas de tu sector", "Confirma información útil", "Participa con respeto"],
  ],
  "/buscar": [
    "Descubrimiento",
    "Encuentra personas reales",
    "Busca ciudadanos registrados y abre sus perfiles para conectar o conversar.",
    ["Usa nombres o usuarios", "Revisa el perfil antes de conectar", "Evita compartir datos sensibles"],
  ],
  "/mapa": [
    "Mapa ciudadano",
    "Explora reportes cercanos",
    "Consulta incidencias por ubicación y crea un reporte cuando detectes un problema.",
    ["Acerca el mapa para precisar", "Filtra por categoría", "Confirma reportes que conozcas"],
  ],
  "/comunidades": [
    "Comunidades",
    "Conecta con tu sector",
    "Descubre espacios ciudadanos y participa en conversaciones de interés local.",
    ["Elige espacios de tu sector", "Consulta sus normas", "Aporta información verificable"],
  ],
  "/mensajes": [
    "Conversaciones",
    "Mantén el contacto",
    "Continúa tus conversaciones o encuentra ciudadanos con quienes colaborar.",
    ["Mantén un tono respetuoso", "No compartas información privada", "Reporta conductas inapropiadas"],
  ],
  "/en-vivo": [
    "En vivo",
    "Comparte lo que ocurre",
    "Accede al módulo de directos de ReportaRD.",
    ["Describe claramente el contexto", "Protege la privacidad de terceros", "Usa el directo de forma responsable"],
  ],
  "/notificaciones": [
    "Actividad",
    "Revisa tus novedades",
    "Mantente al día con respuestas, conexiones y avances relacionados con tu cuenta.",
    ["Revisa menciones recientes", "Distingue alertas importantes", "Mantén tus preferencias al día"],
  ],
  "/perfil": [
    "Tu identidad",
    "Construye tu reputación",
    "Mantén tu información actualizada y muestra cómo aportas a la comunidad.",
    ["Usa información auténtica", "Añade una ubicación general", "Explica cómo aportas a tu comunidad"],
  ],
};

const leerLocal = (clave) => {
  try {
    return JSON.parse(localStorage.getItem(clave) || "{}");
  } catch {
    return {};
  }
};

const obtenerPerfil = () => ({
  ...PERFIL_BASE,
  ...leerLocal("reportard_user"),
  ...leerLocal("reportard_profile"),
});

const obtenerIniciales = (nombre = "") =>
  nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase()).join("") || "RD";

const obtenerContexto = (pathname) => {
  if (pathname === "/") return CONTEXTOS["/"];
  const ruta = Object.keys(CONTEXTOS)
    .filter((clave) => clave !== "/")
    .find((clave) => pathname.startsWith(clave));
  return CONTEXTOS[ruta || "/"];
};

export default function DesktopChrome({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const raizRef = useRef(null);
  const izquierdaRef = useRef(null);
  const derechaRef = useRef(null);
  const progresoPerfilRef = useRef(null);
  const perfil = obtenerPerfil();
  const iniciales = obtenerIniciales(perfil.nombre);
  const [etiqueta, titulo, descripcion, recomendaciones] = obtenerContexto(location.pathname);
  const camposPerfil = [
    perfil.nombre && perfil.nombre !== PERFIL_BASE.nombre,
    perfil.usuario && perfil.usuario !== PERFIL_BASE.usuario,
    perfil.foto,
    perfil.biografia,
    perfil.ubicacion,
  ];
  const perfilCompletado = Math.round(
    (camposPerfil.filter(Boolean).length / camposPerfil.length) * 100,
  );
  const [mostrarProgresoPerfil, setMostrarProgresoPerfil] = useState(() => {
    if (perfilCompletado < 100) return true;
    return localStorage.getItem("reportard_profile_completed_seen") !== "true";
  });

  useLayoutEffect(() => {
    if (perfilCompletado < 100 || !mostrarProgresoPerfil) return undefined;

    const tarjeta = progresoPerfilRef.current;
    if (!tarjeta) return undefined;

    const reducirMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducirMovimiento) {
      const frame = window.requestAnimationFrame(() => {
        localStorage.setItem("reportard_profile_completed_seen", "true");
        setMostrarProgresoPerfil(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const linea = gsap.timeline({
      delay: 0.45,
      onComplete: () => {
        localStorage.setItem("reportard_profile_completed_seen", "true");
        setMostrarProgresoPerfil(false);
      },
    });

    linea
      .to(tarjeta, {
        borderColor: "rgba(52, 211, 153, .4)",
        backgroundColor: "rgba(6, 78, 59, .2)",
        duration: 0.3,
      })
      .fromTo(
        tarjeta.querySelector("[data-completion-check]"),
        { scale: 0.35, rotate: -18, opacity: 0 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.42, ease: "back.out(1.8)" },
        "-=0.12",
      )
      .to(tarjeta, { scale: 1.018, duration: 0.18, yoyo: true, repeat: 1 })
      .to(tarjeta, {
        opacity: 0,
        y: -10,
        height: 0,
        marginTop: 0,
        paddingTop: 0,
        paddingBottom: 0,
        borderWidth: 0,
        duration: 0.48,
        delay: 1.1,
        ease: "power3.inOut",
      });

    return () => linea.kill();
  }, [mostrarProgresoPerfil, perfilCompletado]);

  const estaActivo = (ruta) =>
    ruta === "/" ? location.pathname === "/" : location.pathname.startsWith(ruta);

  const cerrarSesion = () => {
    if (window.confirm("¿Seguro que deseas cerrar sesión?")) onLogout();
  };

  return (
    <div ref={raizRef} className="contents">
      <style>{`
        @media (min-width: 1024px) {
          [data-reportard-main] .max-w-md {
            max-width: 34rem !important;
            box-shadow: 0 30px 90px rgba(0, 0, 0, .26);
          }
        }
        .reportard-no-scrollbar { scrollbar-width: none; }
        .reportard-no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <aside
        ref={izquierdaRef}
        data-reportard-left
        className="fixed bottom-4 top-4 z-40 hidden w-[15.75rem] flex-col overflow-hidden rounded-[1.15rem] border border-slate-700/60 bg-[#081525]/95 text-white shadow-[0_28px_80px_rgba(0,0,0,.34)] backdrop-blur-xl lg:left-4 lg:flex xl:left-[calc(50%_-_37.5rem)]"
      >
        <header className="border-b border-white/[0.07] px-4 pb-4 pt-5">
          <button type="button" onClick={() => navigate("/")} className="text-left">
            <span className="text-xl font-black tracking-[-0.04em]">
              Reporta<span className="text-red-500">RD</span>
            </span>
            <span className="mt-1 block text-[8px] font-bold tracking-[0.32em] text-slate-600">
              RED CIUDADANA
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="group mt-5 flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition-colors hover:border-blue-400/20 hover:bg-white/[0.06]"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-red-500 font-bold">
              {perfil.foto ? (
                <img src={perfil.foto} alt={`Foto de ${perfil.nombre}`} className="h-full w-full object-cover" />
              ) : iniciales}
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm text-slate-100">{perfil.nombre}</strong>
              <span className="mt-0.5 block truncate text-[11px] text-slate-500">@{perfil.usuario}</span>
            </span>
            <ChevronRight size={16} className="text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-300" />
          </button>
        </header>

        <nav className="reportard-no-scrollbar flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[8px] font-bold uppercase tracking-[0.28em] text-slate-700">
            Navegación
          </p>
          <div className="space-y-1">
            {NAVEGACION.map(([texto, ruta, Icono]) => {
              const activo = estaActivo(ruta);
              return (
                <button
                  data-desktop-nav type="button" key={ruta}
                  onClick={() => navigate(ruta)} aria-current={activo ? "page" : undefined}
                  className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${activo ? "bg-red-500/10 font-semibold text-red-300" : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"}`}
                >
                  {activo && <span className="absolute -left-3 h-7 w-[3px] rounded-r-full bg-red-500" />}
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${activo ? "bg-red-500/10" : "bg-white/[0.025]"}`}>
                    <Icono size={17} />
                  </span>
                  {texto}
                </button>
              );
            })}
          </div>
        </nav>

        <footer className="border-t border-white/[0.07] p-3">
          <button type="button" onClick={() => navigate("/publicar")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 text-sm font-bold shadow-[0_14px_35px_rgba(239,68,68,.18)] transition hover:brightness-110 active:scale-[0.985]">
            <CirclePlus size={18} /> Crear contenido
          </button>
          <button type="button" onClick={cerrarSesion} className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-slate-600 transition-colors hover:bg-red-500/[0.07] hover:text-red-300">
            <LogOut size={17} /> Cerrar sesión
          </button>
        </footer>
      </aside>

      <aside
        ref={derechaRef}
        data-reportard-right
        className="reportard-no-scrollbar fixed bottom-4 top-4 z-30 hidden w-[17.75rem] overflow-y-auto text-white xl:right-[calc(50%_-_37.5rem)] xl:block"
      >
        <section data-route-context className="overflow-hidden rounded-[1.15rem] border border-slate-700/60 bg-[#081525]/95 shadow-[0_28px_80px_rgba(0,0,0,.28)] backdrop-blur-xl">
          <div className="border-b border-white/[0.07] px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300"><Compass size={19} /></span>
              <span className="rounded-full border border-emerald-400/15 bg-emerald-500/[0.08] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.15em] text-emerald-300">Sesión iniciada</span>
            </div>
            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.22em] text-blue-400">{etiqueta}</p>
            <h2 className="mt-2 text-xl font-bold leading-tight text-slate-100">{titulo}</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">{descripcion}</p>
          </div>

          <div className="p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Claves para esta sección
            </p>
            <div className="mt-3 space-y-2.5">
              {recomendaciones.map((recomendacion, indice) => (
                <div key={recomendacion} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[9px] font-bold text-blue-300">
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] leading-4 text-slate-400">
                    {recomendacion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {mostrarProgresoPerfil && (
          <section
            ref={progresoPerfilRef}
            className="mt-3 overflow-hidden rounded-[1.15rem] border border-slate-700/50 bg-[#081525]/90 p-4 shadow-xl shadow-black/15 backdrop-blur-xl"
          >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                Identidad ciudadana
              </p>
              <h3 className="mt-1 text-xs font-bold text-slate-200">
                Perfil completado
              </h3>
            </div>
            {perfilCompletado === 100 ? (
              <span
                data-completion-check
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300"
              >
                <CheckCircle2 size={18} />
              </span>
            ) : (
              <span className="text-sm font-bold text-blue-300">{perfilCompletado}%</span>
            )}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-red-500"
              style={{ width: `${perfilCompletado}%` }}
            />
          </div>
          <p className="mt-3 text-[10px] leading-4 text-slate-600">
            {perfilCompletado === 100
              ? "Tu perfil está completo. Ya puedes aprovechar toda tu identidad ciudadana."
              : "Una identidad clara ayuda a que otros ciudadanos reconozcan tus aportes."}
          </p>
          </section>
        )}

        <section className="mt-3 rounded-[1.15rem] border border-slate-700/50 bg-[#081525]/90 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300"><ShieldCheck size={18} /></span>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Participación responsable</h3>
              <p className="mt-1 text-[10px] leading-4 text-slate-600">Verifica la información antes de publicar y protege los datos personales de terceros.</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
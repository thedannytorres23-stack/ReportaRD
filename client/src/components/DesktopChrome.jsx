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

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          [data-reportard-main] .max-w-md {
            max-width: 31.5rem !important;
            box-shadow: 0 24px 80px rgba(0, 0, 0, .24);
          }
        }

        .reportard-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, .35) transparent;
        }

        .reportard-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .reportard-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .reportard-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(100, 116, 139, .35);
        }
      `}</style>

      <aside
        data-reportard-left
        className="fixed bottom-3 left-4 top-3 z-40 hidden w-64 flex-col overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#081424]/95 text-white shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex xl:left-[calc(50%_-_36rem)]"
      >
        <header className="border-b border-white/10 px-4 py-4">
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
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] p-3 text-left transition hover:bg-white/[0.06]"
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

        <nav className="reportard-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
          {enlaces.map(({ texto, ruta, icono: Icono }) => {
            const activo = estaActivo(ruta);

            return (
              <button
                type="button"
                key={ruta}
                onClick={() => navigate(ruta)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition duration-200 ${
                  activo
                    ? "bg-red-500/10 font-semibold text-red-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {activo && (
                  <span
                    className="absolute left-0 h-7 w-1 rounded-r-full bg-red-500 shadow-lg shadow-red-500/50"
                  />
                )}
                <Icono
                  size={20}
                  fill={activo && ruta === "/" ? "currentColor" : "none"}
                />
                {texto}
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => navigate("/publicar")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 text-sm font-bold shadow-lg shadow-red-950/30 transition hover:brightness-110"
          >
            <CirclePlus size={19} /> Crear contenido
          </button>
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <aside
        data-reportard-right
        className="reportard-scrollbar fixed bottom-3 right-4 top-3 z-30 hidden w-72 space-y-3 overflow-y-auto pr-1 text-white xl:right-[calc(50%_-_36rem)] xl:block"
      >
        <section className="rounded-[1.25rem] border border-white/10 bg-[#081424]/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
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
                className="flex w-full gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/5"
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

        <section className="rounded-[1.25rem] border border-white/10 bg-[#081424]/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
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
          className="group relative w-full overflow-hidden rounded-[1.25rem] border border-red-500/20 bg-gradient-to-br from-red-500/15 to-orange-500/[0.06] p-4 text-left shadow-xl shadow-black/20"
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
      </aside>
    </>
  );
}













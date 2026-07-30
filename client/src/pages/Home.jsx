import { useState } from "react";
import {
  Bell,
  House,
  Image,
  Lightbulb,
  LogOut,
  Map,
  MapPin,
  Menu,
  MoreHorizontal,
  PenLine,
  Plus,
  Search,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router";
import PostCard from "../components/PostCard";
import ReportCard from "../components/ReportCard";
import SideMenu from "../components/SideMenu";

const categorias = [
  {
    nombre: "Infraestructura",
    icono: Wrench,
    color: "bg-red-500/15 text-red-400",
  },
  {
    nombre: "Alumbrado",
    icono: Lightbulb,
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    nombre: "Basura",
    icono: Trash2,
    color: "bg-green-500/15 text-green-400",
  },
  {
    nombre: "Más",
    icono: MoreHorizontal,
    color: "bg-slate-700 text-slate-300",
  },
];

const contenidoFeed = [
  {
    id: "post-1",
    tipo: "publicacion",
    datos: {
      id: "post-1",
      autorId: 3,
      autor: "María Fernández",
      iniciales: "MF",
      verificado: true,
      comunidad: "Los Jardines",
      tiempo: "Hace 8 min",
      contenido:
        "Este sábado estaremos realizando una jornada de limpieza en el parque del sector. Todos los vecinos están invitados. 🇩🇴",
      mediaUrl: null,
      mediaTipo: null,
      reacciones: 24,
      comentarios: 6,
      compartidos: 4,
    },
  },
  {
    id: "report-1",
    tipo: "reporte",
    datos: {
      id: "report-1",
      autorId: 1,
      autor: "Laura Méndez",
      iniciales: "LM",
      verificado: true,
      comunidad: "Santiago Centro",
      tiempo: "Hace 15 min",
      categoria: "Infraestructura",
      estado: "Pendiente",
      titulo: "Hueco peligroso en la avenida",
      descripcion:
        "Este hueco lleva más de una semana causando problemas a los conductores. Durante la noche es difícil verlo y puede provocar un accidente.",
      ubicacion: "Av. Estrella Sadhalá, Santiago",
      confirmaciones: 32,
      comentarios: 8,
      compartidos: 12,
    },
  },
  {
    id: "post-2",
    tipo: "publicacion",
    datos: {
      id: "post-2",
      autorId: 4,
      autor: "José Martínez",
      iniciales: "JM",
      verificado: false,
      comunidad: "Cienfuegos",
      tiempo: "Hace 26 min",
      contenido:
        "Gracias a todos los vecinos que ayudaron a recuperar el área verde. Cuando una comunidad se organiza, los cambios sí se notan.",
      mediaUrl: null,
      mediaTipo: null,
      reacciones: 41,
      comentarios: 11,
      compartidos: 9,
    },
  },
  {
    id: "report-2",
    tipo: "reporte",
    datos: {
      id: "report-2",
      autorId: 2,
      autor: "Carlos Ramírez",
      iniciales: "CR",
      verificado: false,
      comunidad: "Los Jardines",
      tiempo: "Hace 32 min",
      categoria: "Alumbrado",
      estado: "En revisión",
      titulo: "Poste de luz averiado",
      descripcion:
        "La calle lleva varios días completamente oscura. Los residentes solicitamos que sea revisado lo antes posible.",
      ubicacion: "Calle Duarte, Santiago",
      confirmaciones: 18,
      comentarios: 5,
      compartidos: 7,
    },
  },
];

const perfilInicial = {
  nombre: "Danny Torres",
  usuario: "dannytorres",
  foto: "",
};

const obtenerPerfilGuardado = () => {
  try {
    const datos = localStorage.getItem("reportard_profile");

    return datos
      ? {
        ...perfilInicial,
        ...JSON.parse(datos),
      }
      : perfilInicial;
  } catch {
    return perfilInicial;
  }
};

const obtenerIniciales = (nombre) => {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
};






export default function Home({ onLogout }) {
  const navigate = useNavigate();

  const [perfil] = useState(obtenerPerfilGuardado);

  const primerNombre =
    perfil.nombre.trim().split(/\s+/)[0] || "Usuario";

  const iniciales = obtenerIniciales(perfil.nombre);

  const [menuAbierto, setMenuAbierto] = useState(false);

  const [mostrarCierreSesion, setMostrarCierreSesion] =
    useState(false);

  const confirmarCierreSesion = () => {
    setMostrarCierreSesion(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-24">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#06101f]/90 px-4 pb-4 pt-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] active:scale-95"
            >
              <Menu size={22} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-center"
            >
              <h1 className="text-lg font-black tracking-tight">
                Reporta<span className="text-red-500">RD</span>
              </h1>

              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-600">
                Red ciudadana
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/notificaciones")}
              aria-label="Ver notificaciones"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] active:scale-95"
            >
              <Bell size={21} />

              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#06101f] bg-red-500" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/buscar")}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-left transition hover:border-blue-500/30 hover:bg-white/[0.06]"
          >
            <Search
              size={18}
              className="shrink-0 text-blue-400"
            />

            <span className="min-w-0 flex-1 truncate text-sm text-slate-500">
              Buscar personas, publicaciones o reportes
            </span>

            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
              Buscar
            </span>
          </button>
        </header>

        <main>
          <section className="px-5 pb-5 pt-5">
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 via-[#0b1626] to-red-500/10 p-5">
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-red-500/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-400">
                    ¡Hola, {primerNombre}! 👋
                  </p>

                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] text-slate-400">
                    <MapPin
                      size={12}
                      className="text-red-400"
                    />
                    Santiago
                  </span>
                </div>

                <div className="mt-3 flex items-end gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="max-w-xs text-2xl font-bold leading-tight">
                      ¿Qué está pasando en tu comunidad?
                    </h2>

                    <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                      Descubre, participa y ayuda a generar cambios cerca de ti.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/mapa")}
                    aria-label="Explorar actividad cercana"
                    className="group relative mb-1 flex h-14 w-14 shrink-0 items-center justify-center"
                  >
                    <span className="absolute h-12 w-12 animate-ping rounded-full bg-red-500/15 [animation-duration:2.4s]" />

                    <span className="absolute h-14 w-14 rounded-full border border-red-400/15 bg-red-500/5 transition duration-300 group-hover:scale-110 group-hover:bg-red-500/10" />

                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 transition duration-300 group-hover:-translate-y-0.5">
                      <MapPin size={19} fill="currentColor" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-5 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/perfil")}
                aria-label="Abrir mi perfil"
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-red-500 font-bold"
              >
                {perfil.foto ? (
                  <img
                    src={perfil.foto}
                    alt={`Foto de ${perfil.nombre}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  iniciales
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/publicar")}
                className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-500"
              >
                Comparte algo con tu comunidad...
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate("/publicar")}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition active:scale-[0.98]"
              >
                <PenLine size={18} className="text-blue-400" />
                Publicar
              </button>

              <button
                type="button"
                onClick={() => navigate("/reportar")}
                className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
              >
                <Plus size={18} />
                Reportar
              </button>
            </div>

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/publicar")}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <Image size={16} className="text-green-400" />
                Agregar fotos o videos
              </button>
            </div>
          </section>

          <section className="px-5 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">
                Explorar categorías
              </h2>

              <button
                type="button"
                onClick={() => navigate("/mapa")}
                className="text-xs font-medium text-red-400 transition hover:text-red-300"
              >
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {categorias.map(({ nombre, icono: Icono, color }) => (
                <button
                  type="button"
                  key={nombre}
                  onClick={() => {
                    if (nombre === "Más") {
                      navigate("/mapa");
                      return;
                    }

                    navigate(
                      `/mapa?categoria=${encodeURIComponent(nombre)}`,
                    );
                  }}
                  className="group flex min-w-0 flex-col items-center gap-2"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition duration-200 group-hover:scale-105 group-active:scale-95 ${color}`}
                  >
                    <Icono size={22} />
                  </span>

                  <span className="w-full truncate text-center text-[10px] text-slate-400 transition group-hover:text-white">
                    {nombre}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="px-5 pb-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Actividad cerca de ti
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Reportes recientes en Santiago
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/mapa")}
                className="flex items-center gap-1 text-xs font-medium text-red-400"
              >
                <MapPin size={15} />
                Abrir mapa
              </button>
            </div>

            <div className="relative h-40 overflow-hidden rounded-2xl border border-blue-400/10 bg-[#0b2138]">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#3b82f6_1px,transparent_1px),linear-gradient(90deg,#3b82f6_1px,transparent_1px)] [background-size:32px_32px]" />

              <span className="absolute left-[20%] top-[55%] h-4 w-4 rounded-full border-4 border-red-300 bg-red-500 shadow-lg shadow-red-500/50" />

              <span className="absolute left-[52%] top-[25%] h-4 w-4 rounded-full border-4 border-violet-300 bg-violet-500 shadow-lg shadow-violet-500/50" />

              <span className="absolute right-[18%] top-[48%] h-4 w-4 rounded-full border-4 border-amber-300 bg-amber-500 shadow-lg shadow-amber-500/50" />

              <span className="absolute bottom-[18%] right-[38%] h-4 w-4 rounded-full border-4 border-green-300 bg-green-500 shadow-lg shadow-green-500/50" />
            </div>
          </section>

          <section className="border-t border-white/5 px-5 py-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Tu feed
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Publicaciones, reportes y comunidades que sigues
              </p>
            </div>

            <div className="space-y-5">
              {contenidoFeed.map((elemento) =>
                elemento.tipo === "reporte" ? (
                  <ReportCard
                    key={elemento.id}
                    reporte={elemento.datos}
                  />
                ) : (
                  <PostCard
                    key={elemento.id}
                    publicacion={elemento.datos}
                  />
                ),
              )}
            </div>
          </section>
        </main>

        <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-white/10 bg-[#06101f]/95 px-3 pb-4 pt-3 backdrop-blur-xl">
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-red-500"
          >
            <House size={21} fill="currentColor" />
            <span className="text-[10px] font-medium">
              Inicio
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/mapa")}
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <Map size={21} />
            <span className="text-[10px]">
              Mapa
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/reportar")}
            aria-label="Crear reporte"
            className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#06101f] bg-red-500 text-white shadow-lg shadow-red-500/30"
          >
            <Plus size={28} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/notificaciones")}
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <Bell size={21} />
            <span className="text-[10px]">
              Alertas
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <UserRound size={21} />
            <span className="text-[10px]">
              Perfil
            </span>
          </button>
        </nav>
      </div>


      <SideMenu
        abierto={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        onRequestLogout={() => setMostrarCierreSesion(true)}
      />



      {mostrarCierreSesion && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-cerrar-sesion"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b1626] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
              <LogOut size={23} />
            </div>

            <h2
              id="titulo-cerrar-sesion"
              className="mt-5 text-xl font-bold"
            >
              ¿Quieres cerrar sesión?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Tendrás que volver a introducir tus datos para entrar a
              ReportaRD. Tu cuenta y tus publicaciones no serán eliminadas.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMostrarCierreSesion(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarCierreSesion}
                className="flex-1 rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import {
  Bell,
  House,
  Image,
  Lightbulb,
  LogOut,
  Map,
  Megaphone,
  MessageCircle,
  Menu,
  MoreHorizontal,
  PenLine,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import PostCard from "../components/PostCard";
import ReportCard from "../components/ReportCard";
import SideMenu from "../components/SideMenu";
import CommunityRadar from "../components/CommunityRadar";
import CitizenStories from "../components/CitizenStories";
import {
  listarPublicaciones,
  listarReportes,
} from "../services/contentService";
import {
  obtenerNotificacionesNoLeidas,
} from "../services/notificationService";

import {
  conectarSocket,
} from "../services/socketService";



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


const perfilInicial = {
  nombre: "Ciudadano ReportaRD",
  usuario: "ciudadano",
  foto: "",
};

const obtenerPerfilGuardado = () => {
  try {
    const usuarioAutenticado = JSON.parse(
      localStorage.getItem("reportard_user") || "{}",
    );
    const perfilEditado = JSON.parse(
      localStorage.getItem("reportard_profile") || "{}",
    );

    return {
      ...perfilInicial,
      ...usuarioAutenticado,
      ...perfilEditado,
    };
  } catch {
    return perfilInicial;
  }
};

const obtenerToken = () => {
  return localStorage.getItem("reportard_token") || "";
};

const formatearTiempo = (fecha) => {
  const instante = new Date(fecha).getTime();

  if (!Number.isFinite(instante)) return "Ahora";

  const segundos = Math.max(0, Math.floor((Date.now() - instante) / 1000));

  if (segundos < 60) return "Ahora";
  if (segundos < 3600) return `Hace ${Math.floor(segundos / 60)} min`;
  if (segundos < 86400) return `Hace ${Math.floor(segundos / 3600)} h`;

  return `Hace ${Math.floor(segundos / 86400)} d`;
};

const convertirPublicacion = (publicacion) => {
  const autor = publicacion.autor || {};
  const nombreAutor = autor.nombre || "Ciudadano ReportaRD";

  return {
    id: publicacion._id,
    tipo: "publicacion",
    datos: {
      id: publicacion._id,
      autorId: autor._id,
      autor: nombreAutor,
      iniciales: obtenerIniciales(nombreAutor) || "RD",
      foto: autor.foto || "",
      verificado: false,
      comunidad: publicacion.comunidad || "Comunidad ReportaRD",
      tiempo: formatearTiempo(publicacion.createdAt),
      titulo: publicacion.titulo || "",
      contenido: publicacion.contenido,
      mediaUrl: publicacion.mediaUrl || null,
      mediaTipo: publicacion.mediaTipo || null,
      reacciones: publicacion.reacciones ?? 0,
      comentarios: publicacion.comentarios ?? 0,
      compartidos: publicacion.compartidos ?? 0,
    },
  };
};



const convertirReporte = (reporte) => {
  const autor = reporte.autor || {};
  const nombreAutor =
    autor.nombre || "Ciudadano ReportaRD";

  return {
    id: reporte._id,
    tipo: "reporte",
    fechaOrden: reporte.createdAt,
    datos: {
      id: reporte._id,
      autorId: autor._id,
      autor: nombreAutor,
      iniciales: obtenerIniciales(nombreAutor) || "RD",
      foto: autor.foto || "",
      verificado: false,

      comunidad: "ReportaRD",
      tiempo: formatearTiempo(reporte.createdAt),

      categoria: reporte.categoria,
      estado: reporte.estado,
      titulo: reporte.titulo,
      descripcion: reporte.descripcion,
      ubicacion: reporte.ubicacion,

      coordenadas: reporte.coordenadas || {
        latitud: null,
        longitud: null,
      },

      mediaUrl: reporte.mediaUrl || null,
      mediaTipo: reporte.mediaTipo || null,
      reacciones: reporte.reacciones ?? 0,
      comentarios: reporte.comentarios ?? 0,
      compartidos: reporte.compartidos ?? 0,
    },
  };
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
  const location = useLocation();

  const [notificacionesNoLeidas, setNotificacionesNoLeidas] =
    useState(0);

    useEffect(() => {
  const token = obtenerToken();

  if (!token) return undefined;

  const socket = conectarSocket(token);

  if (!socket) return undefined;

  const recibirNotificacion = () => {
    setNotificacionesNoLeidas(
      (cantidadActual) =>
        cantidadActual + 1,
    );
  };

  socket.on(
    "notificacion:nueva",
    recibirNotificacion,
  );

  return () => {
    socket.off(
      "notificacion:nueva",
      recibirNotificacion,
    );
  };
}, []);

  const [perfil] = useState(obtenerPerfilGuardado);
  const [contenidoReal, setContenidoReal] =
    useState([]);
  const [cargandoFeed, setCargandoFeed] = useState(true);
  const [errorFeed, setErrorFeed] = useState("");

  const primerNombre =
    perfil.nombre.trim().split(/\s+/)[0] || "Usuario";

  const iniciales = obtenerIniciales(perfil.nombre);

  const [menuAbierto, setMenuAbierto] = useState(false);

  const [menuAccionesAbierto, setMenuAccionesAbierto] =
    useState(false);

  const [mostrarCierreSesion, setMostrarCierreSesion] =
    useState(false);

  const elementosFeed = contenidoReal;


  useEffect(() => {
    let vigente = true;

    const cargarNoLeidas = async () => {
      const token = obtenerToken();

      if (!token) {
        return;
      }

      try {
        const respuesta =
          await obtenerNotificacionesNoLeidas(
            token,
          );

        if (vigente) {
          setNotificacionesNoLeidas(
            respuesta.total ?? 0,
          );
        }
      } catch (error) {
        console.error(
          "Error cargando notificaciones no leídas:",
          error,
        );
      }
    };

    cargarNoLeidas();

    return () => {
      vigente = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    let vigente = true;

    const cargarFeed = async () => {
      const token = obtenerToken();

      if (!token) {
        if (vigente) {
          setErrorFeed("Inicia sesión nuevamente para cargar el feed real.");
          setCargandoFeed(false);
        }
        return;
      }

      try {
        const [
          respuestaPublicaciones,
          respuestaReportes,
        ] = await Promise.all([
          listarPublicaciones(token),
          listarReportes(token),
        ]);

        const publicaciones = (
          respuestaPublicaciones.publicaciones || []
        ).map((publicacion) => ({
          ...convertirPublicacion(publicacion),
          fechaOrden: publicacion.createdAt,
        }));

        const reportes = (
          respuestaReportes.reportes || []
        ).map(convertirReporte);

        const contenidoOrdenado = [
          ...publicaciones,
          ...reportes,
        ].sort(
          (a, b) =>
            new Date(b.fechaOrden).getTime() -
            new Date(a.fechaOrden).getTime(),
        );

        if (vigente) {
          setContenidoReal(contenidoOrdenado);
          setErrorFeed("");
        }
      } catch (errorSolicitud) {
        if (vigente) {
          setErrorFeed(errorSolicitud.message);
        }
      } finally {
        if (vigente) setCargandoFeed(false);
      }
    };

    cargarFeed();

    return () => {
      vigente = false;
    };
  }, []);

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
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] active:scale-95 lg:invisible lg:pointer-events-none"
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
              aria-label={
                notificacionesNoLeidas > 0
                  ? `${notificacionesNoLeidas} notificaciones sin leer`
                  : "Ver notificaciones"
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] active:scale-95"
            >
              <Bell size={21} />

              {notificacionesNoLeidas > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#06101f] bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                  {notificacionesNoLeidas > 99
                    ? "99+"
                    : notificacionesNoLeidas}
                </span>
              )}
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

                  {perfil.ubicacion && (
                    <span className="max-w-[11rem] truncate rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] text-slate-400">
                      {perfil.ubicacion}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex w-full justify-center">
                  <CommunityRadar
                    onOpenMap={() => navigate("/mapa")}
                  />
                </div>

                <div className="mt-3 text-center">
                  <h2 className="mx-auto max-w-sm text-2xl font-bold leading-tight">
                    ¿Qué está pasando en tu comunidad?
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                    Descubre, participa y ayuda a generar cambios cerca de ti.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <CitizenStories perfil={perfil} />

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

          <section className="px-5 pb-7 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Explorar por categoría
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Filtra los reportes del mapa ciudadano
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/mapa")}
                className="text-xs font-medium text-red-400 transition hover:text-red-300"
              >
                Ver mapa
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
              {cargandoFeed && (
                <div className="rounded-2xl border border-blue-400/10 bg-blue-500/5 px-4 py-3 text-sm text-blue-200">
                  Cargando publicaciones de la comunidad…
                </div>
              )}

              {errorFeed && (
                <div className="rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {errorFeed}
                </div>
              )}

              {contenidoReal.length > 0 && (
                <div className="flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Actividad Reciente
                </div>
              )}

              {!cargandoFeed && !errorFeed && elementosFeed.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-10 text-center">
                  <h3 className="font-semibold text-slate-200">
                    Aún no hay publicaciones
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sé la primera persona en compartir algo con la comunidad.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/publicar")}
                    className="mt-5 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Crear publicación
                  </button>
                </div>
              )}

              {elementosFeed.map((elemento) =>
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

        {menuAccionesAbierto && (
          <button
            type="button"
            onClick={() => setMenuAccionesAbierto(false)}
            aria-label="Cerrar acciones"
            className="fixed inset-0 z-20 bg-black/45 backdrop-blur-[2px]"
          />
        )}

        <div
          className={`pointer-events-none fixed bottom-[5.8rem] left-1/2 z-40 h-28 w-full max-w-sm -translate-x-1/2 transition ${menuAccionesAbierto ? "visible" : "invisible"
            }`}
        >
          <button
            type="button"
            onClick={() => {
              setMenuAccionesAbierto(false);
              navigate("/publicar");
            }}
            className={`pointer-events-auto absolute bottom-0 left-7 flex flex-col items-center gap-2 transition-all duration-300 ease-out ${menuAccionesAbierto
              ? "translate-x-0 translate-y-0 scale-100 opacity-100"
              : "translate-x-20 translate-y-16 scale-50 opacity-0"
              }`}
          >
            <span className="flex h-13 w-13 items-center justify-center rounded-2xl border border-blue-300/20 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-500/30 transition hover:-translate-y-1 active:scale-90">
              <PenLine size={21} />
            </span>
            <span className="rounded-full bg-[#0b1626]/95 px-2.5 py-1 text-[10px] font-semibold text-blue-300 shadow-lg">
              Publicar
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuAccionesAbierto(false);
              navigate("/?crearHistoria=1");
            }}
            className={`pointer-events-auto absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 transition-all delay-75 duration-300 ease-out ${menuAccionesAbierto
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-20 scale-50 opacity-0"
              }`}
          >
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-500/30 transition hover:-translate-y-1 active:scale-90">
              <Image size={22} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#06101f] bg-amber-400 text-[9px] text-slate-950">
                <Sparkles size={10} />
              </span>
            </span>
            <span className="rounded-full bg-[#0b1626]/95 px-2.5 py-1 text-[10px] font-semibold text-violet-300 shadow-lg">
              Historia
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuAccionesAbierto(false);
              navigate("/reportar");
            }}
            className={`pointer-events-auto absolute bottom-0 right-7 flex flex-col items-center gap-2 transition-all delay-150 duration-300 ease-out ${menuAccionesAbierto
              ? "translate-x-0 translate-y-0 scale-100 opacity-100"
              : "-translate-x-20 translate-y-16 scale-50 opacity-0"
              }`}
          >
            <span className="flex h-13 w-13 items-center justify-center rounded-2xl border border-red-300/20 bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-xl shadow-red-500/30 transition hover:-translate-y-1 active:scale-90">
              <Megaphone size={22} />
            </span>
            <span className="rounded-full bg-[#0b1626]/95 px-2.5 py-1 text-[10px] font-semibold text-red-300 shadow-lg">
              Reportar
            </span>
          </button>
        </div>

        <nav className="hidden">
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
            onClick={() =>
              setMenuAccionesAbierto((estadoActual) => !estadoActual)
            }
            aria-label={
              menuAccionesAbierto
                ? "Cerrar acciones"
                : "Abrir acciones de creación"
            }
            aria-expanded={menuAccionesAbierto}
            className={`group relative -mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#06101f] bg-gradient-to-br from-red-500 via-red-500 to-orange-500 text-white shadow-xl transition-all duration-300 active:scale-90 ${menuAccionesAbierto
              ? "scale-110 shadow-red-500/50"
              : "shadow-red-500/30 hover:-translate-y-1"
              }`}
          >
            <span className="absolute inset-1 rounded-full border border-white/15" />

            <Plus
              size={29}
              strokeWidth={2.6}
              className={`relative transition-transform duration-300 ${menuAccionesAbierto ? "rotate-45" : "rotate-0"
                }`}
            />
          </button>

          <button
            type="button"
            onClick={() => navigate("/mensajes")}
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <MessageCircle size={21} />
            <span className="text-[10px]">
              Mensajes
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
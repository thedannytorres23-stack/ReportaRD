import { useEffect, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  House,
  Image,
  LogOut,
  Map,
  MapPin,
  Megaphone,
  MessageCircle,
  Menu,
  PenLine,
  Plus,
  Radio,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import PostCard from "../components/PostCard";
import ReportCard from "../components/ReportCard";
import SideMenu from "../components/SideMenu";
import CommunityRadar from "../components/CommunityRadar";
import CommunityPoll from "../components/CommunityPoll";

const contenidoFeed = [
  {
    id: "post-video-debate-rd",
    tipo: "publicacion",
    datos: {
      id: "post-video-debate-rd",
      autor: "Actualidad Dominicana",
      iniciales: "AD",
      verificado: false,
      comunidad: "Debate ciudadano",
      tiempo: "Hace 3 min",
      contenido:
        "Una declaración que está generando conversación en las redes dominicanas. Recuerda participar con respeto: ¿qué opinas? 🇩🇴",
      mediaUrl: "/videos/debate-ciudadano-rd.mp4",
      mediaTipo: "video",
      mediaPoster: "/images/debate-ciudadano-rd.jpg",
      reacciones: 86,
      comentarios: 31,
      compartidos: 18,
    },
  },
  {
    id: "post-video-policia-rd",
    tipo: "publicacion",
    datos: {
      id: "post-video-policia-rd",
      autor: "Comunidad ReportaRD",
      iniciales: "CR",
      verificado: true,
      comunidad: "República Dominicana",
      tiempo: "Hace 6 min",
      contenido:
        "Un momento de la comunidad policial que se ha vuelto popular. También queremos mostrar el lado cercano y cotidiano de nuestro país.",
      mediaUrl: "/videos/policia-comunidad-rd.mp4",
      mediaTipo: "video",
      mediaPoster: "/images/policia-comunidad-rd.jpg",
      reacciones: 143,
      comentarios: 22,
      compartidos: 35,
    },
  },
  {
    id: "post-video-entretenimiento-rd",
    tipo: "publicacion",
    datos: {
      id: "post-video-entretenimiento-rd",
      autor: "Voces de RD",
      iniciales: "VR",
      verificado: false,
      comunidad: "Entretenimiento dominicano",
      tiempo: "Hace 9 min",
      contenido:
        "El humor y las ocurrencias que también forman parte de nuestras conversaciones diarias. ¿Qué te pareció este momento? 🇩🇴",
      mediaUrl: "/videos/entretenimiento-dominicano-rd.mp4",
      mediaTipo: "video",
      mediaPoster: "/images/entretenimiento-dominicano-rd.jpg",
      reacciones: 214,
      comentarios: 47,
      compartidos: 52,
    },
  },
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
      mediaUrl:
        "https://images.unsplash.com/photo-1758599667717-27c61bcdd14b?auto=format&fit=crop&w=1200&q=82",
      mediaTipo: "imagen",
      mediaAlt:
        "Voluntarios participando en una jornada comunitaria de limpieza",
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
      mediaUrl:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=82",
      mediaTipo: "imagen",
      mediaAlt:
        "Avenida urbana donde fue reportado un daño en el pavimento",
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
      mediaUrl:
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      mediaTipo: "video",
      mediaPoster:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82",
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
      mediaUrl:
        "https://images.unsplash.com/photo-1697722229764-2ee3445a5045?auto=format&fit=crop&w=1200&q=82",
      mediaTipo: "imagen",
      mediaAlt:
        "Calle de noche con iluminación urbana que necesita revisión",
      confirmaciones: 18,
      comentarios: 5,
      compartidos: 7,
    },
  },
];

const usuarioVacio = {
  nombre: "Usuario",
  usuario: "usuario",
  foto: "",
  ubicacion: "República Dominicana",
};

const obtenerUsuarioAutenticado = () => {
  try {
    const datos = localStorage.getItem("reportard_user");

    return datos
      ? {
        ...usuarioVacio,
        ...JSON.parse(datos),
      }
      : usuarioVacio;
  } catch {
    return usuarioVacio;
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

const historiasIniciales = [
  {
    id: "historia-maria",
    autor: "María Fernández",
    iniciales: "MF",
    tiempo: "Hace 12 min",
    texto: "Hoy nos unimos para recuperar el parque del sector. 🌳",
    color: "from-violet-600 via-fuchsia-600 to-red-500",
    vistas: 86,
    activo: true,
  },
  {
    id: "historia-laura",
    autor: "Laura Méndez",
    iniciales: "LM",
    tiempo: "Hace 28 min",
    texto: "Reporte confirmado: brigadas revisando la avenida Estrella Sadhalá.",
    color: "from-blue-600 via-cyan-500 to-emerald-500",
    vistas: 54,
    activo: true,
  },
  {
    id: "historia-jose",
    autor: "José Martínez",
    iniciales: "JM",
    tiempo: "Hace 1 h",
    texto: "Cuando la comunidad participa, el cambio se nota. 🇩🇴",
    color: "from-amber-500 via-orange-500 to-red-600",
    vistas: 121,
    activo: false,
  },
  {
    id: "historia-santiago",
    autor: "Santiago Verde",
    iniciales: "SV",
    tiempo: "Hace 2 h",
    texto: "Nueva jornada de reciclaje este sábado. ¡Te esperamos!",
    color: "from-emerald-600 via-green-500 to-cyan-500",
    vistas: 73,
    activo: true,
  },
];

const coloresHistoria = [
  "from-blue-600 via-violet-600 to-red-500",
  "from-emerald-600 via-cyan-500 to-blue-600",
  "from-amber-500 via-orange-500 to-red-600",
  "from-fuchsia-600 via-pink-500 to-rose-500",
];

const obtenerHistoriasGuardadas = () => {
  try {
    const datos = localStorage.getItem("reportard_historias");
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
};






export default function Home({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [perfil] = useState(obtenerUsuarioAutenticado);

  const primerNombre =
    perfil.nombre.trim().split(/\s+/)[0] || "Usuario";

  const iniciales = obtenerIniciales(perfil.nombre);

  const ubicacionPrincipal =
    perfil.ubicacion?.split(",")[0]?.trim() ||
    "República Dominicana";

  const [menuAbierto, setMenuAbierto] = useState(false);

  const [menuAccionesAbierto, setMenuAccionesAbierto] =
    useState(false);

  const [mostrarCierreSesion, setMostrarCierreSesion] =
    useState(false);

  const [historiasPropias, setHistoriasPropias] = useState(
    obtenerHistoriasGuardadas,
  );

  const [historiaActiva, setHistoriaActiva] = useState(null);
  const [progresoHistoria, setProgresoHistoria] = useState(0);
  const [mostrarCrearHistoria, setMostrarCrearHistoria] =
    useState(false);
  const [textoHistoria, setTextoHistoria] = useState("");
  const [colorHistoria, setColorHistoria] = useState(
    coloresHistoria[0],
  );

  const historias = [...historiasPropias, ...historiasIniciales];

  useEffect(() => {
    localStorage.setItem(
      "reportard_historias",
      JSON.stringify(historiasPropias),
    );
  }, [historiasPropias]);

  useEffect(() => {
    const parametros = new URLSearchParams(location.search);

    if (parametros.get("crearHistoria") === "1") {
      const frame = window.requestAnimationFrame(() => {
        setMostrarCrearHistoria(true);
        navigate("/", { replace: true });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    return undefined;
  }, [location.search, navigate]);

  useEffect(() => {
    if (historiaActiva === null) return undefined;

    const frame = window.requestAnimationFrame(() => {
      setProgresoHistoria(0);
    });

    const intervalo = window.setInterval(() => {
      setProgresoHistoria((progresoActual) => {
        if (progresoActual >= 99) {
          if (historiaActiva < historias.length - 1) {
            setHistoriaActiva((indiceActual) => indiceActual + 1);
          } else {
            setHistoriaActiva(null);
          }

          return 0;
        }

        return progresoActual + 1;
      });
    }, 60);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(intervalo);
    };
  }, [historiaActiva, historias.length]);

  const crearHistoria = () => {
    const textoLimpio = textoHistoria.trim();

    if (!textoLimpio) return;

    const nuevaHistoria = {
      id: `historia-${Date.now()}`,
      autor: perfil.nombre,
      iniciales,
      tiempo: "Ahora",
      texto: textoLimpio,
      color: colorHistoria,
      vistas: 0,
      propia: true,
    };

    setHistoriasPropias((actuales) => [nuevaHistoria, ...actuales]);
    setTextoHistoria("");
    setColorHistoria(coloresHistoria[0]);
    setMostrarCrearHistoria(false);
  };

  const mostrarHistoriaAnterior = () => {
    setHistoriaActiva((indiceActual) =>
      indiceActual > 0 ? indiceActual - 1 : indiceActual,
    );
  };

  const mostrarHistoriaSiguiente = () => {
    setHistoriaActiva((indiceActual) =>
      indiceActual < historias.length - 1
        ? indiceActual + 1
        : null,
    );
  };

  const eliminarHistoria = (historiaId) => {
    const confirmado = window.confirm(
      "¿Quieres eliminar esta historia? Esta acción no se puede deshacer.",
    );

    if (!confirmado) return;

    setHistoriasPropias((actuales) =>
      actuales.filter((historia) => historia.id !== historiaId),
    );
    setHistoriaActiva(null);
  };

  const historiaVisible =
    historiaActiva !== null ? historias[historiaActiva] : null;

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
                    {ubicacionPrincipal}
                  </span>
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

          <section className="pb-6">
            <div className="mb-4 flex items-center justify-between px-5">
              <div>
                <h2 className="font-semibold">Historias ciudadanas</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Momentos que están moviendo tu comunidad
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/en-vivo")}
                className="group flex items-center gap-1.5 rounded-full border border-red-500/15 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-400 transition hover:border-red-400/30 hover:bg-red-500/15 active:scale-95"
              >
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-500/35 [animation-duration:1.8s]" />
                  <Radio size={12} className="relative" />
                </span>
                Crear directo
              </button>
            </div>

            <div className="scrollbar-none flex gap-3 overflow-x-auto px-5 pb-2">
              <div className="relative flex w-[72px] shrink-0 flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (historiasPropias.length > 0) {
                      setHistoriaActiva(0);
                    } else {
                      setMostrarCrearHistoria(true);
                    }
                  }}
                  className="group"
                >
                  <span
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full transition duration-300 group-hover:scale-105 group-active:scale-95 ${historiasPropias.length > 0
                        ? `bg-gradient-to-br p-[2px] ${historiasPropias[0].color}`
                        : "border border-dashed border-blue-400/50 bg-blue-500/10"
                      }`}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#06101f] bg-[#0b1626] text-sm font-bold text-white">
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
                      title="Estás activo ahora"
                      className="absolute bottom-1 right-0 h-3 w-3 rounded-full border-2 border-[#06101f] bg-green-400 shadow-[0_0_8px_rgba(74,222,128,.75)]"
                    />

                    {historiasPropias.length > 1 && (
                      <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#06101f] bg-violet-500 px-1 text-[9px] font-bold text-white">
                        {historiasPropias.length}
                      </span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarCrearHistoria(true)}
                  aria-label="Agregar otra historia"
                  className="absolute right-1 top-11 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#06101f] bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition active:scale-90"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>

                <span className="w-full truncate text-center text-[10px] text-slate-400">
                  {historiasPropias.length > 0
                    ? "Tu historia"
                    : "Crear historia"}
                </span>
              </div>

              {historiasIniciales.map((historia, indice) => (
                <button
                  type="button"
                  key={historia.id}
                  onClick={() =>
                    setHistoriaActiva(historiasPropias.length + indice)
                  }
                  style={{ animationDelay: `${indice * 70}ms` }}
                  className="story-enter group flex w-[72px] shrink-0 flex-col items-center gap-2"
                >
                  <span
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br p-[2px] transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-active:scale-95 ${historia.color}`}
                  >
                    <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-[#06101f] bg-[#0b1626] text-sm font-bold text-white">
                      {historia.iniciales}
                    </span>

                    {historia.activo && (
                      <span
                        title="Activo ahora"
                        aria-label="Activo ahora"
                        className="absolute bottom-1 right-0 h-3 w-3 rounded-full border-2 border-[#06101f] bg-green-400 shadow-[0_0_8px_rgba(74,222,128,.75)]"
                      />
                    )}
                  </span>

                  <span className="w-full truncate text-center text-[10px] text-slate-400 transition group-hover:text-white">
                    {historia.autor.split(" ")[0]}
                  </span>
                </button>
              ))}
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

          <CommunityPoll
            onOpenDiscussion={() => navigate("/comunidades")}
          />

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
              setMostrarCrearHistoria(true);
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
            {!menuAccionesAbierto && (
              <span className="absolute inset-1 animate-ping rounded-full bg-red-400/20 [animation-duration:2.6s]" />
            )}

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

      {historiaVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Historia de ${historiaVisible.autor}`}
          className="story-viewer-enter fixed inset-0 z-[80] flex justify-center bg-black"
        >
          <div
            className={`relative flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-gradient-to-br ${historiaVisible.color}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.22),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.55))]" />

            <header className="relative z-20 px-4 pt-4">
              <div className="flex gap-1">
                {historias.map((historia, indice) => (
                  <span
                    key={historia.id}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                  >
                    <span
                      className="block h-full rounded-full bg-white transition-[width] duration-75"
                      style={{
                        width:
                          indice < historiaActiva
                            ? "100%"
                            : indice === historiaActiva
                              ? `${progresoHistoria}%`
                              : "0%",
                      }}
                    />
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-xs font-bold backdrop-blur">
                  {historiaVisible.iniciales}
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold">
                    {historiaVisible.autor}
                  </h2>
                  <p className="text-[11px] text-white/65">
                    {historiaVisible.tiempo}
                  </p>
                </div>

                {historiaVisible.propia && (
                  <button
                    type="button"
                    onClick={() => eliminarHistoria(historiaVisible.id)}
                    aria-label="Eliminar historia"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur transition hover:bg-red-500/40 hover:text-white active:scale-95"
                  >
                    <Trash2 size={19} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setHistoriaActiva(null)}
                  aria-label="Cerrar historia"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur transition hover:bg-black/35 active:scale-95"
                >
                  <X size={22} />
                </button>
              </div>
            </header>

            <button
              type="button"
              onClick={mostrarHistoriaAnterior}
              aria-label="Historia anterior"
              disabled={historiaActiva === 0}
              className="absolute bottom-24 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur transition hover:bg-black/35 active:scale-95 disabled:opacity-0"
            >
              <ChevronLeft size={25} />
            </button>

            <button
              type="button"
              onClick={mostrarHistoriaSiguiente}
              aria-label="Historia siguiente"
              className="absolute bottom-24 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur transition hover:bg-black/35 active:scale-95"
            >
              <ChevronRight size={25} />
            </button>

            <main className="relative z-10 flex flex-1 items-center justify-center px-10 py-24 text-center">
              <div className="story-content-enter">
                <Sparkles size={26} className="mx-auto mb-5 text-white/75" />
                <p className="text-2xl font-bold leading-snug drop-shadow-lg">
                  {historiaVisible.texto}
                </p>
              </div>
            </main>

            <footer className="relative z-20 flex items-center justify-between px-5 pb-8 text-xs text-white/75">
              <span className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur">
                <Eye size={15} />
                {historiaVisible.vistas} vistas
              </span>

              <span className="rounded-full bg-black/20 px-3 py-2 backdrop-blur">
                ReportaRD · Comunidad activa
              </span>
            </footer>
          </div>
        </div>
      )}

      {mostrarCrearHistoria && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-crear-historia"
          className="fixed inset-0 z-[75] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
        >
          <div className="story-modal-enter w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0b1626] shadow-2xl shadow-black/50">
            <div
              className={`relative flex h-52 items-center justify-center bg-gradient-to-br p-8 text-center ${colorHistoria}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-black/10" />
              <p className="relative text-xl font-bold leading-snug drop-shadow-lg">
                {textoHistoria || "Tu historia puede inspirar a toda una comunidad"}
              </p>

              <button
                type="button"
                onClick={() => setMostrarCrearHistoria(false)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 backdrop-blur"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles size={17} className="text-blue-400" />
                <h2 id="titulo-crear-historia">Crear historia</h2>
              </div>

              <textarea
                value={textoHistoria}
                onChange={(evento) =>
                  setTextoHistoria(evento.target.value.slice(0, 140))
                }
                placeholder="Comparte algo que esté pasando..."
                rows={3}
                autoFocus
                className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
              />

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600">
                <span>Visible para tu comunidad</span>
                <span>{textoHistoria.length}/140</span>
              </div>

              <div className="mt-4">
                <p className="mb-3 text-xs font-medium text-slate-400">
                  Elige un estilo
                </p>

                <div className="flex gap-3">
                  {coloresHistoria.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setColorHistoria(color)}
                      aria-label="Seleccionar estilo"
                      className={`h-10 flex-1 rounded-xl bg-gradient-to-br transition active:scale-95 ${color} ${colorHistoria === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#0b1626]"
                          : "opacity-60 hover:opacity-100"
                        }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={crearHistoria}
                disabled={!textoHistoria.trim()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={19} />
                Publicar historia
              </button>
            </div>
          </div>
        </div>
      )}



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

      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-none {
          scrollbar-width: none;
        }

        .story-enter {
          opacity: 0;
          animation: storyEnter 520ms cubic-bezier(.2,.8,.2,1) forwards;
        }

        .story-viewer-enter {
          animation: storyViewerEnter 260ms ease-out both;
        }

        .story-content-enter {
          animation: storyContentEnter 520ms cubic-bezier(.2,.8,.2,1) both;
        }

        .story-modal-enter {
          animation: storyModalEnter 320ms cubic-bezier(.2,.8,.2,1) both;
        }

        @keyframes storyEnter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes storyViewerEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes storyContentEnter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes storyModalEnter {
          from {
            opacity: 0;
            transform: translateY(24px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .story-enter,
          .story-viewer-enter,
          .story-content-enter,
          .story-modal-enter {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 
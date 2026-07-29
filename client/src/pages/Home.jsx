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
      autor: "Carlos Rodríguez",
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

export default function Home({ onLogout }) {
  const navigate = useNavigate();

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
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#06101f]/95 px-5 py-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-xl font-bold">
            Reporta<span className="text-red-500">RD</span>
          </h1>

          <div className="flex items-center">
            <button
              type="button"
              aria-label="Ver notificaciones"
              className="relative rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
            >
              <Bell size={22} />

              <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button
              type="button"
              onClick={() => setMostrarCierreSesion(true)}
              aria-label="Cerrar sesión"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-red-400"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main>
          <section className="px-5 pb-5 pt-6">
            <p className="text-sm font-medium text-slate-400">
              ¡Hola, Danny! 👋
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Tu comunidad hoy
            </h2>
          </section>

          <section className="mx-5 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 font-bold"
              >
                DT
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
                className="text-xs font-medium text-red-400"
              >
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {categorias.map(({ nombre, icono: Icono, color }) => (
                <button
                  type="button"
                  key={nombre}
                  className="flex min-w-0 flex-col items-center gap-2"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${color}`}
                  >
                    <Icono size={22} />
                  </span>

                  <span className="w-full truncate text-center text-[10px] text-slate-400">
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
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  CheckCircle2,
  MessageCircle,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";

const notificacionesIniciales = [
  {
    id: 1,
    tipo: "confirmacion",
    titulo: "Nueva confirmación",
    mensaje:
      "Laura Méndez confirmó tu reporte sobre la fuga de agua.",
    tiempo: "Hace 2 min",
    leida: false,
  },
  {
    id: 2,
    tipo: "estado",
    titulo: "Tu reporte cambió de estado",
    mensaje:
      'El reporte "Lámpara averiada frente al parque" ahora está en revisión.',
    tiempo: "Hace 18 min",
    leida: false,
  },
  {
    id: 3,
    tipo: "comentario",
    titulo: "Nuevo comentario",
    mensaje:
      "Carlos Rodríguez comentó en tu publicación comunitaria.",
    tiempo: "Hace 35 min",
    leida: false,
  },
  {
    id: 4,
    tipo: "amistad",
    titulo: "Solicitud de amistad",
    mensaje:
      "María Fernández quiere conectar contigo en ReportaRD.",
    tiempo: "Hace 1 h",
    leida: true,
  },
  {
    id: 5,
    tipo: "comunidad",
    titulo: "Actividad en tu comunidad",
    mensaje:
      "Santiago Centro publicó una nueva jornada comunitaria.",
    tiempo: "Hace 3 h",
    leida: true,
  },
];

const iconos = {
  confirmacion: {
    icono: CheckCircle2,
    color: "bg-green-500/15 text-green-400",
  },
  estado: {
    icono: RefreshCw,
    color: "bg-amber-500/15 text-amber-400",
  },
  comentario: {
    icono: MessageCircle,
    color: "bg-blue-500/15 text-blue-400",
  },
  amistad: {
    icono: UserPlus,
    color: "bg-violet-500/15 text-violet-400",
  },
  comunidad: {
    icono: Users,
    color: "bg-red-500/15 text-red-400",
  },
};

export default function Notifications() {
  const navigate = useNavigate();

  const todasLeidasGuardadas =
    localStorage.getItem("reportard_notifications_read") === "true";

  const [filtro, setFiltro] = useState("todas");

  const [notificaciones, setNotificaciones] = useState(() => {
    if (todasLeidasGuardadas) {
      return notificacionesIniciales.map((notificacion) => ({
        ...notificacion,
        leida: true,
      }));
    }

    return notificacionesIniciales;
  });

  const noLeidas = notificaciones.filter(
    (notificacion) => !notificacion.leida,
  ).length;

  const guardarEstado = (listaActualizada) => {
    const todasEstanLeidas = listaActualizada.every(
      (notificacion) => notificacion.leida,
    );

    localStorage.setItem(
      "reportard_notifications_read",
      String(todasEstanLeidas),
    );
  };

  const marcarComoLeida = (id) => {
    const listaActualizada = notificaciones.map((notificacion) =>
      notificacion.id === id
        ? { ...notificacion, leida: true }
        : notificacion,
    );

    setNotificaciones(listaActualizada);
    guardarEstado(listaActualizada);
  };

  const marcarTodasComoLeidas = () => {
    const listaActualizada = notificaciones.map((notificacion) => ({
      ...notificacion,
      leida: true,
    }));

    setNotificaciones(listaActualizada);
    guardarEstado(listaActualizada);
  };

  const notificacionesVisibles =
    filtro === "no-leidas"
      ? notificaciones.filter((notificacion) => !notificacion.leida)
      : notificaciones;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#06101f]/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Volver al inicio"
              className="rounded-xl p-2 text-slate-300 hover:bg-white/5"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="text-center">
              <h1 className="font-bold">
                Notificaciones
              </h1>

              {noLeidas > 0 && (
                <p className="text-xs text-red-400">
                  {noLeidas} sin leer
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={marcarTodasComoLeidas}
              aria-label="Marcar todas como leídas"
              className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-green-400"
            >
              <CheckCheck size={22} />
            </button>
          </div>

          <nav className="mt-4 grid grid-cols-2 rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setFiltro("todas")}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                filtro === "todas"
                  ? "bg-white/10 text-white"
                  : "text-slate-500"
              }`}
            >
              Todas
            </button>

            <button
              type="button"
              onClick={() => setFiltro("no-leidas")}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                filtro === "no-leidas"
                  ? "bg-white/10 text-white"
                  : "text-slate-500"
              }`}
            >
              No leídas
            </button>
          </nav>
        </header>

        <main className="px-4 py-5">
          {notificacionesVisibles.length > 0 ? (
            <div className="space-y-2">
              {notificacionesVisibles.map((notificacion) => {
                const configuracion = iconos[notificacion.tipo];
                const Icono = configuracion.icono;

                return (
                  <button
                    type="button"
                    key={notificacion.id}
                    onClick={() =>
                      marcarComoLeida(notificacion.id)
                    }
                    className={`relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                      notificacion.leida
                        ? "border-transparent bg-transparent"
                        : "border-white/10 bg-white/[0.045]"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${configuracion.color}`}
                    >
                      <Icono size={21} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        {notificacion.titulo}
                      </span>

                      <span className="mt-1 block text-sm leading-5 text-slate-400">
                        {notificacion.mensaje}
                      </span>

                      <span className="mt-2 block text-xs text-slate-600">
                        {notificacion.tiempo}
                      </span>
                    </span>

                    {!notificacion.leida && (
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-slate-500">
                <Bell size={28} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                Todo está al día
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                No tienes notificaciones pendientes por leer.
              </p>

              <button
                type="button"
                onClick={() => setFiltro("todas")}
                className="mt-5 text-sm font-medium text-red-400"
              >
                Ver todas
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
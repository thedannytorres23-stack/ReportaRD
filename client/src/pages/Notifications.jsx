import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Bell,
  CheckCheck,
  CheckCircle2,
  Heart,
  MessageCircle,
  Reply,
  UserPlus,
} from "lucide-react";

import { useNavigate } from "react-router";

import {
  conectarSocket,
} from "../services/socketService";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

const configuracionTipos = {
  confirmacion: {
    titulo: "Reporte confirmado",
    descripcion: "Confirmación ciudadana",
    icono: CheckCircle2,
    color:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  },

  comentario: {
    titulo: "Nuevo comentario",
    descripcion: "Conversación ciudadana",
    icono: MessageCircle,
    color:
      "bg-blue-500/10 text-blue-400 border-blue-500/15",
  },

  respuesta: {
    titulo: "Nueva respuesta",
    descripcion: "Continuaron la conversación",
    icono: Reply,
    color:
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/15",
  },

  reaccion: {
    titulo: "Nueva reacción",
    descripcion: "Interacción con tu contenido",
    icono: Heart,
    color:
      "bg-red-500/10 text-red-400 border-red-500/15",
  },

  seguimiento: {
    titulo: "Nuevo seguidor",
    descripcion: "Tu comunidad está creciendo",
    icono: UserPlus,
    color:
      "bg-violet-500/10 text-violet-400 border-violet-500/15",
  },
};

const obtenerToken = () => {
  const tokenDirecto =
    localStorage.getItem(
      "reportard_token",
    );

  if (tokenDirecto) {
    return tokenDirecto;
  }

  try {
    const usuario = JSON.parse(
      localStorage.getItem(
        "reportard_user",
      ) || "{}",
    );

    return usuario.token || "";
  } catch {
    return "";
  }
};

const procesarRespuesta = async (
  respuesta,
) => {
  let datos;

  try {
    datos = await respuesta.json();
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta inválida.",
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        "No se pudo completar la solicitud.",
    );
  }

  return datos;
};

const obtenerNombreEmisor = (
  notificacion,
) => {
  const emisor =
    notificacion.emisor;

  if (!emisor) {
    return "Alguien";
  }

  return (
    emisor.nombre ||
    emisor.nombreUsuario ||
    emisor.usuario ||
    "Alguien"
  );
};

const obtenerIniciales = (
  nombre = "",
) => {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) =>
      parte.charAt(0).toUpperCase(),
    )
    .join("");
};

const obtenerTiempo = (
  fecha,
) => {
  if (!fecha) {
    return "";
  }

  const creada = new Date(fecha);
  const ahora = new Date();

  const diferencia =
    ahora.getTime() -
    creada.getTime();

  const minutos = Math.floor(
    diferencia / 60000,
  );

  if (minutos < 1) {
    return "Ahora";
  }

  if (minutos < 60) {
    return `Hace ${minutos} min`;
  }

  const horas = Math.floor(
    minutos / 60,
  );

  if (horas < 24) {
    return `Hace ${horas} h`;
  }

  const dias = Math.floor(
    horas / 24,
  );

  if (dias < 7) {
    return `Hace ${dias} ${
      dias === 1 ? "día" : "días"
    }`;
  }

  return creada.toLocaleDateString(
    "es-DO",
    {
      day: "numeric",
      month: "short",

      year:
        creada.getFullYear() !==
        ahora.getFullYear()
          ? "numeric"
          : undefined,
    },
  );
};

export default function Notifications() {
  const navigate = useNavigate();

  const [filtro, setFiltro] =
    useState("todas");

  const [
    notificaciones,
    setNotificaciones,
  ] = useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    marcandoTodas,
    setMarcandoTodas,
  ] = useState(false);

  const [
    notificacionNuevaId,
    setNotificacionNuevaId,
  ] = useState(null);

  const token = obtenerToken();

  const cargarNotificaciones =
    async () => {
      if (!token) {
        setError(
          "Tu sesión no es válida. Inicia sesión nuevamente.",
        );

        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(
          `${API_URL}/notifications`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

        const datos =
          await procesarRespuesta(
            respuesta,
          );

        setNotificaciones(
          Array.isArray(
            datos.notificaciones,
          )
            ? datos.notificaciones
            : [],
        );
      } catch (errorSolicitud) {
        console.error(
          "Error cargando notificaciones:",
          errorSolicitud,
        );

        setError(
          errorSolicitud.message ||
            "No se pudieron cargar las notificaciones.",
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket =
      conectarSocket(token);

    if (!socket) {
      return undefined;
    }

    const recibirNotificacion = (
      notificacion,
    ) => {
      if (!notificacion?._id) {
        return;
      }

      setNotificaciones(
        (anteriores) => {
          const yaExiste =
            anteriores.some(
              (item) =>
                item._id ===
                notificacion._id,
            );

          if (yaExiste) {
            return anteriores;
          }

          return [
            notificacion,
            ...anteriores,
          ];
        },
      );

      setNotificacionNuevaId(
        notificacion._id,
      );

      window.setTimeout(() => {
        setNotificacionNuevaId(
          (actual) =>
            actual ===
            notificacion._id
              ? null
              : actual,
        );
      }, 1200);
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
  }, [token]);

  const noLeidas =
    notificaciones.filter(
      (notificacion) =>
        !notificacion.leida,
    ).length;

  const marcarComoLeida = async (
    id,
  ) => {
    const notificacion =
      notificaciones.find(
        (item) => item._id === id,
      );

    if (
      !notificacion ||
      notificacion.leida
    ) {
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_URL}/notifications/${id}/leer`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      await procesarRespuesta(
        respuesta,
      );

      setNotificaciones(
        (anteriores) =>
          anteriores.map(
            (item) =>
              item._id === id
                ? {
                    ...item,
                    leida: true,
                  }
                : item,
          ),
      );
    } catch (errorSolicitud) {
      console.error(
        "Error marcando notificación:",
        errorSolicitud,
      );

      setError(
        errorSolicitud.message ||
          "No se pudo actualizar la notificación.",
      );
    }
  };

  const marcarTodasComoLeidas =
    async () => {
      if (
        noLeidas === 0 ||
        marcandoTodas
      ) {
        return;
      }

      try {
        setMarcandoTodas(true);
        setError("");

        const respuesta = await fetch(
          `${API_URL}/notifications/leer-todas`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

        await procesarRespuesta(
          respuesta,
        );

        setNotificaciones(
          (anteriores) =>
            anteriores.map(
              (notificacion) => ({
                ...notificacion,
                leida: true,
              }),
            ),
        );
      } catch (errorSolicitud) {
        console.error(
          "Error marcando todas:",
          errorSolicitud,
        );

        setError(
          errorSolicitud.message ||
            "No se pudieron marcar las notificaciones.",
        );
      } finally {
        setMarcandoTodas(false);
      }
    };

  const notificacionesVisibles =
    filtro === "no-leidas"
      ? notificaciones.filter(
          (notificacion) =>
            !notificacion.leida,
        )
      : notificaciones;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">

        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#06101f]/90 backdrop-blur-2xl">
          <div className="px-4 pb-4 pt-3">

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                aria-label="Volver al inicio"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-600">
                  Reporta
                  <span className="text-red-500">
                    RD
                  </span>
                </p>

                <h1 className="mt-0.5 text-base font-bold tracking-tight">
                  Notificaciones
                </h1>
              </div>

              <button
                type="button"
                onClick={
                  marcarTodasComoLeidas
                }
                disabled={
                  noLeidas === 0 ||
                  marcandoTodas
                }
                aria-label="Marcar todas como leídas"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-slate-400 transition hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <CheckCheck size={20} />
              </button>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                    <Bell size={16} />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Tu actividad
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Interacciones de tu comunidad
                    </p>
                  </div>
                </div>
              </div>

              {noLeidas > 0 && (
                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400">
                  {noLeidas > 99
                    ? "99+"
                    : noLeidas}{" "}
                  nuevas
                </span>
              )}
            </div>

            <nav className="mt-4 grid grid-cols-2 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-1">
              <button
                type="button"
                onClick={() =>
                  setFiltro("todas")
                }
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  filtro === "todas"
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Todas
                <span className="ml-1.5 text-[10px] text-slate-500">
                  {notificaciones.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFiltro(
                    "no-leidas",
                  )
                }
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  filtro === "no-leidas"
                    ? "bg-red-500/10 text-red-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                No leídas

                {noLeidas > 0 && (
                  <span className="ml-1.5 text-[10px]">
                    {noLeidas}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </header>

        <main className="px-4 py-5">
          {cargando ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-3 rounded-3xl border border-white/[0.04] bg-white/[0.025] p-4"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/[0.06]" />

                    <div className="flex-1">
                      <div className="h-3 w-28 rounded bg-white/[0.07]" />
                      <div className="mt-3 h-2.5 w-4/5 rounded bg-white/[0.05]" />
                      <div className="mt-2 h-2 w-16 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : error ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/15 bg-red-500/10 text-red-400">
                <Bell size={27} />
              </div>

              <h2 className="mt-5 text-lg font-bold">
                No pudimos cargar tus notificaciones
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  cargarNotificaciones
                }
                className="mt-6 rounded-2xl bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1]"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : notificacionesVisibles.length >
            0 ? (
            <div className="space-y-2.5">
              {notificacionesVisibles.map(
                (notificacion) => {
                  const configuracion =
                    configuracionTipos[
                      notificacion.tipo
                    ] || {
                      titulo:
                        "Actividad nueva",
                      descripcion:
                        "Actividad en ReportaRD",
                      icono: Bell,
                      color:
                        "bg-slate-500/10 text-slate-400 border-slate-500/15",
                    };

                  const Icono =
                    configuracion.icono;

                  const nombreEmisor =
                    obtenerNombreEmisor(
                      notificacion,
                    );

                  const fotoEmisor =
                    notificacion.emisor
                      ?.foto || "";

                  const iniciales =
                    obtenerIniciales(
                      nombreEmisor,
                    ) || "RD";

                  const esNueva =
                    notificacionNuevaId ===
                    notificacion._id;

                  return (
                    <button
                      type="button"
                      key={
                        notificacion._id
                      }
                      onClick={() =>
                        marcarComoLeida(
                          notificacion._id,
                        )
                      }
                      className={`notification-card relative flex w-full overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 active:scale-[0.99] ${
                        notificacion.leida
                          ? "border-white/[0.035] bg-white/[0.015] hover:bg-white/[0.035]"
                          : "border-white/[0.08] bg-white/[0.045] shadow-lg shadow-black/10 hover:border-white/[0.12] hover:bg-white/[0.06]"
                      } ${
                        esNueva
                          ? "notification-new"
                          : ""
                      }`}
                    >
                      {!notificacion.leida && (
                        <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-red-500" />
                      )}

                      <div className="flex w-full gap-3.5">

                        <div className="relative shrink-0">
                          {fotoEmisor ? (
                            <img
                              src={
                                fotoEmisor
                              }
                              alt={`Foto de ${nombreEmisor}`}
                              className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-800 to-slate-900 text-xs font-bold text-slate-300">
                              {iniciales}
                            </div>
                          )}

                          <span
                            className={`absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-[#081321] ${configuracion.color}`}
                          >
                            <Icono
                              size={12}
                              strokeWidth={
                                2.4
                              }
                            />
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-bold text-slate-100">
                                {
                                  nombreEmisor
                                }
                              </p>

                              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-600">
                                {
                                  configuracion.descripcion
                                }
                              </p>
                            </div>

                            {!notificacion.leida && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.45)]" />
                            )}
                          </div>

                          <p className="mt-2 text-sm leading-5 text-slate-400">
                            {
                              notificacion.mensaje
                            }
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-600">
                              {obtenerTiempo(
                                notificacion.createdAt,
                              )}
                            </span>

                            {!notificacion.leida && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-slate-700" />

                                <span className="text-[10px] font-semibold text-red-400">
                                  Nueva
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          ) : (
            <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-white/[0.06] bg-white/[0.025] text-slate-500">
                <Bell size={30} />

                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-emerald-400" />
              </div>

              <h2 className="mt-6 text-lg font-bold">
                {filtro ===
                "no-leidas"
                  ? "Todo está al día"
                  : "Sin actividad todavía"}
              </h2>

              <p className="mt-2 max-w-[17rem] text-sm leading-6 text-slate-500">
                {filtro ===
                "no-leidas"
                  ? "Ya revisaste toda tu actividad reciente."
                  : "Cuando alguien interactúe con tus publicaciones, reportes o perfil, aparecerá aquí."}
              </p>

              {filtro ===
                "no-leidas" && (
                <button
                  type="button"
                  onClick={() =>
                    setFiltro(
                      "todas",
                    )
                  }
                  className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07]"
                >
                  Ver historial
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .notification-new {
          animation: notificationEnter 520ms cubic-bezier(.2,.8,.2,1);
        }

        @keyframes notificationEnter {
          0% {
            opacity: 0;
            transform: translateY(-12px) scale(.98);
          }

          55% {
            opacity: 1;
            transform: translateY(2px) scale(1.005);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .notification-new {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
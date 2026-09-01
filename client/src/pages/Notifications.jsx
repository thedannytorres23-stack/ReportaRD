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

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

const configuracionTipos = {
  confirmacion: {
    titulo: "Nueva confirmación",
    icono: CheckCircle2,
    color:
      "bg-green-500/15 text-green-400",
  },

  comentario: {
    titulo: "Nuevo comentario",
    icono: MessageCircle,
    color:
      "bg-blue-500/15 text-blue-400",
  },

  respuesta: {
    titulo: "Nueva respuesta",
    icono: Reply,
    color:
      "bg-cyan-500/15 text-cyan-400",
  },

  reaccion: {
    titulo: "Nueva reacción",
    icono: Heart,
    color:
      "bg-red-500/15 text-red-400",
  },

  seguimiento: {
    titulo: "Nuevo seguidor",
    icono: UserPlus,
    color:
      "bg-violet-500/15 text-violet-400",
  },
};

const obtenerToken = () => {
  const tokenDirecto =
    localStorage.getItem("reportard_token");

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
    return `Hace ${horas} ${
      horas === 1 ? "h" : "h"
    }`;
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
      } catch (error) {
        console.error(
          "Error cargando notificaciones:",
          error,
        );

        setError(
          error.message ||
            "No se pudieron cargar las notificaciones.",
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

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
    } catch (error) {
      console.error(
        "Error marcando notificación:",
        error,
      );

      setError(
        error.message ||
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
      } catch (error) {
        console.error(
          "Error marcando todas:",
          error,
        );

        setError(
          error.message ||
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
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#06101f]/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
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
              onClick={
                marcarTodasComoLeidas
              }
              disabled={
                noLeidas === 0 ||
                marcandoTodas
              }
              aria-label="Marcar todas como leídas"
              className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <CheckCheck
                size={22}
              />
            </button>
          </div>

          <nav className="mt-4 grid grid-cols-2 rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() =>
                setFiltro("todas")
              }
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
              onClick={() =>
                setFiltro(
                  "no-leidas",
                )
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                filtro ===
                "no-leidas"
                  ? "bg-white/10 text-white"
                  : "text-slate-500"
              }`}
            >
              No leídas
            </button>
          </nav>
        </header>

        <main className="px-4 py-5">
          {cargando ? (
            <div className="flex min-h-[55vh] items-center justify-center">
              <p className="text-sm text-slate-500">
                Cargando
                notificaciones...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Bell size={28} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No pudimos cargar tus
                notificaciones
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  cargarNotificaciones
                }
                className="mt-5 text-sm font-medium text-red-400"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : notificacionesVisibles.length >
            0 ? (
            <div className="space-y-2">
              {notificacionesVisibles.map(
                (notificacion) => {
                  const configuracion =
                    configuracionTipos[
                      notificacion
                        .tipo
                    ] || {
                      titulo:
                        "Notificación",
                      icono: Bell,
                      color:
                        "bg-slate-500/15 text-slate-400",
                    };

                  const Icono =
                    configuracion.icono;

                  const nombreEmisor =
                    obtenerNombreEmisor(
                      notificacion,
                    );

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
                      className={`relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        notificacion.leida
                          ? "border-transparent bg-transparent"
                          : "border-white/10 bg-white/[0.045]"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${configuracion.color}`}
                      >
                        <Icono
                          size={21}
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">
                          {
                            configuracion.titulo
                          }
                        </span>

                        <span className="mt-1 block text-sm leading-5 text-slate-400">
                          <strong className="font-medium text-slate-300">
                            {
                              nombreEmisor
                            }
                          </strong>{" "}
                          {
                            notificacion.mensaje
                          }
                        </span>

                        <span className="mt-2 block text-xs text-slate-600">
                          {obtenerTiempo(
                            notificacion.createdAt,
                          )}
                        </span>
                      </span>

                      {!notificacion.leida && (
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                },
              )}
            </div>
          ) : (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-slate-500">
                <Bell size={28} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                {filtro ===
                "no-leidas"
                  ? "Todo está al día"
                  : "Aún no tienes notificaciones"}
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                {filtro ===
                "no-leidas"
                  ? "No tienes notificaciones pendientes por leer."
                  : "Cuando alguien interactúe contigo, aparecerá aquí."}
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
                  className="mt-5 text-sm font-medium text-red-400"
                >
                  Ver todas
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
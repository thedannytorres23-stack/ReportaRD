import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  MessageCircle,
  Send,
  Share2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import ContentOptions from "./ContentOptions";
import { eliminarPublicacion } from "../services/contentService";
import {
  crearComentario,
  listarComentarios,
} from "../services/commentService";

import {
  obtenerReacciones,
  reaccionarContenido,
} from "../services/reactionService";



const REACCIONES_PUBLICACION = [
  {
    id: "me_importa",
    emoji: "❤️",
    nombre: "Me importa",
  },
  {
    id: "buena_idea",
    emoji: "💡",
    nombre: "Buena idea",
  },
  {
    id: "buen_aporte",
    emoji: "👏",
    nombre: "Buen aporte",
  },
  {
    id: "impactante",
    emoji: "😮",
    nombre: "Impactante",
  },
  {
    id: "indignante",
    emoji: "😡",
    nombre: "Indignante",
  },
  {
    id: "apoyo_ciudadano",
    emoji: "🛡️",
    nombre: "Apoyo ciudadano",
  },
];

export default function PostCard({ publicacion, modoDetalle = false }) {
  const navigate = useNavigate();
  const usuarioActual = (() => {
    try {
      return JSON.parse(localStorage.getItem("reportard_user") || "{}");
    } catch {
      return {};
    }
  })();

  const idModeracion = `post-${publicacion.id ?? `${publicacion.autor}-${publicacion.tiempo}`
    }`;

  const [oculto, setOculto] = useState(() => {
    try {
      const ocultos = JSON.parse(
        localStorage.getItem("reportard_hidden_content") || "[]",
      );
      const eliminados = JSON.parse(
        localStorage.getItem("reportard_deleted_content") || "[]",
      );
      const silenciados = JSON.parse(
        localStorage.getItem("reportard_muted_users") || "[]",
      );
      const bloqueados = JSON.parse(
        localStorage.getItem("reportard_blocked_users") || "[]",
      );

      return (
        ocultos.includes(idModeracion) ||
        eliminados.includes(idModeracion) ||
        silenciados.includes(publicacion.autor) ||
        bloqueados.includes(publicacion.autor)
      );
    } catch {
      return false;
    }
  });

  const [eliminada, setEliminada] = useState(false);

  const esPropia = (() => {
    try {
      const usuario = JSON.parse(
        localStorage.getItem("reportard_user") || "{}",
      );

      const miId = String(usuario._id || usuario.id || "");
      const autorId = String(publicacion.autorId || "");

      return (
        publicacion.esPropia === true ||
        (Boolean(miId) && miId === autorId)
      );
    } catch {
      return publicacion.esPropia === true;
    }
  })();

  const eliminarContenido = async () => {
    const token = localStorage.getItem("reportard_token") || "";

    if (!token || !publicacion.id) {
      throw new Error("No se pudo identificar la publicación o la sesión.");
    }

    await eliminarPublicacion(token, publicacion.id);
    setEliminada(true);
  };

  const abrirPerfil = () => {
    if (esPropia) {
      navigate("/perfil");
      return;
    }

    if (publicacion.autorId) {
      navigate(`/usuario/${publicacion.autorId}`);
    }
  };

  const abrirDetalle = () => {
    if (modoDetalle) return;

    const seleccion = {
      tipo: "publicacion",
      datos: publicacion,
    };

    localStorage.setItem(
      "reportard_selected_content",
      JSON.stringify(seleccion),
    );

    navigate(`/publicacion/${publicacion.id ?? "actual"}`, {
      state: seleccion,
    });
  };

  const clavePublicacion = useMemo(
    () =>
      `reportard_post_${publicacion.id ??
      `${publicacion.autor}_${publicacion.tiempo}`
      }`,
    [publicacion],
  );



  const [guardado, setGuardado] = useState(() => {
    const datosGuardados = localStorage.getItem(
      clavePublicacion,
    );

    if (!datosGuardados) return false;

    try {
      return JSON.parse(datosGuardados).guardado ?? false;
    } catch {
      return false;
    }
  });

  const [comentarios, setComentarios] = useState([]);
  const [comentariosCargados, setComentariosCargados] =
    useState(false);
  const [cargandoComentarios, setCargandoComentarios] =
    useState(false);
  const [enviandoComentario, setEnviandoComentario] =
    useState(false);
  const [enviandoRespuesta, setEnviandoRespuesta] =
    useState(false);
  const [errorComentarios, setErrorComentarios] =
    useState("");

  const [compartidosLocales, setCompartidosLocales] =
    useState(() => {
      const datosGuardados = localStorage.getItem(
        clavePublicacion,
      );

      if (!datosGuardados) return 0;

      try {
        return (
          JSON.parse(datosGuardados).compartidosLocales ?? 0
        );
      } catch {
        return 0;
      }
    });

  const [mostrarComentarios, setMostrarComentarios] =
    useState(false);

  const [nuevoComentario, setNuevoComentario] =
    useState("");

  const [comentarioRespondiendo, setComentarioRespondiendo] =
    useState(null);

  const [nuevaRespuesta, setNuevaRespuesta] = useState("");

  const [mensajeCompartido, setMensajeCompartido] =
    useState("");

  const [mostrarReacciones, setMostrarReacciones] =
    useState(false);

  const [totalReacciones, setTotalReacciones] =
    useState(publicacion.reacciones ?? 0);

  const [resumenReacciones, setResumenReacciones] =
    useState({});

  const [miReaccion, setMiReaccion] =
    useState(null);

  const [cargandoReacciones, setCargandoReacciones] =
    useState(false);

  const [reaccionando, setReaccionando] =
    useState(false);

  const [errorReacciones, setErrorReacciones] =
    useState("");

  useEffect(() => {
    localStorage.setItem(
      clavePublicacion,
      JSON.stringify({
        guardado,
        compartidosLocales,
      }),
    );
  }, [
    clavePublicacion,
    guardado,
    compartidosLocales,
  ]);

  useEffect(() => {
    const actualizarModeracion = (evento) => {
      // Nunca aplicar moderación local sobre contenido propio.
      if (esPropia) {
        return;
      }

      const {
        accion,
        contenidoId,
        autor,
      } = evento.detail || {};

      if (
        contenidoId === idModeracion ||
        (
          ["silenciar", "bloquear"].includes(accion) &&
          autor === publicacion.autor
        )
      ) {
        setOculto(true);
      }
    };

    window.addEventListener(
      "reportard_moderation_changed",
      actualizarModeracion
    );

    return () => {
      window.removeEventListener(
        "reportard_moderation_changed",
        actualizarModeracion
      );
    };
  }, [
    esPropia,
    idModeracion,
    publicacion.autor,
  ]);

  useEffect(() => {
    const cargarReacciones = async () => {
      const token =
        localStorage.getItem("reportard_token") || "";

      if (!token || !publicacion.id) return;

      try {
        setCargandoReacciones(true);
        setErrorReacciones("");

        const respuesta = await obtenerReacciones(
          token,
          "post",
          publicacion.id,
        );

        setTotalReacciones(respuesta.total ?? 0);
        setResumenReacciones(respuesta.resumen || {});
        setMiReaccion(respuesta.miReaccion || null);
      } catch (error) {
        console.error(
          "Error cargando reacciones:",
          error,
        );

        setErrorReacciones(
          error.message ||
          "No se pudieron cargar las reacciones.",
        );
      } finally {
        setCargandoReacciones(false);
      }
    };

    cargarReacciones();
  }, [publicacion.id]);

  const seleccionarReaccion = async (tipoReaccion) => {
    if (reaccionando) return;

    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token || !publicacion.id) {
      setErrorReacciones(
        "No se pudo identificar la sesión o la publicación.",
      );
      return;
    }

    try {
      setReaccionando(true);
      setErrorReacciones("");

      const respuesta = await reaccionarContenido(
        token,
        "post",
        publicacion.id,
        tipoReaccion,
      );

      setTotalReacciones(respuesta.total ?? 0);
      setResumenReacciones(respuesta.resumen || {});
      setMiReaccion(respuesta.miReaccion || null);

      setMostrarReacciones(false);
    } catch (error) {
      setErrorReacciones(
        error.message ||
        "No se pudo registrar la reacción.",
      );
    } finally {
      setReaccionando(false);
    }
  };

  const reaccionActiva = REACCIONES_PUBLICACION.find(
    (reaccion) => reaccion.id === miReaccion,
  );

  const contarComentarios = (lista) => {
    return lista.reduce(
      (total, comentario) =>
        total +
        1 +
        contarComentarios(comentario.respuestas || []),
      0,
    );
  };

  const totalComentarios = comentariosCargados
    ? contarComentarios(comentarios)
    : publicacion.comentarios ?? 0;

  const totalCompartidos =
    (publicacion.compartidos ?? 0) + compartidosLocales;

  const obtenerIniciales = (nombre = "") => {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) return "RD";

    return partes
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("");
  };

  const formatearTiempoComentario = (fecha) => {
    if (!fecha) return "Ahora";

    const fechaComentario = new Date(fecha);
    const diferencia =
      Date.now() - fechaComentario.getTime();

    const minutos = Math.floor(diferencia / 60000);

    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `Hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);

    if (horas < 24) {
      return `Hace ${horas} h`;
    }

    const dias = Math.floor(horas / 24);

    if (dias < 7) {
      return `Hace ${dias} d`;
    }

    return new Intl.DateTimeFormat("es-DO", {
      day: "numeric",
      month: "short",
    }).format(fechaComentario);
  };

  const convertirComentario = (comentario) => {
    const nombreAutor =
      comentario.autor?.nombre ||
      "Ciudadano ReportaRD";

    return {
      id: comentario._id,
      autorId:
        comentario.autor?._id ||
        comentario.autor?.id ||
        "",
      autor: nombreAutor,
      usuario: comentario.autor?.usuario || "",
      foto: comentario.autor?.foto || "",
      iniciales: obtenerIniciales(nombreAutor),
      contenido: comentario.contenido,
      tiempo: formatearTiempoComentario(
        comentario.createdAt,
      ),
      respuestaA:
        comentario.respuestaA?._id ||
        comentario.respuestaA ||
        null,
      respuestas: [],
    };
  };

  const organizarComentarios = (lista = []) => {
    const mapa = new Map();
    const principales = [];

    lista.forEach((comentario) => {
      const convertido = convertirComentario(comentario);
      mapa.set(String(convertido.id), convertido);
    });

    lista.forEach((comentario) => {
      const convertido = mapa.get(
        String(comentario._id),
      );

      const respuestaA =
        comentario.respuestaA?._id ||
        comentario.respuestaA ||
        null;

      if (respuestaA) {
        const padre = mapa.get(String(respuestaA));

        if (padre) {
          padre.respuestas.push(convertido);
          return;
        }
      }

      principales.push(convertido);
    });

    return principales;
  };

  const cargarComentariosReales = async () => {
    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token || !publicacion.id) {
      return;
    }

    try {
      setCargandoComentarios(true);
      setErrorComentarios("");

      const respuesta = await listarComentarios(
        token,
        "post",
        publicacion.id,
      );

      setComentarios(
        organizarComentarios(
          respuesta.comentarios || [],
        ),
      );

      setComentariosCargados(true);
    } catch (error) {
      setErrorComentarios(
        error.message ||
        "No se pudieron cargar los comentarios.",
      );
    } finally {
      setCargandoComentarios(false);
    }
  };

  useEffect(() => {
    if (!mostrarComentarios) return;

    cargarComentariosReales();
  }, [mostrarComentarios, publicacion.id]);

  const agregarComentario = async (evento) => {
    evento.preventDefault();

    const contenido = nuevoComentario.trim();

    if (!contenido || enviandoComentario) return;

    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token || !publicacion.id) {
      setErrorComentarios(
        "No se pudo identificar la sesión o la publicación.",
      );
      return;
    }

    try {
      setEnviandoComentario(true);
      setErrorComentarios("");

      const respuesta = await crearComentario(
        token,
        "post",
        publicacion.id,
        contenido,
      );

      const comentarioNuevo = convertirComentario(
        respuesta.comentario,
      );

      setComentarios((actuales) => [
        ...actuales,
        comentarioNuevo,
      ]);

      setComentariosCargados(true);
      setNuevoComentario("");
    } catch (error) {
      setErrorComentarios(
        error.message ||
        "No se pudo publicar el comentario.",
      );
    } finally {
      setEnviandoComentario(false);
    }
  };

  const agregarRespuesta = async (comentarioId) => {
    const contenido = nuevaRespuesta.trim();

    if (!contenido || enviandoRespuesta) return;

    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token || !publicacion.id) {
      setErrorComentarios(
        "No se pudo identificar la sesión o la publicación.",
      );
      return;
    }

    try {
      setEnviandoRespuesta(true);
      setErrorComentarios("");

      const respuesta = await crearComentario(
        token,
        "post",
        publicacion.id,
        contenido,
        comentarioId,
      );

      const respuestaNueva = convertirComentario(
        respuesta.comentario,
      );

      setComentarios((actuales) =>
        actuales.map((comentario) => {
          if (String(comentario.id) !== String(comentarioId)) {
            return comentario;
          }

          return {
            ...comentario,
            respuestas: [
              ...(comentario.respuestas || []),
              respuestaNueva,
            ],
          };
        }),
      );

      setNuevaRespuesta("");
      setComentarioRespondiendo(null);
      setComentariosCargados(true);
    } catch (error) {
      setErrorComentarios(
        error.message ||
        "No se pudo publicar la respuesta.",
      );
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const abrirPerfilComentario = (autorId) => {
    if (!autorId) return;

    const miId = String(
      usuarioActual._id ||
      usuarioActual.id ||
      "",
    );

    if (miId && miId === String(autorId)) {
      navigate("/perfil");
      return;
    }

    navigate(`/usuario/${autorId}`);
  };

  const compartirPublicacion = async () => {
    const datosCompartir = {
      title: `Publicación de ${publicacion.autor}`,
      text: publicacion.contenido,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(datosCompartir);
      } else {
        await navigator.clipboard.writeText(
          window.location.href,
        );

        setMensajeCompartido("Enlace copiado");
      }

      setCompartidosLocales((totalActual) => totalActual + 1);

      setTimeout(() => {
        setMensajeCompartido("");
      }, 2000);
    } catch (error) {
      if (error?.name !== "AbortError") {
        setMensajeCompartido("No se pudo compartir");
      }
    }
  };

  if (oculto || eliminada) return null;

  return (
    <article className="group/card overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.025] shadow-xl shadow-black/10 transition duration-300 hover:border-white/[0.16]">
      <header className="flex items-start gap-3 border-b border-white/[0.035] p-4">
        <button
          type="button"
          onClick={abrirPerfil}
          aria-label={`Abrir perfil de ${publicacion.autor}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/10 bg-gradient-to-br from-violet-500 to-blue-500 font-bold text-white shadow-lg shadow-violet-500/15 transition hover:scale-105 active:scale-95"
        >
          {publicacion.iniciales}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={abrirPerfil}
              className="truncate text-left font-semibold hover:underline"
            >
              {publicacion.autor}
            </button>

            {publicacion.verificado && (
              <CheckCircle2
                size={16}
                className="shrink-0 text-blue-400"
                fill="currentColor"
                strokeWidth={3}
              />
            )}
          </div>

          <p className="truncate text-xs text-slate-400">
            {publicacion.comunidad} · {publicacion.tiempo}
          </p>
        </div>

        <ContentOptions
          contenidoId={idModeracion}
          autor={publicacion.autor}
          tipo="publicación"
          esPropio={esPropia}
          onOcultar={() => setOculto(true)}
          onEditar={() =>
            navigate(`/publicar?editar=${publicacion.id ?? "actual"}`)
          }
          onEliminar={eliminarContenido}
        />
      </header>

      <div
        onClick={abrirDetalle}
        role={modoDetalle ? undefined : "button"}
        tabIndex={modoDetalle ? undefined : 0}
        onKeyDown={(evento) => {
          if (!modoDetalle && ["Enter", " "].includes(evento.key)) {
            abrirDetalle();
          }
        }}
        className={`px-4 pb-4 ${modoDetalle ? "" : "cursor-pointer"
          }`}
      >
        {publicacion.titulo && (
          <h3 className="mb-2 text-base font-semibold leading-6 text-white">
            {publicacion.titulo}
          </h3>
        )}

        <p className="text-sm leading-6 text-slate-200">
          {publicacion.contenido}
        </p>
      </div>

      {publicacion.mediaUrl ? (
        publicacion.mediaTipo === "video" ? (
          <div className="flex max-h-[34rem] w-full justify-center overflow-hidden bg-black">
            <video
              src={publicacion.mediaUrl}
              poster={publicacion.mediaPoster}
              controls
              playsInline
              preload="metadata"
              className="max-h-[34rem] w-full object-contain"
            />
          </div>
        ) : (
          <img
            src={publicacion.mediaUrl}
            alt={
              publicacion.mediaAlt ||
              `Contenido compartido por ${publicacion.autor}`
            }
            loading="lazy"
            onClick={abrirDetalle}
            className="max-h-96 w-full object-cover"
          />
        )
      ) : (
        <div className="mx-4 flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-blue-400/10 bg-gradient-to-br from-blue-950 to-violet-950 shadow-inner">
          <div className="text-center text-blue-300">
            <Users size={40} className="mx-auto" />

            <p className="mt-3 text-sm font-medium">
              Actividad comunitaria
            </p>
          </div>
        </div>
      )}

      <div className="relative px-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMostrarReacciones(
                  (estadoActual) => !estadoActual,
                )
              }
              disabled={cargandoReacciones || reaccionando}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 ${reaccionActiva
                ? "border-violet-400/30 bg-violet-500/10 text-violet-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                } ${reaccionando
                  ? "cursor-wait opacity-60"
                  : ""
                }`}
            >
              <span className="text-xl">
                {reaccionActiva?.emoji || "✨"}
              </span>

              <span>
                {reaccionando
                  ? "Reaccionando..."
                  : reaccionActiva?.nombre || "Reaccionar"}
              </span>
            </button>

            {mostrarReacciones && (
              <div
                className="
            absolute bottom-full left-0 z-50 mb-3
            w-[min(92vw,430px)]
            rounded-3xl border border-white/10
            bg-slate-950/95 p-3
            shadow-2xl shadow-black/50
            backdrop-blur-xl
          "
              >
                <div className="mb-2 px-2">
                  <p className="text-xs font-semibold text-white">
                    ¿Qué piensas de esta publicación?
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Elige una reacción
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {REACCIONES_PUBLICACION.map((reaccion) => {
                    const seleccionada =
                      miReaccion === reaccion.id;

                    const cantidad =
                      resumenReacciones[reaccion.id] || 0;

                    return (
                      <button
                        key={reaccion.id}
                        type="button"
                        disabled={reaccionando}
                        onClick={() =>
                          seleccionarReaccion(reaccion.id)
                        }
                        className={`group relative flex min-h-[82px] flex-col items-center justify-center rounded-2xl border px-2 py-3 transition duration-200 hover:-translate-y-1 active:scale-95 ${seleccionada
                          ? "border-violet-400/40 bg-violet-500/15"
                          : "border-white/5 bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.07]"
                          }`}
                      >
                        <span className="text-3xl transition duration-200 group-hover:scale-125">
                          {reaccion.emoji}
                        </span>

                        <span
                          className={`mt-1 text-center text-[10px] leading-tight ${seleccionada
                            ? "font-semibold text-violet-300"
                            : "text-slate-400"
                            }`}
                        >
                          {reaccion.nombre}
                        </span>

                        {cantidad > 0 && (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
                            {cantidad}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {miReaccion && (
                  <p className="mt-3 text-center text-[10px] text-slate-500">
                    Toca nuevamente tu reacción para quitarla.
                  </p>
                )}
              </div>
            )}
          </div>

          {totalReacciones > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex -space-x-1">
                {REACCIONES_PUBLICACION
                  .filter(
                    (reaccion) =>
                      (resumenReacciones[reaccion.id] || 0) > 0,
                  )
                  .slice(0, 3)
                  .map((reaccion) => (
                    <span
                      key={reaccion.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-800 text-sm"
                    >
                      {reaccion.emoji}
                    </span>
                  ))}
              </div>

              <span>
                {totalReacciones}{" "}
                {totalReacciones === 1
                  ? "reacción"
                  : "reacciones"}
              </span>
            </div>
          )}
        </div>

        {errorReacciones && (
          <p className="mt-2 text-xs text-red-400">
            {errorReacciones}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-4 text-xs text-slate-400">

        <div className="flex items-center gap-2">
          {totalReacciones > 0 ? (
            <>
              <span className="flex -space-x-1">
                {REACCIONES_PUBLICACION
                  .filter(
                    (reaccion) =>
                      (resumenReacciones[reaccion.id] || 0) > 0,
                  )
                  .slice(0, 3)
                  .map((reaccion) => (
                    <span
                      key={reaccion.id}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-950 bg-slate-800 text-[10px]"
                    >
                      {reaccion.emoji}
                    </span>
                  ))}
              </span>

              <span>
                {totalReacciones}{" "}
                {totalReacciones === 1
                  ? "reacción"
                  : "reacciones"}
              </span>
            </>
          ) : (
            <span>Sin reacciones</span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              setMostrarComentarios(
                (estadoActual) => !estadoActual,
              )
            }
          >
            {totalComentarios} comentarios
          </button>

          <span>{totalCompartidos} compartidos</span>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      <footer className="grid grid-cols-4 px-2 py-2">
        <button
          type="button"
          onClick={() =>
            setMostrarReacciones(
              (estadoActual) => !estadoActual,
            )
          }
          disabled={reaccionando}
          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${reaccionActiva
              ? "bg-violet-500/10 text-violet-300"
              : "text-slate-400 hover:bg-white/5"
            }`}
        >
          <span className="text-[21px] leading-none">
            {reaccionActiva?.emoji || "✨"}
          </span>

          <span>
            {reaccionActiva
              ? reaccionActiva.nombre
              : "Reaccionar"}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setMostrarComentarios(
              (estadoActual) => !estadoActual,
            )
          }
          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${mostrarComentarios
            ? "bg-blue-500/10 text-blue-400"
            : "text-slate-400 hover:bg-white/5"
            }`}
        >
          <MessageCircle size={21} />
          Comentar
        </button>

        <button
          type="button"
          onClick={compartirPublicacion}
          className="relative flex flex-col items-center gap-1 rounded-xl py-2 text-xs text-slate-400 transition hover:bg-white/5"
        >
          <Share2 size={21} />
          Compartir

          {mensajeCompartido && (
            <span className="absolute -top-8 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-[10px] text-white shadow-xl">
              {mensajeCompartido}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            setGuardado((estadoActual) => !estadoActual)
          }
          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${guardado
            ? "text-amber-400"
            : "text-slate-400 hover:bg-white/5"
            }`}
        >
          <Bookmark
            size={21}
            fill={guardado ? "currentColor" : "none"}
          />
          Guardar
        </button>
      </footer>

      {mostrarComentarios && (
        <section className="border-t border-white/10 px-4 py-4">
          <form
            onSubmit={agregarComentario}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-red-500 text-xs font-bold">
              {usuarioActual.foto ? (
                <img
                  src={usuarioActual.foto}
                  alt={usuarioActual.nombre || "Usuario"}
                  className="h-full w-full object-cover"
                />
              ) : (
                obtenerIniciales(
                  usuarioActual.nombre || "RD",
                )
              )}
            </div>

            <input
              type="text"
              value={nuevoComentario}
              onChange={(evento) =>
                setNuevoComentario(evento.target.value)
              }
              placeholder="Escribe un comentario..."
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
            />

            <button
              type="submit"
              disabled={!nuevoComentario.trim() || enviandoComentario}
              aria-label="Enviar comentario"
              className="rounded-full bg-blue-500 p-2.5 text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </form>

          {errorComentarios && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {errorComentarios}
            </div>
          )}

          <div className="mt-4 space-y-4">
            {cargandoComentarios && !comentariosCargados ? (
              <p className="py-3 text-center text-xs text-slate-500">
                Cargando comentarios...
              </p>
            ) : comentarios.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-500">
                Sé el primero en comentar.
              </p>
            ) : (
              comentarios.map((comentario) => (
                <article key={comentario.id}>
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        abrirPerfilComentario(
                          comentario.autorId,
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-red-500 text-[10px] font-bold"
                    >
                      {comentario.foto ? (
                        <img
                          src={comentario.foto}
                          alt={comentario.autor}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        comentario.iniciales
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl bg-white/5 px-3 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            abrirPerfilComentario(
                              comentario.autorId,
                            )
                          }
                          className="text-xs font-semibold text-white hover:underline"
                        >
                          {comentario.autor}
                        </button>

                        <p className="mt-1 break-words text-sm text-slate-300">
                          {comentario.contenido}
                        </p>
                      </div>

                      <div className="mt-1 flex items-center gap-3 px-2 text-[10px] text-slate-500">
                        <span>{comentario.tiempo}</span>

                        <button
                          type="button"
                          onClick={() => {
                            setComentarioRespondiendo(
                              comentario.id,
                            );

                            setNuevaRespuesta("");
                          }}
                          className="font-medium hover:text-blue-400"
                        >
                          Responder
                        </button>
                      </div>

                      {comentario.respuestas.map(
                        (respuesta) => (
                          <div
                            key={respuesta.id}
                            className="ml-5 mt-3 flex items-start gap-2"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                abrirPerfilComentario(
                                  respuesta.autorId,
                                )
                              }
                              className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-500/20 text-[9px] font-bold text-blue-300"
                            >
                              {respuesta.foto ? (
                                <img
                                  src={respuesta.foto}
                                  alt={respuesta.autor}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                respuesta.iniciales
                              )}
                            </button>

                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <button
                                type="button"
                                onClick={() =>
                                  abrirPerfilComentario(
                                    respuesta.autorId,
                                  )
                                }
                                className="text-xs font-semibold hover:underline"
                              >
                                {respuesta.autor}
                              </button>

                              <p className="mt-1 text-sm text-slate-300">
                                {respuesta.contenido}
                              </p>
                            </div>
                          </div>
                        ),
                      )}

                      {comentarioRespondiendo ===
                        comentario.id && (
                          <div className="ml-5 mt-3 flex gap-2">
                            <input
                              type="text"
                              autoFocus
                              value={nuevaRespuesta}
                              onChange={(evento) =>
                                setNuevaRespuesta(
                                  evento.target.value,
                                )
                              }
                              onKeyDown={(evento) => {
                                if (
                                  evento.key === "Enter" &&
                                  !enviandoRespuesta
                                ) {
                                  evento.preventDefault();
                                  agregarRespuesta(
                                    comentario.id,
                                  );
                                }
                              }}
                              placeholder={`Responder a ${comentario.autor}...`}
                              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                agregarRespuesta(comentario.id)
                              }
                              disabled={!nuevaRespuesta.trim() || enviandoRespuesta}
                              className="rounded-full bg-blue-500 p-2 text-white disabled:opacity-40"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </article>
  );
}
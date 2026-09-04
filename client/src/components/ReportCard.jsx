import { useEffect, useMemo, useState } from "react";

import {
  Bookmark,
  CheckCircle2,
  Construction,
  MapPin,
  MessageCircle,
  Share2,
} from "lucide-react";


import { useNavigate } from "react-router";
import ContentOptions from "./ContentOptions";

import {
  confirmarReporte,
  eliminarReporte,
} from "../services/contentService";

import {
  crearComentario,
  listarComentarios,
} from "../services/commentService";

import {
  obtenerReacciones,
  reaccionarContenido,
} from "../services/reactionService";

import CommentsPanel from "./CommentsPanel";


const REACCIONES_REPORTE = [
  {
    id: "me_preocupa",
    emoji: "😟",
    nombre: "Me preocupa",
  },
  {
    id: "tengo_solucion",
    emoji: "💡",
    nombre: "Tengo solución",
  },
  {
    id: "puedo_ayudar",
    emoji: "🛠️",
    nombre: "Puedo ayudar",
  },
  {
    id: "difundir",
    emoji: "📢",
    nombre: "Difundir",
  },
  {
    id: "autoridad",
    emoji: "🏛️",
    nombre: "Autoridad",
  },
  {
    id: "apoyo_ciudadano",
    emoji: "🛡️",
    nombre: "Apoyo ciudadano",
  },
];

export default function ReportCard({ reporte, modoDetalle = false }) {
  const navigate = useNavigate();

  const usuarioActual = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("reportard_user") || "{}",
      );
    } catch {
      return {};
    }
  })();

  const idModeracion = `report-${reporte.id ?? `${reporte.autor}-${reporte.tiempo}`
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
        silenciados.includes(reporte.autor) ||
        bloqueados.includes(reporte.autor)
      );
    } catch {
      return false;
    }
  });

  const eliminarContenido = async () => {
    if (!reporte.id) {
      throw new Error(
        "No se encontró el identificador del reporte.",
      );
    }

    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token) {
      throw new Error(
        "Tu sesión expiró. Inicia sesión nuevamente.",
      );
    }

    await eliminarReporte(token, reporte.id);

    setOculto(true);

    window.dispatchEvent(
      new CustomEvent("reportard_report_deleted", {
        detail: {
          reporteId: reporte.id,
        },
      }),
    );
  };

  const esPropio = (() => {
    try {
      const usuarioActual = JSON.parse(
        localStorage.getItem("reportard_user") || "{}",
      );

      const miId = String(
        usuarioActual._id ||
        usuarioActual.id ||
        "",
      );

      const autorId = String(
        reporte.autorId || "",
      );

      return Boolean(
        miId &&
        autorId &&
        miId === autorId
      );
    } catch {
      return false;
    }
  })();

  const abrirPerfil = () => {
    if (esPropio) {
      navigate("/perfil");
      return;
    }

    if (reporte.autorId) {
      navigate(`/usuario/${reporte.autorId}`);
    }
  };

  const abrirDetalle = () => {
    if (modoDetalle) return;

    const seleccion = {
      tipo: "reporte",
      datos: reporte,
    };

    localStorage.setItem(
      "reportard_selected_content",
      JSON.stringify(seleccion),
    );

    navigate(`/reporte/${reporte.id ?? "actual"}`, {
      state: seleccion,
    });
  };
  const claveReporte = useMemo(
    () =>
      `reportard_report_${reporte.id ?? `${reporte.autor}_${reporte.tiempo}`
      }`,
    [reporte],
  );

  const estadoGuardado = useMemo(() => {
    try {
      const datos = localStorage.getItem(claveReporte);

      return datos ? JSON.parse(datos) : {};
    } catch {
      return {};
    }
  }, [claveReporte]);

  const [confirmado, setConfirmado] = useState(
    estadoGuardado.confirmado ?? false,
  );

  const [totalConfirmaciones, setTotalConfirmaciones] =
    useState(reporte.confirmaciones ?? 0);

  const [confirmando, setConfirmando] =
    useState(false);



  const [guardado, setGuardado] = useState(
    estadoGuardado.guardado ?? false,
  );

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
    useState(estadoGuardado.compartidosLocales ?? 0);

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
    useState(reporte.reacciones ?? 0);

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
      claveReporte,
      JSON.stringify({
        confirmado,
        guardado,
        compartidosLocales,
      }),
    );
  }, [
    claveReporte,
    confirmado,
    guardado,
    compartidosLocales,
  ]);

  useEffect(() => {
    const actualizarModeracion = (evento) => {
      const { accion, contenidoId, autor } = evento.detail || {};

      if (
        contenidoId === idModeracion ||
        (["silenciar", "bloquear"].includes(accion) &&
          autor === reporte.autor)
      ) {
        setOculto(true);
      }
    };

    window.addEventListener(
      "reportard_moderation_changed",
      actualizarModeracion,
    );

    return () =>
      window.removeEventListener(
        "reportard_moderation_changed",
        actualizarModeracion,
      );
  }, [idModeracion, reporte.autor]);


  useEffect(() => {
    const cargarReacciones = async () => {
      const token =
        localStorage.getItem("reportard_token") || "";

      if (!token || !reporte.id) return;

      try {
        setCargandoReacciones(true);
        setErrorReacciones("");

        const respuesta = await obtenerReacciones(
          token,
          "report",
          reporte.id,
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
  }, [reporte.id]);


  const seleccionarReaccion = async (tipoReaccion) => {
    if (reaccionando) return;

    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token || !reporte.id) {
      setErrorReacciones(
        "No se pudo identificar la sesión o el reporte.",
      );
      return;
    }

    try {
      setReaccionando(true);
      setErrorReacciones("");

      const respuesta = await reaccionarContenido(
        token,
        "report",
        reporte.id,
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

  const cambiarConfirmacion = async () => {
    if (esPropio || confirmando) {
      return;
    }

    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token) {
      alert(
        "Tu sesión expiró. Inicia sesión nuevamente."
      );
      return;
    }

    if (!reporte.id) {
      alert(
        "No se encontró el identificador del reporte."
      );
      return;
    }

    try {
      setConfirmando(true);

      const respuesta = await confirmarReporte(
        token,
        reporte.id
      );

      setConfirmado(respuesta.confirmado);

      setTotalConfirmaciones(
        respuesta.confirmaciones
      );
    } catch (error) {
      alert(
        error.message ||
        "No se pudo actualizar la confirmación."
      );
    } finally {
      setConfirmando(false);
    }
  };

 const totalComentarios =
  comentariosCargados
    ? comentarios.length
    : reporte.comentarios ?? 0;

  const totalCompartidos =
    (reporte.compartidos ?? 0) + compartidosLocales;

  const reaccionActiva = REACCIONES_REPORTE.find(
    (reaccion) => reaccion.id === miReaccion,
  );

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

    if (!token || !reporte.id) return;

    try {
      setCargandoComentarios(true);
      setErrorComentarios("");

      const respuesta = await listarComentarios(
        token,
        "report",
        reporte.id,
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
  }, [mostrarComentarios, reporte.id]);

  const agregarComentario = async (evento) => {
    evento.preventDefault();

    const contenido = nuevoComentario.trim();

    if (!contenido || enviandoComentario) return;

    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token || !reporte.id) {
      setErrorComentarios(
        "No se pudo identificar la sesión o el reporte.",
      );
      return;
    }

    try {
      setEnviandoComentario(true);
      setErrorComentarios("");

      const respuesta = await crearComentario(
        token,
        "report",
        reporte.id,
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

    if (!token || !reporte.id) {
      setErrorComentarios(
        "No se pudo identificar la sesión o el reporte.",
      );
      return;
    }

    try {
      setEnviandoRespuesta(true);
      setErrorComentarios("");

      const respuesta = await crearComentario(
        token,
        "report",
        reporte.id,
        contenido,
        comentarioId,
      );

      const respuestaNueva = convertirComentario(
        respuesta.comentario,
      );

      setComentarios((actuales) =>
        actuales.map((comentario) => {
          if (
            String(comentario.id) !==
            String(comentarioId)
          ) {
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

  const compartirReporte = async () => {
    const datosCompartir = {
      title: reporte.titulo,
      text: `${reporte.titulo} — ${reporte.ubicacion}`,
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

  if (oculto) return null;

  return (
    <article className="group/card overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.025] shadow-xl shadow-black/10 transition duration-300 hover:border-white/[0.16]">
      <header className="flex items-start gap-3 border-b border-white/[0.035] p-4">
        <button
          type="button"
          onClick={abrirPerfil}
          aria-label={`Abrir perfil de ${reporte.autor}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/10 bg-gradient-to-br from-blue-500 to-red-500 font-bold text-white shadow-lg shadow-red-500/15 transition hover:scale-105 active:scale-95"
        >
          {reporte.iniciales}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={abrirPerfil}
              className="truncate text-left font-semibold text-white hover:underline"
            >
              {reporte.autor}
            </button>

            {reporte.verificado && (
              <CheckCircle2
                size={16}
                className="shrink-0 text-blue-400"
                fill="currentColor"
                strokeWidth={3}
              />
            )}
          </div>

          <p className="truncate text-xs text-slate-400">
            {reporte.comunidad} · {reporte.tiempo}
          </p>
        </div>

        <ContentOptions
          contenidoId={idModeracion}
          autor={reporte.autor}
          tipo="reporte"
          esPropio={esPropio}
          onOcultar={() => setOculto(true)}
          onEliminar={eliminarContenido}
          onEditar={() =>
            navigate(`/reportar?editar=${reporte.id ?? "actual"}`)
          }
        />
      </header>

      <div className="px-4 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">
            {reporte.categoria}
          </span>

          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400">
            {reporte.estado}
          </span>
        </div>

        <h3
          onClick={abrirDetalle}
          className={`mt-4 text-lg font-bold text-white ${modoDetalle ? "" : "cursor-pointer hover:text-red-300"
            }`}
        >
          {reporte.titulo}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          {reporte.descripcion}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={15} className="text-red-400" />
          <span>{reporte.ubicacion}</span>
        </div>
      </div>

      {reporte.mediaUrl ? (
        <div className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg shadow-black/20">
          {reporte.mediaTipo === "video" ? (
            <video
              src={reporte.mediaUrl}
              poster={reporte.mediaPoster}
              controls
              playsInline
              preload="metadata"
              className="max-h-80 w-full bg-black object-cover"
            />
          ) : (
            <img
              src={reporte.mediaUrl}
              alt={
                reporte.mediaAlt ||
                `Evidencia del reporte: ${reporte.titulo}`
              }
              loading="lazy"
              onClick={abrirDetalle}
              className="h-56 w-full object-cover transition duration-500 hover:scale-[1.02]"
            />
          )}
        </div>
      ) : (
        <div className="relative mx-4 flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#64748b_1px,transparent_1px),linear-gradient(90deg,#64748b_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="relative flex flex-col items-center text-slate-500">
            <Construction size={45} />

            <span className="mt-2 text-xs">
              Fotografía del reporte
            </span>
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
                  ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
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
                    ¿Qué te genera este reporte?
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Selecciona una reacción ciudadana
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {REACCIONES_REPORTE.map((reaccion) => {
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
                            ? "border-blue-400/40 bg-blue-500/15"
                            : "border-white/5 bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.07]"
                          }`}
                      >
                        <span className="text-3xl transition duration-200 group-hover:scale-125">
                          {reaccion.emoji}
                        </span>

                        <span
                          className={`mt-1 text-center text-[10px] leading-tight ${seleccionada
                              ? "font-semibold text-blue-300"
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

          <div className="flex items-center gap-2 text-xs text-slate-400">
            {totalReacciones > 0 && (
              <>
                <div className="flex -space-x-1">
                  {REACCIONES_REPORTE
                    .filter(
                      (reaccion) =>
                        (resumenReacciones[reaccion.id] || 0) >
                        0,
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
              </>
            )}
          </div>
        </div>

        {errorReacciones && (
          <p className="mt-2 text-xs text-red-400">
            {errorReacciones}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex -space-x-1">
            <span className="h-5 w-5 rounded-full border-2 border-[#0b1626] bg-red-500" />
            <span className="h-5 w-5 rounded-full border-2 border-[#0b1626] bg-blue-500" />
            <span className="h-5 w-5 rounded-full border-2 border-[#0b1626] bg-green-500" />
          </span>

          <span>
            {totalConfirmaciones} confirmaciones
          </span>
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
        {!esPropio ? (
          <button
            type="button"
            onClick={cambiarConfirmacion}
            disabled={confirmando}
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${confirmado
              ? "bg-red-500/10 text-red-400"
              : "text-slate-400 hover:bg-white/5"
              } ${confirmando ? "cursor-wait opacity-70" : ""}`}
          >
            <CheckCircle2
              size={21}
              fill={confirmado ? "currentColor" : "none"}
            />

            {confirmando
              ? "Actualizando..."
              : confirmado
                ? "Confirmado"
                : "Confirmar"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs text-slate-600">
            <CheckCircle2 size={21} />
            Tu reporte
          </div>
        )}

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
          onClick={compartirReporte}
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

     <CommentsPanel
  abierto={mostrarComentarios}
  onCerrar={() =>
    setMostrarComentarios(false)
  }
  comentarios={comentarios}
  cargando={
    cargandoComentarios &&
    !comentariosCargados
  }
  error={errorComentarios}
  usuarioActual={usuarioActual}
  nuevoComentario={nuevoComentario}
  setNuevoComentario={
    setNuevoComentario
  }
  enviandoComentario={
    enviandoComentario
  }
  onEnviarComentario={
    agregarComentario
  }
  comentarioRespondiendo={
    comentarioRespondiendo
  }
  setComentarioRespondiendo={
    setComentarioRespondiendo
  }
  nuevaRespuesta={nuevaRespuesta}
  setNuevaRespuesta={
    setNuevaRespuesta
  }
  enviandoRespuesta={
    enviandoRespuesta
  }
  onEnviarRespuesta={
    agregarRespuesta
  }
  onAbrirPerfil={
    abrirPerfilComentario
  }
  obtenerIniciales={
    obtenerIniciales
  }
  totalComentarios={
    totalComentarios
  }
/>
    </article>
  );
}
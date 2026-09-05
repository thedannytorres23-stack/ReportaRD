import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCheck,
  ChevronDown,
  LoaderCircle,
  MessageCircle,
  Reply,
  Search,
  Send,
  Smile,
  Users,
  UserRoundSearch,
  X,
} from "lucide-react";

import { useNavigate } from "react-router";

import {
  enviarMensaje as enviarMensajeApi,
  listarConversaciones,
  marcarMensajesComoLeidos,
  obtenerConversacion,
} from "../services/chatService";

import {
  conectarSocket,
} from "../services/socketService";

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "🥰",
  "😎",
  "🤔",
  "😅",
  "😮",
  "😢",
  "😭",
  "😡",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🤝",
  "🙏",
  "💪",
  "❤️",
  "🔥",
  "✨",
  "💡",
  "📢",
  "✅",
  "⚠️",
  "🇩🇴",
  "🏙️",
];

const obtenerSesion = () => {
  try {
    return {
      token:
        localStorage.getItem(
          "reportard_token",
        ) || "",

      usuario: JSON.parse(
        localStorage.getItem(
          "reportard_user",
        ) || "null",
      ),
    };
  } catch {
    return {
      token: "",
      usuario: null,
    };
  }
};

const obtenerIniciales = (
  nombre = "",
) =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) =>
      palabra[0]?.toUpperCase(),
    )
    .join("") || "RD";

const formatearHora = (fecha) => {
  if (!fecha) return "";

  return new Intl.DateTimeFormat(
    "es-DO",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(fecha));
};

const obtenerClaveDia = (fecha) => {
  if (!fecha) return "";

  const valor = new Date(fecha);

  return [
    valor.getFullYear(),
    valor.getMonth(),
    valor.getDate(),
  ].join("-");
};

const formatearDiaConversacion = (
  fecha,
) => {
  if (!fecha) return "";

  const fechaMensaje =
    new Date(fecha);

  const hoy = new Date();

  const ayer = new Date();
  ayer.setDate(
    ayer.getDate() - 1,
  );

  const claveMensaje =
    obtenerClaveDia(
      fechaMensaje,
    );

  if (
    claveMensaje ===
    obtenerClaveDia(hoy)
  ) {
    return "Hoy";
  }

  if (
    claveMensaje ===
    obtenerClaveDia(ayer)
  ) {
    return "Ayer";
  }

  return new Intl.DateTimeFormat(
    "es-DO",
    {
      day: "numeric",
      month: "long",
      year:
        fechaMensaje.getFullYear() !==
          hoy.getFullYear()
          ? "numeric"
          : undefined,
    },
  ).format(fechaMensaje);
};

const obtenerDatosConversacion = (
  conversacion,
  miUsuarioId,
) => {
  if (
    conversacion.tipo ===
    "grupo"
  ) {
    return {
      nombre:
        conversacion.nombre,

      foto:
        conversacion.foto,

      iniciales:
        obtenerIniciales(
          conversacion.nombre,
        ),

      activo: false,

      estado:
        `Grupo · ${conversacion.participantes.length} miembros`,
    };
  }

  const otraPersona =
    conversacion.participantes.find(
      (persona) =>
        persona._id !==
        miUsuarioId,
    );

  const nombre =
    otraPersona?.nombre ||
    "Usuario de ReportaRD";

  return {
    nombre,

    foto:
      otraPersona?.foto ||
      "",

    iniciales:
      obtenerIniciales(nombre),

    activo:
      Boolean(
        otraPersona?.activo,
      ),

    estado:
      otraPersona?.activo
        ? "En línea"
        : "Desconectado",
  };
};

const agregarSinDuplicar = (
  mensajes,
  nuevoMensaje,
) => {
  if (
    mensajes.some(
      (mensaje) =>
        mensaje._id ===
        nuevoMensaje._id,
    )
  ) {
    return mensajes;
  }

  return [
    ...mensajes,
    nuevoMensaje,
  ];
};

export default function Messages() {
  const navigate =
    useNavigate();

  const finalChatRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  const emojiPanelRef =
    useRef(null);

  const temporizadorEscrituraRef =
    useRef(null);

  const conversacionActivaRef =
    useRef(null);

  const mensajesRefs =
    useRef(new Map());

  const temporizadorDestacadoRef =
    useRef(null);

  const [sesion] =
    useState(() =>
      obtenerSesion(),
    );

  const [
    mensajeRespondido,
    setMensajeRespondido,
  ] = useState(null);

  const [
    mensajeDestacado,
    setMensajeDestacado,
  ] = useState(null);

  const {
    token,
    usuario,
  } = sesion;

  const miUsuarioId =
    usuario?._id ||
    usuario?.id ||
    "";

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    conversaciones,
    setConversaciones,
  ] = useState([]);

  const [
    conversacionActiva,
    setConversacionActiva,
  ] = useState(null);

  const [
    mensajes,
    setMensajes,
  ] = useState([]);

  const [
    nuevoMensaje,
    setNuevoMensaje,
  ] = useState("");

  const [
    usuarioEscribiendo,
    setUsuarioEscribiendo,
  ] = useState("");

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    cargandoChat,
    setCargandoChat,
  ] = useState(false);

  const [
    enviando,
    setEnviando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    mostrarEmojis,
    setMostrarEmojis,
  ] = useState(false);

  const conversacionesVisibles =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      if (!texto) {
        return conversaciones;
      }

      return conversaciones.filter(
        (conversacion) => {
          const datos =
            obtenerDatosConversacion(
              conversacion,
              miUsuarioId,
            );

          const ultimoMensaje =
            conversacion
              .ultimoMensaje
              ?.contenido || "";

          return [
            datos.nombre,
            ultimoMensaje,
          ].some((valor) =>
            valor
              .toLowerCase()
              .includes(texto),
          );
        },
      );
    }, [
      busqueda,
      conversaciones,
      miUsuarioId,
    ]);

  useEffect(() => {
    if (!token) {
      navigate(
        "/login",
        {
          replace: true,
        },
      );

      return undefined;
    }

    let activo = true;

    const cargarConversaciones =
      async () => {
        try {
          setCargando(true);
          setError("");

          const datos =
            await listarConversaciones(
              token,
            );

          if (activo) {
            setConversaciones(
              datos.conversaciones ||
              [],
            );
          }
        } catch (
        errorSolicitud
        ) {
          if (activo) {
            setError(
              errorSolicitud.message,
            );
          }
        } finally {
          if (activo) {
            setCargando(false);
          }
        }
      };

    cargarConversaciones();

    const socket =
      conectarSocket(token);

    const recibirMensaje = ({
      conversacionId,
      mensaje,
    }) => {
      setConversaciones(
        (actuales) =>
          actuales
            .map(
              (
                conversacion,
              ) =>
                conversacion._id ===
                  conversacionId
                  ? {
                    ...conversacion,

                    ultimoMensaje:
                      mensaje,

                    updatedAt:
                      mensaje.createdAt,
                  }
                  : conversacion,
            )
            .sort(
              (a, b) =>
                new Date(
                  b.updatedAt,
                ) -
                new Date(
                  a.updatedAt,
                ),
            ),
      );

      if (
        conversacionActivaRef
          .current?._id ===
        conversacionId
      ) {
        setMensajes(
          (actuales) =>
            agregarSinDuplicar(
              actuales,
              mensaje,
            ),
        );

        marcarMensajesComoLeidos(
          conversacionId,
          token,
        )
          .then(() => {
            window.dispatchEvent(
              new CustomEvent(
                "reportard:mensajes-leidos",
              ),
            );
          })
          .catch(() => { });
      }
    };

    const recibirEscritura = ({
      conversacionId,
      usuarioId,
      nombre,
      escribiendo,
    }) => {
      if (
        usuarioId ===
        miUsuarioId
      ) {
        return;
      }

      if (
        conversacionActivaRef
          .current?._id ===
        conversacionId
      ) {
        setUsuarioEscribiendo(
          escribiendo
            ? nombre
            : "",
        );
      }
    };

    const actualizarEstado = ({
      usuarioId,
      activo: estaActivo,
    }) => {
      setConversaciones(
        (actuales) =>
          actuales.map(
            (conversacion) => ({
              ...conversacion,

              participantes:
                conversacion.participantes.map(
                  (persona) =>
                    persona._id ===
                      usuarioId
                      ? {
                        ...persona,
                        activo:
                          estaActivo,
                      }
                      : persona,
                ),
            }),
          ),
      );

      setConversacionActiva(
        (actual) => {
          if (!actual) {
            return actual;
          }

          return {
            ...actual,

            participantes:
              actual.participantes.map(
                (persona) =>
                  persona._id ===
                    usuarioId
                    ? {
                      ...persona,
                      activo:
                        estaActivo,
                    }
                    : persona,
              ),
          };
        },
      );

      if (
        conversacionActivaRef
          .current
      ) {
        conversacionActivaRef.current =
        {
          ...conversacionActivaRef
            .current,

          participantes:
            conversacionActivaRef
              .current
              .participantes.map(
                (persona) =>
                  persona._id ===
                    usuarioId
                    ? {
                      ...persona,
                      activo:
                        estaActivo,
                    }
                    : persona,
              ),
        };
      }
    };

    const manejarErrorSocket = (
      errorSocket,
    ) => {
      setError(
        errorSocket.message ||
        "No se pudo conectar al chat.",
      );
    };

    socket?.on(
      "mensaje:nuevo",
      recibirMensaje,
    );

    socket?.on(
      "mensaje:escribiendo",
      recibirEscritura,
    );

    socket?.on(
      "usuario:estado",
      actualizarEstado,
    );

    socket?.on(
      "connect_error",
      manejarErrorSocket,
    );

    return () => {
      activo = false;

      socket?.off(
        "mensaje:nuevo",
        recibirMensaje,
      );

      socket?.off(
        "mensaje:escribiendo",
        recibirEscritura,
      );

      socket?.off(
        "usuario:estado",
        actualizarEstado,
      );

      socket?.off(
        "connect_error",
        manejarErrorSocket,
      );

      window.clearTimeout(
        temporizadorEscrituraRef.current,
      );

      window.clearTimeout(
        temporizadorDestacadoRef.current,
      );
    };
  }, [
    miUsuarioId,
    navigate,
    token,
  ]);

  useEffect(() => {
    finalChatRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [
    mensajes.length,
    usuarioEscribiendo,
  ]);

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) return;

    textarea.style.height =
      "auto";

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        96,
      )}px`;
  }, [nuevoMensaje]);

  useEffect(() => {
    if (!mostrarEmojis) {
      return undefined;
    }

    const cerrarAlHacerClickFuera =
      (evento) => {
        if (
          emojiPanelRef.current &&
          !emojiPanelRef.current
            .contains(
              evento.target,
            )
        ) {
          setMostrarEmojis(
            false,
          );
        }
      };

    const cerrarConEscape = (
      evento,
    ) => {
      if (
        evento.key ===
        "Escape"
      ) {
        if (mostrarEmojis) {
          setMostrarEmojis(
            false,
          );
          return;
        }

        if (mensajeRespondido) {
          setMensajeRespondido(
            null,
          );
        }
      }
    };

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClickFuera,
    );

    window.addEventListener(
      "keydown",
      cerrarConEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClickFuera,
      );

      window.removeEventListener(
        "keydown",
        cerrarConEscape,
      );
    };
  }, [
    mostrarEmojis,
    mensajeRespondido,
  ]);

  const abrirConversacion =
    async (conversacion) => {
      try {
        setCargandoChat(true);
        setError("");
        setMostrarEmojis(false);

        setConversacionActiva(
          conversacion,
        );

        conversacionActivaRef.current =
          conversacion;

        setMensajes([]);
        setUsuarioEscribiendo("");
        setMensajeRespondido(null);
        setMensajeDestacado(null);

        const socket =
          conectarSocket(token);

        socket?.emit(
          "conversacion:entrar",
          conversacion._id,
        );

        const datos =
          await obtenerConversacion(
            conversacion._id,
            token,
          );

        setConversacionActiva(
          datos.conversacion,
        );

        conversacionActivaRef.current =
          datos.conversacion;

        setMensajes(
          datos.mensajes || [],
        );

        await marcarMensajesComoLeidos(
          conversacion._id,
          token,
        );

        window.dispatchEvent(
          new CustomEvent(
            "reportard:mensajes-leidos",
          ),
        );
      } catch (
      errorSolicitud
      ) {
        setError(
          errorSolicitud.message,
        );

        setConversacionActiva(
          null,
        );

        conversacionActivaRef.current =
          null;
      } finally {
        setCargandoChat(false);
      }
    };

  const cerrarConversacion = () => {
    if (conversacionActiva) {
      conectarSocket(token)?.emit(
        "conversacion:salir",
        conversacionActiva._id,
      );
    }

    setMostrarEmojis(false);

    setConversacionActiva(
      null,
    );

    conversacionActivaRef.current =
      null;

    setMensajes([]);
    setUsuarioEscribiendo("");
    setMensajeRespondido(null);
    setMensajeDestacado(null);
  };

  const notificarEscritura = (
    valor,
  ) => {
    setNuevoMensaje(valor);

    if (!conversacionActiva) {
      return;
    }

    const socket =
      conectarSocket(token);

    socket?.emit(
      "mensaje:escribiendo",
      {
        conversacionId:
          conversacionActiva._id,

        escribiendo:
          Boolean(
            valor.trim(),
          ),
      },
    );

    window.clearTimeout(
      temporizadorEscrituraRef.current,
    );

    temporizadorEscrituraRef.current =
      window.setTimeout(() => {
        socket?.emit(
          "mensaje:escribiendo",
          {
            conversacionId:
              conversacionActiva._id,

            escribiendo: false,
          },
        );
      }, 1200);
  };

  const agregarEmoji = (
    emoji,
  ) => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      notificarEscritura(
        `${nuevoMensaje}${emoji}`,
      );

      return;
    }

    const inicio =
      textarea.selectionStart ??
      nuevoMensaje.length;

    const final =
      textarea.selectionEnd ??
      nuevoMensaje.length;

    const nuevoValor =
      nuevoMensaje.slice(
        0,
        inicio,
      ) +
      emoji +
      nuevoMensaje.slice(
        final,
      );

    notificarEscritura(
      nuevoValor,
    );

    window.requestAnimationFrame(
      () => {
        textarea.focus();

        const nuevaPosicion =
          inicio +
          emoji.length;

        textarea.setSelectionRange(
          nuevaPosicion,
          nuevaPosicion,
        );
      },
    );
  };

  const responderAMensaje = (
    mensaje,
  ) => {
    setMensajeRespondido(
      mensaje,
    );

    setMostrarEmojis(false);

    window.requestAnimationFrame(
      () => {
        textareaRef.current?.focus();
      },
    );
  };

  const irAMensajeOriginal = (
    mensajeId,
  ) => {
    if (!mensajeId) return;

    const elemento =
      mensajesRefs.current.get(
        String(mensajeId),
      );

    if (!elemento) {
      setError(
        "Ese mensaje no está cargado en esta parte de la conversación.",
      );

      return;
    }

    elemento.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setMensajeDestacado(
      String(mensajeId),
    );

    window.clearTimeout(
      temporizadorDestacadoRef.current,
    );

    temporizadorDestacadoRef.current =
      window.setTimeout(() => {
        setMensajeDestacado(
          null,
        );
      }, 1800);
  };

  const enviarMensaje =
    async () => {
      const contenido =
        nuevoMensaje.trim();

      if (
        !contenido ||
        !conversacionActiva ||
        enviando
      ) {
        return;
      }

      try {
        setEnviando(true);
        setError("");
        setMostrarEmojis(false);
        setNuevoMensaje("");

        conectarSocket(token)?.emit(
          "mensaje:escribiendo",
          {
            conversacionId:
              conversacionActiva._id,

            escribiendo: false,
          },
        );

        const respuesta =
          await enviarMensajeApi(
            conversacionActiva._id,
            contenido,
            token,
            mensajeRespondido?._id || null,
          );



        setMensajes(
          (actuales) =>
            agregarSinDuplicar(
              actuales,
              respuesta.datos,
            ),
        );

        setMensajeRespondido(null);

        setConversaciones(
          (actuales) =>
            actuales
              .map(
                (
                  conversacion,
                ) =>
                  conversacion._id ===
                    conversacionActiva._id
                    ? {
                      ...conversacion,

                      ultimoMensaje:
                        respuesta.datos,

                      updatedAt:
                        respuesta
                          .datos
                          .createdAt,
                    }
                    : conversacion,
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.updatedAt,
                  ) -
                  new Date(
                    a.updatedAt,
                  ),
              ),
        );
      } catch (
      errorSolicitud
      ) {
        setNuevoMensaje(
          contenido,
        );

        setError(
          errorSolicitud.message,
        );
      } finally {
        setEnviando(false);
      }
    };

  if (conversacionActiva) {
    const datosConversacion =
      obtenerDatosConversacion(
        conversacionActiva,
        miUsuarioId,
      );

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div
          className="
            mx-auto flex min-h-screen
            max-w-md flex-col
            border-x border-white/[0.06]
            bg-[#06101f]
          "
        >
          <div
            className="
              h-[2px] shrink-0
              bg-gradient-to-r
              from-red-500
              via-orange-400
              to-slate-700
            "
          />

          <header
            className="
              sticky top-0 z-30
              flex items-center gap-3
              border-b
              border-white/[0.065]
              bg-[#06101f]/95
              px-4 py-3
              shadow-[0_12px_35px_rgba(0,0,0,.10)]
              backdrop-blur-xl
            "
          >
            <button
              type="button"
              onClick={
                cerrarConversacion
              }
              aria-label="Volver a conversaciones"
              className="
                rounded-xl p-2
                text-slate-500
                transition
                hover:bg-white/5
                hover:text-slate-100
                active:scale-95
              "
            >
              <ArrowLeft
                size={21}
              />
            </button>

            <Avatar
              datos={
                datosConversacion
              }
              grande
            />

            <div
              className="
                min-w-0 flex-1
              "
            >
              <span
                className="
                  mb-0.5
                  flex items-center
                  gap-1.5
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.19em]
                  text-slate-700
                "
              >
                <span
                  className="
                    h-1 w-1
                    rounded-full
                    bg-red-500
                  "
                />

                Conversación ciudadana
              </span>

              <h1
                className="
                  truncate
                  text-[14px]
                  font-semibold
                  text-slate-100
                "
              >
                {
                  datosConversacion.nombre
                }
              </h1>

              <p
                className={`
                  mt-0.5 truncate
                  text-[10px]
                  font-medium

                  ${usuarioEscribiendo ||
                    datosConversacion.activo
                    ? "text-emerald-400"
                    : "text-slate-600"
                  }
                `}
              >
                {usuarioEscribiendo
                  ? `${usuarioEscribiendo} está escribiendo...`
                  : datosConversacion.estado}
              </p>
            </div>

            {conversacionActiva.tipo ===
              "grupo" && (
                <span
                  className="
                  flex h-9 w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-violet-400/10
                  bg-violet-500/10
                  text-violet-400
                "
                >
                  <Users
                    size={18}
                  />
                </span>
              )}
          </header>

          {error && (
            <AvisoError
              mensaje={error}
            />
          )}

          <main
            className="
              chat-background
              reportard-chat-scrollbar
              flex-1
              overflow-y-auto
              px-4 py-5
            "
          >
            {cargandoChat ? (
              <EstadoCargando
                texto="Cargando conversación..."
              />
            ) : (
              mensajes.map(
                (
                  mensaje,
                  indice,
                ) => {
                  const esMio =
                    mensaje.autor
                      ?._id ===
                    miUsuarioId;

                  const mensajeAnterior =
                    mensajes[
                    indice - 1
                    ];

                  const mostrarSeparador =
                    !mensajeAnterior ||
                    obtenerClaveDia(
                      mensajeAnterior
                        .createdAt,
                    ) !==
                    obtenerClaveDia(
                      mensaje.createdAt,
                    );

                  return (
                    <div
                      key={
                        mensaje._id
                      }
                      ref={(elemento) => {
                        const id =
                          String(
                            mensaje._id,
                          );

                        if (elemento) {
                          mensajesRefs.current.set(
                            id,
                            elemento,
                          );
                        } else {
                          mensajesRefs.current.delete(
                            id,
                          );
                        }
                      }}
                      className={`
                        rounded-2xl
                        transition-all
                        duration-500

                        ${mensajeDestacado ===
                        String(
                          mensaje._id,
                        )
                          ? "bg-sky-400/[0.055] ring-1 ring-sky-300/15"
                          : ""
                        }
                      `}
                    >
                      {mostrarSeparador && (
                        <SeparadorFecha
                          fecha={
                            mensaje.createdAt
                          }
                        />
                      )}

                      <div
                        style={{
                          animationDelay:
                            `${Math.min(
                              indice * 25,
                              200,
                            )}ms`,
                        }}
                        className={`
                          message-enter
                          mb-3 flex w-full

                          ${esMio
                            ? "justify-end"
                            : "justify-start"
                          }
                        `}
                      >
                        <div
                          className={`
                            group/message
                            flex max-w-[84%]
                            flex-col

                            ${esMio
                              ? "items-end"
                              : "items-start"
                            }
                          `}
                        >
                          <div
                            className={`
                              w-fit max-w-full
                              px-3.5 py-2.5
                              text-sm

                              ${esMio
                                ? `
                                    rounded-[18px]
                                    rounded-br-[5px]
                                    border
                                    border-blue-300/[0.10]
                                    bg-[#14324a]
                                    text-slate-100
                                    shadow-[0_8px_24px_rgba(0,0,0,.16)]
                                  `
                                : `
                                    rounded-[18px]
                                    rounded-bl-[5px]
                                    border
                                    border-white/[0.055]
                                    bg-[#0d1928]
                                    text-slate-200
                                    shadow-[0_8px_24px_rgba(0,0,0,.11)]
                                  `
                              }
                            `}
                          >
                            {conversacionActiva.tipo ===
                              "grupo" &&
                              !esMio && (
                                <p
                                  className="
                                    mb-1
                                    text-[10px]
                                    font-semibold
                                    text-violet-400
                                  "
                                >
                                  {
                                    mensaje.autor
                                      ?.nombre
                                  }
                                </p>
                              )}

                            {mensaje.respondeA && (
                              <button
                                type="button"
                                onClick={() =>
                                  irAMensajeOriginal(
                                    mensaje
                                      .respondeA
                                      ?._id,
                                  )
                                }
                                className={`
                                  mb-2 block w-full
                                  rounded-xl
                                  border-l-2
                                  px-3 py-2
                                  text-left
                                  transition

                                  ${esMio
                                    ? `
                                        border-sky-300/45
                                        bg-black/[0.14]
                                        hover:bg-black/[0.22]
                                      `
                                    : `
                                        border-slate-400/45
                                        bg-black/[0.12]
                                        hover:bg-white/[0.045]
                                      `
                                  }
                                `}
                                title="Ir al mensaje original"
                              >
                                <span
                                  className="
                                    block truncate
                                    text-[10px]
                                    font-semibold
                                    text-sky-300/80
                                  "
                                >
                                  {
                                    mensaje
                                      .respondeA
                                      .autor
                                      ?.nombre ||
                                    "Usuario"
                                  }
                                </span>

                                <span
                                  className="
                                    mt-0.5
                                    block
                                    line-clamp-2
                                    text-[11px]
                                    leading-4
                                    text-slate-400
                                  "
                                >
                                  {
                                    mensaje
                                      .respondeA
                                      .contenido ||
                                    "Mensaje"
                                  }
                                </span>
                              </button>
                            )}

                            <p
                              className="
                                whitespace-pre-wrap
                                break-words
                                text-[14px]
                                leading-[1.45rem]
                              "
                            >
                              {
                                mensaje.contenido
                              }
                            </p>

                            <div
                              className={`
                                mt-1
                                flex items-center
                                justify-end
                                gap-1
                                text-[9px]

                                ${esMio
                                  ? "text-slate-400"
                                  : "text-slate-600"
                                }
                              `}
                            >
                              {formatearHora(
                                mensaje.createdAt,
                              )}

                              {esMio && (
                                <CheckCheck
                                  size={12}
                                />
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              responderAMensaje(
                                mensaje,
                              )
                            }
                            className={`
                              mt-1.5 flex
                              items-center gap-1.5
                              rounded-xl
                              border px-2.5 py-1.5
                              text-[11px]
                              font-semibold
                              transition
                              duration-200
                              active:scale-95
                              focus-visible:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-sky-400/20

                              ${mensajeRespondido?._id ===
                                mensaje._id
                                ? `
                                    border-sky-400/25
                                    bg-sky-400/10
                                    text-sky-300
                                  `
                                : `
                                    border-white/[0.07]
                                    bg-[#0a1726]/90
                                    text-slate-400
                                    hover:border-sky-400/20
                                    hover:bg-sky-400/[0.07]
                                    hover:text-sky-300
                                  `
                              }
                            `}
                            aria-label={`Responder a ${mensaje.autor?.nombre || "este mensaje"}`}
                          >
                            <Reply
                              size={13}
                              strokeWidth={2.2}
                            />

                            Responder
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                },
              )
            )}

            {usuarioEscribiendo && (
              <div
                className="
                  mb-2 flex
                  justify-start
                "
              >
                <div
                  className="
                    flex gap-1
                    rounded-[18px]
                    rounded-bl-[5px]
                    border
                    border-white/[0.05]
                    bg-[#0d1928]
                    px-4 py-3.5
                  "
                >
                  {[0, 1, 2].map(
                    (punto) => (
                      <span
                        key={
                          punto
                        }
                        style={{
                          animationDelay:
                            `${punto * 160}ms`,
                        }}
                        className="
                          typing-dot
                          h-1.5 w-1.5
                          rounded-full
                          bg-slate-400
                        "
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            <div
              ref={finalChatRef}
            />
          </main>

          <footer
            className="
              sticky bottom-0
              z-30
              border-t
              border-white/[0.065]
              bg-[#06101f]/95
              px-3 pb-4 pt-3
              shadow-[0_-12px_35px_rgba(0,0,0,.10)]
              backdrop-blur-xl
            "
          >
            {mensajeRespondido && (
              <div
                className="
                  reply-preview-enter
                  mb-2.5 flex
                  items-center
                  justify-between
                  gap-3
                  rounded-2xl
                  border
                  border-sky-300/[0.16]
                  bg-[#0a1b2d]
                  px-3 py-2.5
                  shadow-[0_8px_26px_rgba(0,0,0,.12)]
                "
              >
                <div
                  className="
                    min-w-0 flex-1
                    border-l-2
                    border-sky-400/40
                    pl-3
                  "
                >
                  <div
                    className="
                      flex items-center
                      gap-1.5
                    "
                  >
                    <Reply
                      size={11}
                      className="
                        text-sky-400
                      "
                    />

                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-sky-300/80
                      "
                    >
                      Respondiendo a {
                        mensajeRespondido
                          .autor
                          ?.nombre ||
                        "Usuario"
                      }
                    </p>
                  </div>

                  <p
                    className="
                      mt-1 truncate
                      text-[11px]
                      text-slate-500
                    "
                  >
                    {
                      mensajeRespondido
                        .contenido ||
                      "Mensaje"
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMensajeRespondido(
                      null,
                    );

                    textareaRef.current?.focus();
                  }}
                  aria-label="Cancelar respuesta"
                  className="
                    shrink-0
                    rounded-xl
                    p-2
                    text-slate-600
                    transition
                    hover:bg-white/5
                    hover:text-slate-300
                    active:scale-95
                  "
                >
                  <X
                    size={15}
                  />
                </button>
              </div>
            )}

            <div
              className="
                relative flex
                items-end gap-2
              "
            >
              <div
                ref={
                  emojiPanelRef
                }
                className="relative"
              >
                {mostrarEmojis && (
                  <div
                    className="
                      emoji-panel
                      absolute
                      bottom-[3.2rem]
                      left-0
                      z-50
                      w-[284px]
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/[0.09]
                      bg-[#0b1727]/98
                      shadow-[0_22px_60px_rgba(0,0,0,.45)]
                      backdrop-blur-xl
                    "
                  >
                    <div
                      className="
                        flex items-center
                        justify-between
                        border-b
                        border-white/[0.07]
                        px-3.5 py-3
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[11px]
                            font-bold
                            text-slate-200
                          "
                        >
                          Emojis
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[9px]
                            text-slate-600
                          "
                        >
                          Exprésate sin salir del chat
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarEmojis(
                            false,
                          )
                        }
                        aria-label="Cerrar emojis"
                        className="
                          rounded-lg
                          p-1.5
                          text-slate-600
                          transition
                          hover:bg-white/5
                          hover:text-slate-300
                        "
                      >
                        <X
                          size={15}
                        />
                      </button>
                    </div>

                    <div
                      className="
                        grid
                        grid-cols-8
                        gap-1
                        p-2.5
                      "
                    >
                      {EMOJIS.map(
                        (
                          emoji,
                          indice,
                        ) => (
                          <button
                            type="button"
                            key={`${emoji}-${indice}`}
                            onClick={() =>
                              agregarEmoji(
                                emoji,
                              )
                            }
                            className="
                              flex h-8 w-8
                              items-center
                              justify-center
                              rounded-lg
                              text-[20px]
                              transition
                              hover:bg-white/[0.08]
                              active:scale-90
                            "
                          >
                            {
                              emoji
                            }
                          </button>
                        ),
                      )}
                    </div>

                    <div
                      className="
                        flex items-center
                        justify-between
                        border-t
                        border-white/[0.06]
                        px-3 py-2
                      "
                    >
                      <span
                        className="
                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.18em]
                          text-slate-700
                        "
                      >
                        ReportaRD
                      </span>

                      <span
                        className="
                          text-[9px]
                          text-slate-700
                        "
                      >
                        🇩🇴
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setMostrarEmojis(
                      (actual) =>
                        !actual,
                    )
                  }
                  aria-label="Abrir selector de emojis"
                  aria-expanded={
                    mostrarEmojis
                  }
                  className={`
                    mb-1 flex
                    h-10 w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    transition

                    ${mostrarEmojis
                      ? `
                          bg-amber-400/10
                          text-amber-400
                        `
                      : `
                          text-slate-600
                          hover:bg-white/5
                          hover:text-amber-400
                        `
                    }
                  `}
                >
                  {mostrarEmojis ? (
                    <ChevronDown
                      size={20}
                    />
                  ) : (
                    <Smile
                      size={21}
                    />
                  )}
                </button>
              </div>

              <div
                className="
                  flex min-h-12
                  flex-1
                  items-end
                  rounded-[22px]
                  border
                  border-white/[0.085]
                  bg-[#0b1726]
                  px-4 py-2.5
                  transition
                  focus-within:border-slate-500/40
                  focus-within:bg-[#0d1b2b]
                  focus-within:shadow-[0_0_0_3px_rgba(148,163,184,.025)]
                "
              >
                <textarea
                  ref={
                    textareaRef
                  }
                  value={
                    nuevoMensaje
                  }
                  onChange={(
                    evento,
                  ) =>
                    notificarEscritura(
                      evento.target
                        .value,
                    )
                  }
                  onKeyDown={(
                    evento,
                  ) => {
                    if (
                      evento.key ===
                      "Enter" &&
                      !evento.shiftKey
                    ) {
                      evento.preventDefault();

                      enviarMensaje();
                    }
                  }}
                  rows={1}
                  maxLength={4000}
                  placeholder={
                    mensajeRespondido
                      ? "Escribe tu respuesta..."
                      : "Escribe un mensaje..."
                  }
                  className="
                    max-h-24
                    min-h-[24px]
                    flex-1
                    resize-none
                    overflow-y-auto
                    bg-transparent
                    text-sm
                    leading-6
                    text-slate-100
                    outline-none
                    placeholder:text-slate-600
                  "
                />
              </div>

              <button
                type="button"
                onClick={
                  enviarMensaje
                }
                disabled={
                  !nuevoMensaje.trim() ||
                  enviando
                }
                aria-label="Enviar mensaje"
                className="
                  mb-1 flex
                  h-10 w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-blue-300/10
                  bg-[#173b57]
                  text-slate-100
                  shadow-[0_8px_24px_rgba(0,0,0,.20)]
                  transition
                  hover:brightness-110
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                  disabled:shadow-none
                "
              >
                {enviando ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Send
                    size={17}
                  />
                )}
              </button>
            </div>

            <div
              className="
                mt-2 flex
                items-center
                justify-between
                px-12
              "
            >
              <span
                className="
                  text-[8px]
                  uppercase
                  tracking-[0.14em]
                  text-slate-800
                "
              >
                Enter para enviar
              </span>

              {nuevoMensaje.length >
                3200 && (
                  <span
                    className="
                    text-[9px]
                    text-slate-600
                  "
                  >
                    {
                      nuevoMensaje.length
                    }
                    /4000
                  </span>
                )}
            </div>
          </footer>
        </div>

        <EstilosMensajes />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div
        className="
          mx-auto min-h-screen
          max-w-md
          border-x
          border-white/[0.06]
          bg-[#06101f]
        "
      >
        <div
          className="
            h-[2px]
            bg-gradient-to-r
            from-red-500
            via-orange-400
            to-slate-700
          "
        />

        <header
          className="
            sticky top-0 z-30
            border-b
            border-white/[0.065]
            bg-[#06101f]/95
            px-4 pb-4 pt-4
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex items-center
              justify-between
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              aria-label="Volver"
              className="
                rounded-xl p-2
                text-slate-500
                transition
                hover:bg-white/5
                hover:text-white
                active:scale-95
              "
            >
              <ArrowLeft
                size={21}
              />
            </button>

            <div className="text-center">
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-red-400
                "
              >
                ReportaRD
              </p>

              <h1
                className="
                  mt-0.5
                  font-bold
                  text-slate-100
                "
              >
                Mensajes
              </h1>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-slate-600
                "
              >
                Conversaciones de tu comunidad
              </p>
            </div>

            <div
              className="
                flex h-10 w-10
                items-center
                justify-center
                rounded-xl
                border
                border-red-400/10
                bg-red-500/[0.07]
                text-red-300
              "
            >
              <MessageCircle
                size={20}
              />
            </div>
          </div>

          <div
            className="
              relative mt-4
            "
          >
            <Search
              size={17}
              className="
                absolute left-4
                top-1/2
                -translate-y-1/2
                text-slate-600
              "
            />

            <input
              type="search"
              value={busqueda}
              onChange={(
                evento,
              ) =>
                setBusqueda(
                  evento.target
                    .value,
                )
              }
              placeholder="Buscar conversaciones..."
              className="
                w-full
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0a1625]
                py-3
                pl-11 pr-11
                text-sm
                text-white
                outline-none
                transition
                placeholder:text-slate-600
                focus:border-slate-500/40
                focus:bg-[#0c1929]
              "
            />

            {busqueda && (
              <button
                type="button"
                onClick={() =>
                  setBusqueda("")
                }
                aria-label="Limpiar búsqueda"
                className="
                  absolute right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-full
                  p-1
                  text-slate-600
                  transition
                  hover:bg-white/10
                  hover:text-slate-300
                "
              >
                <X
                  size={16}
                />
              </button>
            )}
          </div>
        </header>

        {error && (
          <AvisoError
            mensaje={error}
          />
        )}

        <main
          className="
            px-4 py-5
          "
        >
          <div
            className="
              mb-5
              flex items-center
              justify-between
            "
          >
            <div>
              <h2
                className="
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                Conversaciones
              </h2>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-600
                "
              >
                Chats privados y grupos
              </p>
            </div>

            <span
              className="
                rounded-full
                border
                border-white/[0.07]
                bg-white/[0.035]
                px-2.5 py-1
                text-[9px]
                font-semibold
                text-slate-500
              "
            >
              {
                conversaciones.length
              }{" "}
              {conversaciones.length ===
                1
                ? "chat"
                : "chats"}
            </span>
          </div>

          {cargando ? (
            <EstadoCargando
              texto="Cargando conversaciones..."
            />
          ) : (
            <section
              className="
                space-y-1
              "
            >
              {conversacionesVisibles.map(
                (
                  conversacion,
                  indice,
                ) => {
                  const datos =
                    obtenerDatosConversacion(
                      conversacion,
                      miUsuarioId,
                    );

                  return (
                    <button
                      type="button"
                      key={
                        conversacion._id
                      }
                      onClick={() =>
                        abrirConversacion(
                          conversacion,
                        )
                      }
                      style={{
                        animationDelay:
                          `${indice * 45}ms`,
                      }}
                      className="
                        conversation-enter
                        group flex
                        w-full
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-transparent
                        p-3
                        text-left
                        transition
                        hover:border-white/[0.07]
                        hover:bg-white/[0.035]
                        active:scale-[0.99]
                      "
                    >
                      <Avatar
                        datos={
                          datos
                        }
                      />

                      <span
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <span
                          className="
                            flex
                            items-center
                            justify-between
                            gap-2
                          "
                        >
                          <strong
                            className="
                              truncate
                              text-[13px]
                              font-semibold
                              text-slate-200
                            "
                          >
                            {
                              datos.nombre
                            }
                          </strong>

                          <span
                            className="
                              shrink-0
                              text-[9px]
                              text-slate-700
                            "
                          >
                            {formatearHora(
                              conversacion
                                .ultimoMensaje
                                ?.createdAt ||
                              conversacion
                                .updatedAt,
                            )}
                          </span>
                        </span>

                        <span
                          className="
                            mt-1 flex
                            items-center
                            gap-1.5
                          "
                        >
                          {datos.activo && (
                            <span
                              className="
                                h-1.5 w-1.5
                                shrink-0
                                rounded-full
                                bg-emerald-400
                              "
                            />
                          )}

                          <span
                            className="
                              block min-w-0
                              truncate
                              text-[11px]
                              text-slate-600
                            "
                          >
                            {conversacion
                              .ultimoMensaje
                              ?.contenido ||
                              "Conversación creada. Envía el primer mensaje."}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                },
              )}

              {conversacionesVisibles.length ===
                0 && (
                  <div
                    className="
                    rounded-3xl
                    border
                    border-dashed
                    border-white/[0.09]
                    px-6 py-12
                    text-center
                  "
                  >
                    <UserRoundSearch
                      size={36}
                      className="
                      mx-auto
                      text-slate-700
                    "
                    />

                    <h3
                      className="
                      mt-4
                      font-semibold
                      text-slate-300
                    "
                    >
                      {busqueda
                        ? "No encontramos esa conversación"
                        : "Todavía no tienes conversaciones"}
                    </h3>

                    <p
                      className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-600
                    "
                    >
                      Busca personas reales
                      de ReportaRD para
                      comenzar a conversar.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/personas",
                        )
                      }
                      className="
                      mt-5
                      rounded-2xl
                      border
                      border-red-400/10
                      bg-red-500/[0.09]
                      px-5 py-3
                      text-sm
                      font-semibold
                      text-red-200
                      transition
                      hover:bg-red-500/[0.14]
                      active:scale-95
                    "
                    >
                      Buscar personas
                    </button>
                  </div>
                )}
            </section>
          )}
        </main>
      </div>

      <EstilosMensajes />
    </div>
  );
}

function SeparadorFecha({
  fecha,
}) {
  return (
    <div
      className="
        my-5 flex
        items-center gap-3
      "
    >
      <span
        className="
          h-px flex-1
          bg-white/[0.045]
        "
      />

      <span
        className="
          rounded-full
          border
          border-white/[0.06]
          bg-[#091524]/90
          px-3 py-1
          text-[9px]
          font-semibold
          text-slate-600
          shadow-sm
          backdrop-blur-md
        "
      >
        {formatearDiaConversacion(
          fecha,
        )}
      </span>

      <span
        className="
          h-px flex-1
          bg-white/[0.045]
        "
      />
    </div>
  );
}

function Avatar({
  datos,
  grande = false,
}) {
  const tamano = grande
    ? "h-11 w-11"
    : "h-12 w-12";

  return (
    <span
      className={`
        relative flex
        ${tamano}
        shrink-0
        items-center
        justify-center
        overflow-visible
        rounded-full
        bg-gradient-to-br
        from-slate-600
        via-slate-500
        to-red-500
        font-bold
      `}
    >
      <span
        className="
          flex h-full w-full
          items-center
          justify-center
          overflow-hidden
          rounded-full
        "
      >
        {datos.foto ? (
          <img
            src={datos.foto}
            alt={`Foto de ${datos.nombre}`}
            className="
              h-full w-full
              object-cover
            "
          />
        ) : (
          datos.iniciales
        )}
      </span>

      {datos.activo && (
        <span
          className="
            absolute
            bottom-0 right-0
            h-3.5 w-3.5
            rounded-full
            border-[3px]
            border-[#06101f]
            bg-emerald-400
            shadow-[0_0_10px_rgba(52,211,153,.35)]
          "
        />
      )}
    </span>
  );
}

function EstadoCargando({
  texto,
}) {
  return (
    <div
      className="
        flex items-center
        justify-center
        gap-2
        py-16
        text-sm
        text-slate-600
      "
    >
      <LoaderCircle
        size={19}
        className="
          animate-spin
          text-slate-400
        "
      />

      {texto}
    </div>
  );
}

function AvisoError({
  mensaje,
}) {
  return (
    <div
      className="
        mx-4 mt-4
        flex items-start
        gap-3
        rounded-2xl
        border
        border-red-500/15
        bg-red-500/[0.07]
        px-4 py-3
      "
    >
      <span
        className="
          mt-1 h-1.5 w-1.5
          shrink-0
          rounded-full
          bg-red-400
        "
      />

      <p
        className="
          text-xs
          leading-5
          text-red-300
        "
      >
        {mensaje}
      </p>
    </div>
  );
}

function EstilosMensajes() {
  return (
    <style>{`
      .chat-background {
        background-color: #06101f;

        background-image:
          radial-gradient(
            circle at 50% 0%,
            rgba(30, 64, 175, .07),
            transparent 34%
          ),
          radial-gradient(
            circle at center,
            rgba(148, 163, 184, .03) 1px,
            transparent 1px
          );

        background-size:
          100% 100%,
          26px 26px;
      }

      .conversation-enter,
      .message-enter {
        opacity: 0;

        animation:
          reportardMessageEnter
          300ms
          cubic-bezier(.2,.8,.2,1)
          forwards;
      }

      .reply-preview-enter {
        animation:
          reportardReplyPreview
          180ms
          cubic-bezier(.2,.8,.2,1)
          both;
      }

      .emoji-panel {
        transform-origin:
          bottom left;

        animation:
          reportardEmojiOpen
          180ms
          cubic-bezier(.2,.8,.2,1)
          both;
      }

      .typing-dot {
        animation:
          reportardTypingDot
          900ms
          ease-in-out
          infinite alternate;
      }

      .reportard-chat-scrollbar {
        scrollbar-width: thin;

        scrollbar-color:
          rgba(100,116,139,.18)
          transparent;
      }

      .reportard-chat-scrollbar::-webkit-scrollbar {
        width: 5px;
      }

      .reportard-chat-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .reportard-chat-scrollbar::-webkit-scrollbar-thumb {
        background:
          rgba(100,116,139,.18);

        border-radius: 999px;
      }

      @keyframes reportardMessageEnter {
        from {
          opacity: 0;

          transform:
            translateY(6px);
        }

        to {
          opacity: 1;

          transform:
            translateY(0);
        }
      }

      @keyframes reportardReplyPreview {
        from {
          opacity: 0;
          transform:
            translateY(5px);
        }

        to {
          opacity: 1;
          transform:
            translateY(0);
        }
      }

      @keyframes reportardEmojiOpen {
        from {
          opacity: 0;

          transform:
            translateY(5px)
            scale(.96);
        }

        to {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }
      }

      @keyframes reportardTypingDot {
        from {
          opacity: .25;

          transform:
            translateY(2px);
        }

        to {
          opacity: 1;

          transform:
            translateY(-2px);
        }
      }

      @media (
        prefers-reduced-motion: reduce
      ) {
        .conversation-enter,
        .message-enter,
        .reply-preview-enter,
        .emoji-panel,
        .typing-dot {
          animation: none;
          opacity: 1;
        }
      }
    `}</style>
  );
}
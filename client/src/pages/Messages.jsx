import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  LoaderCircle,
  MessageCircle,
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
  desconectarSocket,
} from "../services/socketService";

const obtenerSesion = () => {
  try {
    return {
      token: localStorage.getItem("reportard_token") || "",
      usuario: JSON.parse(
        localStorage.getItem("reportard_user") || "null",
      ),
    };
  } catch {
    return { token: "", usuario: null };
  }
};

const obtenerIniciales = (nombre = "") =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join("") || "RD";

const formatearHora = (fecha) => {
  if (!fecha) return "";

  return new Intl.DateTimeFormat("es-DO", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(fecha));
};

const obtenerDatosConversacion = (conversacion, miUsuarioId) => {
  if (conversacion.tipo === "grupo") {
    return {
      nombre: conversacion.nombre,
      foto: conversacion.foto,
      iniciales: obtenerIniciales(conversacion.nombre),
      activo: false,
      estado: `Grupo · ${conversacion.participantes.length} miembros`,
    };
  }

  const otraPersona = conversacion.participantes.find(
    (persona) => persona._id !== miUsuarioId,
  );

  const nombre = otraPersona?.nombre || "Usuario de ReportaRD";

  return {
    nombre,
    foto: otraPersona?.foto || "",
    iniciales: obtenerIniciales(nombre),
    activo: Boolean(otraPersona?.activo),
    estado: otraPersona?.activo
      ? "En línea"
      : "Desconectado",
  };
};

const agregarSinDuplicar = (mensajes, nuevoMensaje) => {
  if (mensajes.some((mensaje) => mensaje._id === nuevoMensaje._id)) {
    return mensajes;
  }

  return [...mensajes, nuevoMensaje];
};

export default function Messages() {
  const navigate = useNavigate();
  const finalChatRef = useRef(null);
  const temporizadorEscrituraRef = useRef(null);
  const conversacionActivaRef = useRef(null);
  const sesionRef = useRef(obtenerSesion());

  const { token, usuario } = sesionRef.current;
  const miUsuarioId = usuario?._id || usuario?.id || "";

  const [busqueda, setBusqueda] = useState("");
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [usuarioEscribiendo, setUsuarioEscribiendo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoChat, setCargandoChat] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const conversacionesVisibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return conversaciones;

    return conversaciones.filter((conversacion) => {
      const datos = obtenerDatosConversacion(
        conversacion,
        miUsuarioId,
      );

      const ultimoMensaje =
        conversacion.ultimoMensaje?.contenido || "";

      return [datos.nombre, ultimoMensaje].some((valor) =>
        valor.toLowerCase().includes(texto),
      );
    });
  }, [busqueda, conversaciones, miUsuarioId]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let activo = true;

    const cargarConversaciones = async () => {
      try {
        setCargando(true);
        setError("");
        const datos = await listarConversaciones(token);

        if (activo) setConversaciones(datos.conversaciones || []);
      } catch (errorSolicitud) {
        if (activo) setError(errorSolicitud.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarConversaciones();

    const socket = conectarSocket(token);

    const recibirMensaje = ({ conversacionId, mensaje }) => {
      setConversaciones((actuales) =>
        actuales
          .map((conversacion) =>
            conversacion._id === conversacionId
              ? {
                  ...conversacion,
                  ultimoMensaje: mensaje,
                  updatedAt: mensaje.createdAt,
                }
              : conversacion,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt) - new Date(a.updatedAt),
          ),
      );

      if (conversacionActivaRef.current?._id === conversacionId) {
        setMensajes((actuales) =>
          agregarSinDuplicar(actuales, mensaje),
        );
        marcarMensajesComoLeidos(conversacionId, token).catch(
          () => {},
        );
      }
    };

    const recibirEscritura = ({
      conversacionId,
      usuarioId,
      nombre,
      escribiendo,
    }) => {
      if (usuarioId === miUsuarioId) return;

      if (conversacionActivaRef.current?._id === conversacionId) {
        setUsuarioEscribiendo(escribiendo ? nombre : "");
      }
    };

    const actualizarEstado = ({ usuarioId, activo: estaActivo }) => {
      setConversaciones((actuales) =>
        actuales.map((conversacion) => ({
          ...conversacion,
          participantes: conversacion.participantes.map((persona) =>
            persona._id === usuarioId
              ? { ...persona, activo: estaActivo }
              : persona,
          ),
        })),
      );
    };

    socket?.on("mensaje:nuevo", recibirMensaje);
    socket?.on("mensaje:escribiendo", recibirEscritura);
    socket?.on("usuario:estado", actualizarEstado);
    socket?.on("connect_error", (errorSocket) => {
      setError(errorSocket.message || "No se pudo conectar al chat.");
    });

    return () => {
      activo = false;
      socket?.off("mensaje:nuevo", recibirMensaje);
      socket?.off("mensaje:escribiendo", recibirEscritura);
      socket?.off("usuario:estado", actualizarEstado);
      socket?.off("connect_error");
      desconectarSocket();
      window.clearTimeout(temporizadorEscrituraRef.current);
    };
  }, [miUsuarioId, navigate, token]);

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes.length, usuarioEscribiendo]);

  const abrirConversacion = async (conversacion) => {
    try {
      setCargandoChat(true);
      setError("");
      setConversacionActiva(conversacion);
      conversacionActivaRef.current = conversacion;
      setMensajes([]);
      setUsuarioEscribiendo("");

      const socket = conectarSocket(token);
      socket?.emit("conversacion:entrar", conversacion._id);

      const datos = await obtenerConversacion(conversacion._id, token);
      setConversacionActiva(datos.conversacion);
      conversacionActivaRef.current = datos.conversacion;
      setMensajes(datos.mensajes || []);

      await marcarMensajesComoLeidos(conversacion._id, token);
    } catch (errorSolicitud) {
      setError(errorSolicitud.message);
      setConversacionActiva(null);
      conversacionActivaRef.current = null;
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

    setConversacionActiva(null);
    conversacionActivaRef.current = null;
    setMensajes([]);
    setUsuarioEscribiendo("");
  };

  const notificarEscritura = (valor) => {
    setNuevoMensaje(valor);

    if (!conversacionActiva) return;

    const socket = conectarSocket(token);

    socket?.emit("mensaje:escribiendo", {
      conversacionId: conversacionActiva._id,
      escribiendo: Boolean(valor.trim()),
    });

    window.clearTimeout(temporizadorEscrituraRef.current);
    temporizadorEscrituraRef.current = window.setTimeout(() => {
      socket?.emit("mensaje:escribiendo", {
        conversacionId: conversacionActiva._id,
        escribiendo: false,
      });
    }, 1200);
  };

  const enviarMensaje = async () => {
    const contenido = nuevoMensaje.trim();

    if (!contenido || !conversacionActiva || enviando) return;

    try {
      setEnviando(true);
      setError("");
      setNuevoMensaje("");

      conectarSocket(token)?.emit("mensaje:escribiendo", {
        conversacionId: conversacionActiva._id,
        escribiendo: false,
      });

      const respuesta = await enviarMensajeApi(
        conversacionActiva._id,
        contenido,
        token,
      );

      setMensajes((actuales) =>
        agregarSinDuplicar(actuales, respuesta.datos),
      );
    } catch (errorSolicitud) {
      setNuevoMensaje(contenido);
      setError(errorSolicitud.message);
    } finally {
      setEnviando(false);
    }
  };

  if (conversacionActiva) {
    const datosConversacion = obtenerDatosConversacion(
      conversacionActiva,
      miUsuarioId,
    );

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col border-x border-white/5 bg-[#06101f]">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#06101f]/95 px-4 py-3 backdrop-blur-xl">
            <button
              type="button"
              onClick={cerrarConversacion}
              aria-label="Volver a conversaciones"
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>

            <Avatar datos={datosConversacion} grande />

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold">
                {datosConversacion.nombre}
              </h1>
              <p
                className={`truncate text-[11px] ${
                  usuarioEscribiendo || datosConversacion.activo
                    ? "text-green-400"
                    : "text-slate-500"
                }`}
              >
                {usuarioEscribiendo
                  ? `${usuarioEscribiendo} está escribiendo...`
                  : datosConversacion.estado}
              </p>
            </div>

            {conversacionActiva.tipo === "grupo" && (
              <span className="rounded-xl bg-violet-500/10 p-2 text-violet-400">
                <Users size={19} />
              </span>
            )}
          </header>

          {error && <AvisoError mensaje={error} />}

          <main className="chat-background flex-1 space-y-3 overflow-y-auto px-4 py-6">
            {cargandoChat ? (
              <EstadoCargando texto="Cargando conversación..." />
            ) : (
              mensajes.map((mensaje, indice) => {
                const esMio = mensaje.autor?._id === miUsuarioId;

                return (
                  <div
                    key={mensaje._id}
                    style={{
                      animationDelay: `${Math.min(indice * 35, 250)}ms`,
                    }}
                    className={`message-enter flex ${
                      esMio ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-lg ${
                        esMio
                          ? "rounded-br-md bg-blue-500 text-white shadow-blue-500/10"
                          : "rounded-bl-md border border-white/5 bg-[#111e30] text-slate-200 shadow-black/10"
                      }`}
                    >
                      {conversacionActiva.tipo === "grupo" && !esMio && (
                        <p className="mb-1 text-[10px] font-semibold text-violet-400">
                          {mensaje.autor?.nombre}
                        </p>
                      )}

                      <p className="whitespace-pre-wrap break-words text-sm leading-5">
                        {mensaje.contenido}
                      </p>

                      <div
                        className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${
                          esMio ? "text-blue-100/75" : "text-slate-600"
                        }`}
                      >
                        {formatearHora(mensaje.createdAt)}
                        {esMio && <CheckCheck size={13} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {usuarioEscribiendo && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-[#111e30] px-4 py-4">
                  {[0, 1, 2].map((punto) => (
                    <span
                      key={punto}
                      style={{ animationDelay: `${punto * 160}ms` }}
                      className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400"
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={finalChatRef} />
          </main>

          <footer className="sticky bottom-0 border-t border-white/10 bg-[#06101f]/95 px-3 pb-4 pt-3 backdrop-blur-xl">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => notificarEscritura(`${nuevoMensaje}😊`)}
                aria-label="Agregar emoji"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/5 hover:text-amber-400"
              >
                <Smile size={21} />
              </button>

              <div className="flex min-h-12 flex-1 items-end rounded-3xl border border-white/10 bg-white/5 px-4 py-2.5 focus-within:border-blue-500/40">
                <textarea
                  value={nuevoMensaje}
                  onChange={(evento) =>
                    notificarEscritura(evento.target.value)
                  }
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" && !evento.shiftKey) {
                      evento.preventDefault();
                      enviarMensaje();
                    }
                  }}
                  rows={1}
                  maxLength={4000}
                  placeholder="Escribe un mensaje..."
                  className="max-h-24 flex-1 resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <button
                type="button"
                onClick={enviarMensaje}
                disabled={!nuevoMensaje.trim() || enviando}
                aria-label="Enviar mensaje"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 active:scale-95 disabled:opacity-35"
              >
                {enviando ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </footer>
        </div>

        <EstilosMensajes />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06101f]/95 px-4 pb-4 pt-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="text-center">
              <h1 className="font-bold">Mensajes</h1>
              <p className="text-xs text-slate-500">
                Conversaciones reales de tu comunidad
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <MessageCircle size={21} />
            </div>
          </div>

          <div className="relative mt-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar conversaciones..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-white/10"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </header>

        {error && <AvisoError mensaje={error} />}

        <main className="px-4 py-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Conversaciones</h2>
              <p className="mt-1 text-xs text-slate-500">
                Chats privados y grupos de ReportaRD
              </p>
            </div>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-400">
              {conversaciones.length} chats
            </span>
          </div>

          {cargando ? (
            <EstadoCargando texto="Cargando conversaciones..." />
          ) : (
            <section className="space-y-2">
              {conversacionesVisibles.map((conversacion, indice) => {
                const datos = obtenerDatosConversacion(
                  conversacion,
                  miUsuarioId,
                );

                return (
                  <button
                    type="button"
                    key={conversacion._id}
                    onClick={() => abrirConversacion(conversacion)}
                    style={{ animationDelay: `${indice * 60}ms` }}
                    className="conversation-enter group flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition hover:border-white/10 hover:bg-white/[0.04] active:scale-[0.99]"
                  >
                    <Avatar datos={datos} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <strong className="truncate text-sm">
                          {datos.nombre}
                        </strong>
                        <span className="shrink-0 text-[10px] text-slate-600">
                          {formatearHora(
                            conversacion.ultimoMensaje?.createdAt ||
                              conversacion.updatedAt,
                          )}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {conversacion.ultimoMensaje?.contenido ||
                          "Conversación creada. Envía el primer mensaje."}
                      </span>
                    </span>
                  </button>
                );
              })}

              {conversacionesVisibles.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 px-6 py-12 text-center">
                  <UserRoundSearch
                    size={38}
                    className="mx-auto text-slate-700"
                  />
                  <h3 className="mt-4 font-semibold">
                    {busqueda
                      ? "No encontramos esa conversación"
                      : "Todavía no tienes conversaciones"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Busca personas reales de ReportaRD para comenzar a conversar.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/personas")}
                    className="mt-5 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 active:scale-95"
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

function Avatar({ datos, grande = false }) {
  const tamano = grande ? "h-11 w-11" : "h-13 w-13";

  return (
    <span
      className={`relative flex ${tamano} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-bold`}
    >
      {datos.foto ? (
        <img
          src={datos.foto}
          alt={`Foto de ${datos.nombre}`}
          className="h-full w-full object-cover"
        />
      ) : (
        datos.iniciales
      )}
      {datos.activo && (
        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#06101f] bg-green-400" />
      )}
    </span>
  );
}

function EstadoCargando({ texto }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
      <LoaderCircle size={20} className="animate-spin text-blue-400" />
      {texto}
    </div>
  );
}

function AvisoError({ mensaje }) {
  return (
    <p className="mx-4 mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {mensaje}
    </p>
  );
}

function EstilosMensajes() {
  return (
    <style>{`
      .chat-background {
        background-image: radial-gradient(circle at center, rgba(59,130,246,.07) 1px, transparent 1px);
        background-size: 24px 24px;
      }

      .conversation-enter,
      .message-enter {
        opacity: 0;
        animation: messageEnter 360ms cubic-bezier(.2,.8,.2,1) forwards;
      }

      .typing-dot {
        animation: typingDot 900ms ease-in-out infinite alternate;
      }

      @keyframes messageEnter {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes typingDot {
        from { opacity: .25; transform: translateY(2px); }
        to { opacity: 1; transform: translateY(-2px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .conversation-enter,
        .message-enter,
        .typing-dot {
          animation: none;
          opacity: 1;
        }
      }
    `}</style>
  );
}
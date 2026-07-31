import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  Image,
  MessageCircle,
  Search,
  Send,
  Smile,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

const conversacionesIniciales = [
  {
    id: 1,
    nombre: "María Fernández",
    iniciales: "MF",
    color: "from-violet-500 to-fuchsia-500",
    estado: "En línea",
    ultimoMensaje: "Nos vemos el sábado en el parque 👋",
    hora: "6:42 p. m.",
    noLeidos: 2,
  },
  {
    id: 2,
    nombre: "Laura Méndez",
    iniciales: "LM",
    color: "from-blue-500 to-cyan-500",
    estado: "Activa hace 8 min",
    ultimoMensaje: "Gracias por confirmar el reporte.",
    hora: "5:18 p. m.",
    noLeidos: 0,
  },
  {
    id: 3,
    nombre: "Los Jardines Unidos",
    iniciales: "LJ",
    color: "from-emerald-500 to-green-600",
    estado: "Grupo · 1,281 miembros",
    ultimoMensaje: "Carlos: Ya llegaron las herramientas.",
    hora: "3:05 p. m.",
    noLeidos: 5,
    grupo: true,
  },
  {
    id: 4,
    nombre: "José Martínez",
    iniciales: "JM",
    color: "from-amber-500 to-orange-600",
    estado: "Activo ayer",
    ultimoMensaje: "Excelente iniciativa, cuenta conmigo.",
    hora: "Ayer",
    noLeidos: 0,
  },
];

const mensajesIniciales = {
  1: [
    {
      id: "m1-1",
      autor: "otro",
      texto: "Hola Danny, ¿viste la convocatoria para limpiar el parque?",
      hora: "6:35 p. m.",
    },
    {
      id: "m1-2",
      autor: "yo",
      texto: "Sí, estaré allá. También la compartí con mi comunidad.",
      hora: "6:38 p. m.",
      leido: true,
    },
    {
      id: "m1-3",
      autor: "otro",
      texto: "Perfecto, nos vemos el sábado en el parque 👋",
      hora: "6:42 p. m.",
    },
  ],
  2: [
    {
      id: "m2-1",
      autor: "otro",
      texto: "El reporte del hueco ya tiene suficientes confirmaciones.",
      hora: "5:12 p. m.",
    },
    {
      id: "m2-2",
      autor: "yo",
      texto: "Muy bien, espero que las autoridades puedan revisarlo pronto.",
      hora: "5:15 p. m.",
      leido: true,
    },
    {
      id: "m2-3",
      autor: "otro",
      texto: "Gracias por confirmar el reporte.",
      hora: "5:18 p. m.",
    },
  ],
  3: [
    {
      id: "m3-1",
      autor: "otro",
      nombre: "María",
      texto: "La jornada comienza a las 8:00 a. m.",
      hora: "2:48 p. m.",
    },
    {
      id: "m3-2",
      autor: "otro",
      nombre: "Carlos",
      texto: "Ya llegaron las herramientas.",
      hora: "3:05 p. m.",
    },
  ],
  4: [
    {
      id: "m4-1",
      autor: "yo",
      texto: "Estamos organizando una actividad en el sector.",
      hora: "Ayer, 4:20 p. m.",
      leido: true,
    },
    {
      id: "m4-2",
      autor: "otro",
      texto: "Excelente iniciativa, cuenta conmigo.",
      hora: "Ayer, 4:32 p. m.",
    },
  ],
};

const obtenerMensajesGuardados = () => {
  try {
    const datos = localStorage.getItem("reportard_mensajes");
    return datos ? JSON.parse(datos) : mensajesIniciales;
  } catch {
    return mensajesIniciales;
  }
};

export default function Messages() {
  const navigate = useNavigate();
  const finalChatRef = useRef(null);

  const [busqueda, setBusqueda] = useState("");
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [mensajes, setMensajes] = useState(obtenerMensajesGuardados);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);

  const conversacionesVisibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return conversacionesIniciales;

    return conversacionesIniciales.filter((conversacion) =>
      [conversacion.nombre, conversacion.ultimoMensaje].some((valor) =>
        valor.toLowerCase().includes(texto),
      ),
    );
  }, [busqueda]);

  const conversacion = conversacionesIniciales.find(
    (elemento) => elemento.id === conversacionActiva,
  );

  const mensajesActivos = conversacion
    ? mensajes[conversacion.id] || []
    : [];

  useEffect(() => {
    localStorage.setItem("reportard_mensajes", JSON.stringify(mensajes));
  }, [mensajes]);

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajesActivos.length, escribiendo]);

  const abrirConversacion = (id) => {
    setConversacionActiva(id);
    setNuevoMensaje("");
  };

  const enviarMensaje = () => {
    const texto = nuevoMensaje.trim();

    if (!texto || !conversacion) return;

    const mensaje = {
      id: `mensaje-${Date.now()}`,
      autor: "yo",
      texto,
      hora: new Intl.DateTimeFormat("es-DO", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
      leido: true,
    };

    setMensajes((actuales) => ({
      ...actuales,
      [conversacion.id]: [...(actuales[conversacion.id] || []), mensaje],
    }));

    setNuevoMensaje("");
    setEscribiendo(true);

    window.setTimeout(() => {
      const respuesta = {
        id: `respuesta-${Date.now()}`,
        autor: "otro",
        texto: conversacion.grupo
          ? "Gracias por compartirlo con el grupo."
          : "Perfecto, gracias por avisarme 👍",
        hora: "Ahora",
      };

      setMensajes((actuales) => ({
        ...actuales,
        [conversacion.id]: [
          ...(actuales[conversacion.id] || []),
          respuesta,
        ],
      }));
      setEscribiendo(false);
    }, 1400);
  };

  if (conversacion) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col border-x border-white/5 bg-[#06101f]">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#06101f]/95 px-4 py-3 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setConversacionActiva(null)}
              aria-label="Volver a conversaciones"
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold ${conversacion.color}`}
            >
              {conversacion.iniciales}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold">{conversacion.nombre}</h1>
              <p className="truncate text-[11px] text-green-400">
                {escribiendo ? "Escribiendo..." : conversacion.estado}
              </p>
            </div>

            {conversacion.grupo && (
              <span className="rounded-xl bg-violet-500/10 p-2 text-violet-400">
                <Users size={19} />
              </span>
            )}
          </header>

          <main className="chat-background flex-1 space-y-3 overflow-y-auto px-4 py-6">
            <div className="mx-auto mb-6 w-fit rounded-full bg-white/5 px-3 py-1.5 text-[10px] text-slate-500">
              Hoy
            </div>

            {mensajesActivos.map((mensaje, indice) => (
              <div
                key={mensaje.id}
                style={{ animationDelay: `${Math.min(indice * 45, 300)}ms` }}
                className={`message-enter flex ${
                  mensaje.autor === "yo" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-lg ${
                    mensaje.autor === "yo"
                      ? "rounded-br-md bg-blue-500 text-white shadow-blue-500/10"
                      : "rounded-bl-md border border-white/5 bg-[#111e30] text-slate-200 shadow-black/10"
                  }`}
                >
                  {mensaje.nombre && (
                    <p className="mb-1 text-[10px] font-semibold text-violet-400">
                      {mensaje.nombre}
                    </p>
                  )}

                  <p className="text-sm leading-5">{mensaje.texto}</p>

                  <div
                    className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${
                      mensaje.autor === "yo"
                        ? "text-blue-100/75"
                        : "text-slate-600"
                    }`}
                  >
                    {mensaje.hora}
                    {mensaje.autor === "yo" && <CheckCheck size={13} />}
                  </div>
                </div>
              </div>
            ))}

            {escribiendo && (
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
                onClick={() =>
                  setNuevoMensaje((actual) => `${actual}😊`)
                }
                aria-label="Agregar emoji"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/5 hover:text-amber-400"
              >
                <Smile size={21} />
              </button>

              <div className="flex min-h-12 flex-1 items-end rounded-3xl border border-white/10 bg-white/5 px-4 py-2.5 focus-within:border-blue-500/40">
                <textarea
                  value={nuevoMensaje}
                  onChange={(evento) => setNuevoMensaje(evento.target.value)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" && !evento.shiftKey) {
                      evento.preventDefault();
                      enviarMensaje();
                    }
                  }}
                  rows={1}
                  placeholder="Escribe un mensaje..."
                  className="max-h-24 flex-1 resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                />

                <Image size={19} className="mb-0.5 text-slate-600" />
              </div>

              <button
                type="button"
                onClick={enviarMensaje}
                disabled={!nuevoMensaje.trim()}
                aria-label="Enviar mensaje"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 active:scale-95 disabled:opacity-35"
              >
                <Send size={18} />
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
              <p className="text-xs text-slate-500">Tu comunidad, más cerca</p>
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

        <main className="px-4 py-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Conversaciones</h2>
              <p className="mt-1 text-xs text-slate-500">
                Personas y comunidades que sigues
              </p>
            </div>

            <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-400">
              7 sin leer
            </span>
          </div>

          <section className="space-y-2">
            {conversacionesVisibles.map((elemento, indice) => (
              <button
                type="button"
                key={elemento.id}
                onClick={() => abrirConversacion(elemento.id)}
                style={{ animationDelay: `${indice * 70}ms` }}
                className="conversation-enter group flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition hover:border-white/10 hover:bg-white/[0.04] active:scale-[0.99]"
              >
                <span
                  className={`relative flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold ${elemento.color}`}
                >
                  {elemento.iniciales}
                  {elemento.estado === "En línea" && (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#06101f] bg-green-400" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm">
                      {elemento.nombre}
                    </strong>
                    <span className="shrink-0 text-[10px] text-slate-600">
                      {elemento.hora}
                    </span>
                  </span>

                  <span className="mt-1 flex items-center justify-between gap-3">
                    <span
                      className={`truncate text-xs ${
                        elemento.noLeidos
                          ? "font-medium text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      {elemento.ultimoMensaje}
                    </span>

                    {elemento.noLeidos > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[9px] font-bold text-white">
                        {elemento.noLeidos}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))}

            {conversacionesVisibles.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center">
                <MessageCircle size={36} className="mx-auto text-slate-700" />
                <h3 className="mt-4 font-semibold">No encontramos mensajes</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Prueba buscando otro nombre o comunidad.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>

      <EstilosMensajes />
    </div>
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
        animation: messageEnter 420ms cubic-bezier(.2,.8,.2,1) forwards;
      }

      .typing-dot {
        animation: typingDot 900ms ease-in-out infinite alternate;
      }

      @keyframes messageEnter {
        from { opacity: 0; transform: translateY(10px); }
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
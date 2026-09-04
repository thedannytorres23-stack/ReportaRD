import { useEffect } from "react";
import { createPortal } from "react-dom";

import {
  CornerUpLeft,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

export default function CommentsPanel({
  abierto,
  onCerrar,
  comentarios = [],
  cargando = false,
  error = "",
  usuarioActual = {},
  nuevoComentario,
  setNuevoComentario,
  enviandoComentario = false,
  onEnviarComentario,
  comentarioRespondiendo,
  setComentarioRespondiendo,
  nuevaRespuesta,
  setNuevaRespuesta,
  enviandoRespuesta = false,
  onEnviarRespuesta,
  onAbrirPerfil,
  obtenerIniciales,
  totalComentarios = 0,
}) {
  useEffect(() => {
    if (!abierto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const manejarTeclado = (evento) => {
      if (evento.key !== "Escape") return;

      if (comentarioRespondiendo) {
        setComentarioRespondiendo?.(null);
        setNuevaRespuesta?.("");
        return;
      }

      onCerrar?.();
    };

    window.addEventListener("keydown", manejarTeclado);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", manejarTeclado);
    };
  }, [
    abierto,
    comentarioRespondiendo,
    onCerrar,
    setComentarioRespondiendo,
    setNuevaRespuesta,
  ]);

  if (!abierto) return null;

  const cerrarPanel = () => {
    setComentarioRespondiendo?.(null);
    setNuevaRespuesta?.("");
    onCerrar?.();
  };

  const obtenerAvatar = (usuario, tamano = "normal") => {
    const esPequeno = tamano === "pequeno";

    const clases = esPequeno
      ? "h-8 w-8 text-[9px]"
      : "h-10 w-10 text-[10px]";

    return (
      <div
        className={`
          ${clases}
          relative flex shrink-0 items-center justify-center
          overflow-hidden rounded-full
          border border-white/10
          bg-gradient-to-br from-blue-500 via-indigo-500 to-red-500
          font-bold text-white
          shadow-lg shadow-black/25
        `}
      >
        {usuario?.foto ? (
          <img
            src={usuario.foto}
            alt={usuario.autor || usuario.nombre || "Usuario"}
            className="h-full w-full object-cover"
          />
        ) : (
          usuario?.iniciales ||
          obtenerIniciales?.(
            usuario?.autor ||
              usuario?.nombre ||
              "RD",
          ) ||
          "RD"
        )}
      </div>
    );
  };

  const contenidoPanel = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center md:px-5 md:py-6">
      {/* Fondo */}
      <button
        type="button"
        aria-label="Cerrar comentarios"
        onClick={cerrarPanel}
        className="
          absolute inset-0
          cursor-default
          bg-slate-950/80
          backdrop-blur-[10px]
        "
      />

      {/* Luces ambientales */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute left-[10%] top-[10%]
          h-72 w-72
          rounded-full
          bg-blue-600/10
          blur-[110px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute bottom-[5%] right-[8%]
          h-72 w-72
          rounded-full
          bg-red-600/10
          blur-[110px]
        "
      />

      {/* Panel */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Conversación ciudadana"
        className="
          comments-panel-dialog
          relative z-10
          flex h-[94dvh] w-full flex-col
          overflow-hidden
          rounded-t-[30px]
          border border-white/[0.08]
          bg-[#07101c]/95
          shadow-[0_-20px_80px_rgba(0,0,0,0.55)]

          md:h-[82vh]
          md:max-h-[820px]
          md:max-w-[680px]
          md:rounded-[30px]
          md:shadow-[0_30px_120px_rgba(0,0,0,0.65)]
        "
      >
        {/* Línea identidad ReportaRD */}
        <div className="absolute left-0 right-0 top-0 z-20 h-[2px] overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-red-500 via-white/25 to-blue-500" />
        </div>

        {/* Header */}
        <header
          className="
            relative shrink-0
            border-b border-white/[0.06]
            bg-[#08121f]/90
            px-4 pb-4 pt-5
            backdrop-blur-2xl
            sm:px-5
          "
        >
          {/* Tirador móvil */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15 md:hidden" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  relative flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-2xl
                  border border-blue-400/15
                  bg-gradient-to-br
                  from-blue-500/15 to-red-500/10
                  text-blue-300
                  shadow-lg shadow-blue-950/20
                "
              >
                <MessageCircle size={20} />

                {totalComentarios > 0 && (
                  <span
                    className="
                      absolute -right-1 -top-1
                      flex h-5 min-w-5 items-center justify-center
                      rounded-full
                      border-2 border-[#08121f]
                      bg-red-500
                      px-1
                      text-[9px] font-black text-white
                    "
                  >
                    {totalComentarios > 99
                      ? "99+"
                      : totalComentarios}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[9px] font-bold uppercase
                    tracking-[0.22em]
                    text-blue-400/70
                  "
                >
                  ReportaRD
                </p>

                <h2 className="mt-0.5 text-[17px] font-bold tracking-tight text-white">
                  Conversación ciudadana
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {totalComentarios}{" "}
                  {totalComentarios === 1
                    ? "comentario"
                    : "comentarios"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cerrarPanel}
              aria-label="Cerrar comentarios"
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-2xl
                border border-white/[0.07]
                bg-white/[0.035]
                text-slate-400
                transition duration-200
                hover:border-white/[0.12]
                hover:bg-white/[0.07]
                hover:text-white
                active:scale-90
              "
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Lista de comentarios */}
        <div
          className="
            comments-panel-scroll
            min-h-0 flex-1
            overflow-y-auto
            overscroll-contain
            px-4 py-5
            sm:px-5
          "
        >
          {error && (
            <div
              className="
                mb-5 rounded-2xl
                border border-red-500/20
                bg-red-500/[0.08]
                px-4 py-3
                text-xs leading-5 text-red-300
              "
            >
              {error}
            </div>
          )}

          {cargando ? (
            <div className="space-y-7">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-start gap-3"
                >
                  <div className="h-10 w-10 shrink-0 rounded-full bg-white/[0.07]" />

                  <div className="min-w-0 flex-1">
                    <div className="flex gap-2">
                      <div className="h-2.5 w-24 rounded-full bg-white/[0.08]" />
                      <div className="h-2.5 w-14 rounded-full bg-white/[0.04]" />
                    </div>

                    <div className="mt-3 h-2.5 w-[90%] rounded-full bg-white/[0.055]" />
                    <div className="mt-2 h-2.5 w-[65%] rounded-full bg-white/[0.04]" />

                    <div className="mt-3 h-2 w-20 rounded-full bg-white/[0.035]" />
                  </div>
                </div>
              ))}
            </div>
          ) : comentarios.length === 0 ? (
            <div className="flex min-h-[52vh] flex-col items-center justify-center px-8 text-center">
              <div
                className="
                  relative flex h-20 w-20
                  items-center justify-center
                  rounded-[28px]
                  border border-white/[0.07]
                  bg-gradient-to-br
                  from-blue-500/[0.08]
                  to-red-500/[0.06]
                  text-slate-400
                  shadow-2xl shadow-black/20
                "
              >
                <MessageCircle size={30} />

                <div
                  aria-hidden="true"
                  className="
                    absolute inset-0
                    rounded-[28px]
                    border border-blue-400/5
                    shadow-[0_0_50px_rgba(59,130,246,0.08)]
                  "
                />
              </div>

              <h3 className="mt-6 text-lg font-bold tracking-tight text-white">
                Inicia la conversación
              </h3>

              <p className="mt-2 max-w-[300px] text-sm leading-6 text-slate-500">
                Comparte tu opinión y aporta a la conversación de la comunidad.
              </p>

              <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Participación ciudadana
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              {comentarios.map((comentario) => (
                <article
                  key={comentario.id}
                  className="comments-panel-comment group"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onAbrirPerfil?.(
                          comentario.autorId,
                        )
                      }
                      aria-label={`Abrir perfil de ${comentario.autor}`}
                      className="
                        shrink-0 rounded-full
                        transition duration-200
                        hover:scale-105
                        active:scale-95
                      "
                    >
                      {obtenerAvatar(comentario)}
                    </button>

                    <div className="min-w-0 flex-1">
                      {/* Nombre + tiempo */}
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            onAbrirPerfil?.(
                              comentario.autorId,
                            )
                          }
                          className="
                            max-w-full truncate
                            text-[13px] font-bold
                            text-slate-100
                            transition hover:text-white
                            hover:underline
                          "
                        >
                          {comentario.autor}
                        </button>

                        {comentario.usuario && (
                          <span className="truncate text-[10px] text-slate-600">
                            @{comentario.usuario}
                          </span>
                        )}

                        <span className="text-[10px] text-slate-700">
                          ·
                        </span>

                        <span className="text-[10px] text-slate-600">
                          {comentario.tiempo}
                        </span>
                      </div>

                      {/* Texto */}
                      <p
                        className="
                          mt-1.5
                          break-words
                          text-[14px]
                          leading-[1.55rem]
                          text-slate-300
                        "
                      >
                        {comentario.contenido}
                      </p>

                      {/* Acciones */}
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setComentarioRespondiendo?.(
                              comentario.id,
                            );

                            setNuevaRespuesta?.("");
                          }}
                          className="
                            group/reply
                            flex items-center gap-1.5
                            rounded-lg
                            px-1.5 py-1
                            text-[10px] font-semibold
                            text-slate-500
                            transition
                            hover:bg-blue-500/[0.06]
                            hover:text-blue-400
                          "
                        >
                          <CornerUpLeft
                            size={12}
                            className="transition group-hover/reply:-translate-x-0.5"
                          />

                          Responder
                        </button>
                      </div>

                      {/* Respuestas */}
                      {comentario.respuestas?.length > 0 && (
                        <div
                          className="
                            relative ml-1 mt-4
                            space-y-4
                            border-l
                            border-blue-400/[0.10]
                            pl-4
                          "
                        >
                          {comentario.respuestas.map(
                            (respuesta) => (
                              <div
                                key={respuesta.id}
                                className="relative flex items-start gap-2.5"
                              >
                                {/* pequeño conector */}
                                <span
                                  aria-hidden="true"
                                  className="
                                    absolute -left-[17px] top-4
                                    h-px w-3
                                    bg-blue-400/[0.12]
                                  "
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    onAbrirPerfil?.(
                                      respuesta.autorId,
                                    )
                                  }
                                  className="
                                    shrink-0 rounded-full
                                    transition
                                    hover:scale-105
                                    active:scale-95
                                  "
                                >
                                  {obtenerAvatar(
                                    respuesta,
                                    "pequeno",
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onAbrirPerfil?.(
                                          respuesta.autorId,
                                        )
                                      }
                                      className="
                                        truncate
                                        text-[11px] font-bold
                                        text-slate-200
                                        hover:underline
                                      "
                                    >
                                      {respuesta.autor}
                                    </button>

                                    <span className="text-[9px] text-slate-600">
                                      {respuesta.tiempo}
                                    </span>
                                  </div>

                                  <p
                                    className="
                                      mt-1 break-words
                                      text-[13px]
                                      leading-5
                                      text-slate-400
                                    "
                                  >
                                    {respuesta.contenido}
                                  </p>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      {/* Composer de respuesta */}
                      {comentarioRespondiendo ===
                        comentario.id && (
                        <div
                          className="
                            comments-reply-box
                            mt-4
                            overflow-hidden
                            rounded-2xl
                            border border-blue-400/[0.16]
                            bg-blue-500/[0.035]
                            p-2.5
                          "
                        >
                          <div className="mb-2 flex items-center justify-between gap-3 px-1">
                            <p className="truncate text-[10px] text-blue-300/70">
                              Respondiendo a{" "}
                              <span className="font-bold text-blue-300">
                                {comentario.autor}
                              </span>
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                setComentarioRespondiendo?.(
                                  null,
                                );

                                setNuevaRespuesta?.("");
                              }}
                              className="
                                shrink-0 text-[9px]
                                font-semibold text-slate-600
                                transition hover:text-slate-300
                              "
                            >
                              Cancelar
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              autoFocus
                              value={nuevaRespuesta}
                              onChange={(evento) =>
                                setNuevaRespuesta?.(
                                  evento.target.value,
                                )
                              }
                              onKeyDown={(evento) => {
                                if (
                                  evento.key === "Enter" &&
                                  !enviandoRespuesta
                                ) {
                                  evento.preventDefault();

                                  onEnviarRespuesta?.(
                                    comentario.id,
                                  );
                                }

                                if (
                                  evento.key === "Escape"
                                ) {
                                  evento.stopPropagation();

                                  setComentarioRespondiendo?.(
                                    null,
                                  );

                                  setNuevaRespuesta?.("");
                                }
                              }}
                              placeholder={`Responder a ${comentario.autor}...`}
                              className="
                                min-w-0 flex-1
                                bg-transparent
                                px-1 py-2
                                text-xs text-white
                                outline-none
                                placeholder:text-slate-600
                              "
                            />

                            <button
                              type="button"
                              onClick={() =>
                                onEnviarRespuesta?.(
                                  comentario.id,
                                )
                              }
                              disabled={
                                !nuevaRespuesta?.trim() ||
                                enviandoRespuesta
                              }
                              aria-label="Enviar respuesta"
                              className="
                                flex h-8 w-8 shrink-0
                                items-center justify-center
                                rounded-xl
                                bg-blue-500
                                text-white
                                shadow-lg shadow-blue-500/15
                                transition duration-200
                                hover:bg-blue-400
                                active:scale-90
                                disabled:cursor-not-allowed
                                disabled:bg-white/[0.06]
                                disabled:text-slate-600
                                disabled:shadow-none
                              "
                            >
                              <Send size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Composer principal */}
        <footer
          className="
            relative shrink-0
            border-t border-white/[0.06]
            bg-[#08121f]/95
            px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))]
            pt-3
            backdrop-blur-2xl
            sm:px-5 sm:pb-4
          "
        >
          {/* Glow superior */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute left-1/2 top-0
              h-px w-2/3
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-blue-500/30
              to-transparent
            "
          />

          <form
            onSubmit={onEnviarComentario}
            className="flex items-end gap-3"
          >
            <div className="hidden shrink-0 sm:block">
              {obtenerAvatar({
                foto: usuarioActual.foto,
                nombre:
                  usuarioActual.nombre ||
                  "Usuario",
              })}
            </div>

            <div className="min-w-0 flex-1">
              <div
                className="
                  group/composer
                  relative flex items-end gap-2
                  rounded-[22px]
                  border border-white/[0.08]
                  bg-white/[0.035]
                  p-1.5
                  shadow-inner shadow-black/10
                  transition duration-300

                  focus-within:border-blue-400/25
                  focus-within:bg-white/[0.055]
                  focus-within:shadow-[0_0_35px_rgba(59,130,246,0.07)]
                "
              >
                <div className="min-w-0 flex-1 px-3 py-1">
                  <p
                    className="
                      mb-0.5
                      text-[8px] font-bold
                      uppercase tracking-[0.18em]
                      text-slate-600
                      transition
                      group-focus-within/composer:text-blue-400/60
                    "
                  >
                    Tu aporte
                  </p>

                  <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(evento) =>
                      setNuevoComentario?.(
                        evento.target.value,
                      )
                    }
                    placeholder="Únete a la conversación..."
                    className="
                      w-full
                      bg-transparent
                      py-1
                      text-sm text-white
                      outline-none
                      placeholder:text-slate-600
                    "
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    !nuevoComentario?.trim() ||
                    enviandoComentario
                  }
                  aria-label="Publicar comentario"
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-[17px]
                    bg-gradient-to-br
                    from-blue-500 to-blue-600
                    text-white
                    shadow-lg shadow-blue-500/20
                    transition duration-200
                    hover:-translate-y-0.5
                    hover:from-blue-400
                    hover:to-blue-500
                    hover:shadow-blue-500/30
                    active:translate-y-0
                    active:scale-90

                    disabled:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:bg-none
                    disabled:bg-white/[0.055]
                    disabled:text-slate-600
                    disabled:shadow-none
                  "
                >
                  {enviandoComentario ? (
                    <span
                      className="
                        h-4 w-4
                        animate-spin
                        rounded-full
                        border-2 border-white/30
                        border-t-white
                      "
                    />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between px-2">
                <p className="text-[9px] text-slate-700">
                  Visible para la comunidad
                </p>

                {nuevoComentario?.trim() && (
                  <p className="text-[9px] font-medium text-blue-400/60">
                    Listo para publicar
                  </p>
                )}
              </div>
            </div>
          </form>
        </footer>
      </section>

      <style>{`
        @keyframes commentsBackdropEnter {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes commentsPanelEnterMobile {
          from {
            opacity: 0;
            transform: translateY(70px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes commentsPanelEnterDesktop {
          from {
            opacity: 0;
            transform: translateY(22px) scale(.96);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes commentItemEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .comments-panel-dialog {
          animation:
            commentsPanelEnterMobile
            360ms
            cubic-bezier(.16, 1, .3, 1);
        }

        .comments-panel-comment {
          animation:
            commentItemEnter
            300ms
            cubic-bezier(.2, .8, .2, 1)
            both;
        }

        .comments-reply-box {
          animation:
            commentItemEnter
            220ms
            cubic-bezier(.2, .8, .2, 1)
            both;
        }

        .comments-panel-scroll {
          scrollbar-width: thin;
          scrollbar-color:
            rgba(148, 163, 184, .15)
            transparent;
        }

        .comments-panel-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .comments-panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .comments-panel-scroll::-webkit-scrollbar-thumb {
          background:
            rgba(148, 163, 184, .15);
          border-radius: 999px;
        }

        .comments-panel-scroll::-webkit-scrollbar-thumb:hover {
          background:
            rgba(148, 163, 184, .25);
        }

        @media (min-width: 768px) {
          .comments-panel-dialog {
            animation:
              commentsPanelEnterDesktop
              380ms
              cubic-bezier(.16, 1, .3, 1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .comments-panel-dialog,
          .comments-panel-comment,
          .comments-reply-box {
            animation: none;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(
    contenidoPanel,
    document.body,
  );
}
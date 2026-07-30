import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Users,
} from "lucide-react";

export default function PostCard({ publicacion }) {
  const clavePublicacion = useMemo(
    () =>
      `reportard_post_${
        publicacion.id ??
        `${publicacion.autor}_${publicacion.tiempo}`
      }`,
    [publicacion],
  );

  const [reaccionado, setReaccionado] = useState(() => {
    const datosGuardados = localStorage.getItem(
      clavePublicacion,
    );

    if (!datosGuardados) return false;

    try {
      return JSON.parse(datosGuardados).reaccionado ?? false;
    } catch {
      return false;
    }
  });

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

  const [comentarios, setComentarios] = useState(() => {
    const datosGuardados = localStorage.getItem(
      clavePublicacion,
    );

    if (!datosGuardados) return [];

    try {
      return JSON.parse(datosGuardados).comentarios ?? [];
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    localStorage.setItem(
      clavePublicacion,
      JSON.stringify({
        reaccionado,
        guardado,
        comentarios,
        compartidosLocales,
      }),
    );
  }, [
    clavePublicacion,
    reaccionado,
    guardado,
    comentarios,
    compartidosLocales,
  ]);

  const totalReacciones =
    publicacion.reacciones + (reaccionado ? 1 : 0);

  const totalComentarios =
    publicacion.comentarios + comentarios.length;

  const totalCompartidos =
    publicacion.compartidos + compartidosLocales;

  const agregarComentario = (evento) => {
    evento.preventDefault();

    const contenido = nuevoComentario.trim();

    if (!contenido) return;

    const comentario = {
      id: Date.now(),
      autor: "Danny Torres",
      iniciales: "DT",
      contenido,
      tiempo: "Ahora",
      respuestas: [],
    };

    setComentarios((comentariosActuales) => [
      ...comentariosActuales,
      comentario,
    ]);

    setNuevoComentario("");
  };

  const agregarRespuesta = (comentarioId) => {
    const contenido = nuevaRespuesta.trim();

    if (!contenido) return;

    setComentarios((comentariosActuales) =>
      comentariosActuales.map((comentario) => {
        if (comentario.id !== comentarioId) {
          return comentario;
        }

        return {
          ...comentario,
          respuestas: [
            ...comentario.respuestas,
            {
              id: Date.now(),
              autor: "Danny Torres",
              contenido,
              tiempo: "Ahora",
            },
          ],
        };
      }),
    );

    setNuevaRespuesta("");
    setComentarioRespondiendo(null);
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

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <header className="flex items-start gap-3 p-4">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 font-bold text-white"
        >
          {publicacion.iniciales}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate font-semibold">
              {publicacion.autor}
            </h2>

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

        <button
          type="button"
          aria-label="Opciones de la publicación"
          className="rounded-full p-2 text-slate-500 transition hover:bg-white/5"
        >
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="px-4 pb-4">
        <p className="text-sm leading-6 text-slate-200">
          {publicacion.contenido}
        </p>
      </div>

      {publicacion.mediaUrl ? (
        publicacion.mediaTipo === "video" ? (
          <video
            src={publicacion.mediaUrl}
            controls
            className="max-h-96 w-full bg-black"
          />
        ) : (
          <img
            src={publicacion.mediaUrl}
            alt="Contenido de la publicación"
            className="max-h-96 w-full object-cover"
          />
        )
      ) : (
        <div className="mx-4 flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-950 to-violet-950">
          <div className="text-center text-blue-300">
            <Users size={40} className="mx-auto" />

            <p className="mt-3 text-sm font-medium">
              Actividad comunitaria
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-4 text-xs text-slate-400">
        <button
          type="button"
          onClick={() =>
            setReaccionado((estadoActual) => !estadoActual)
          }
          className="flex items-center gap-2"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
            <Heart size={11} fill="currentColor" />
          </span>

          <span>{totalReacciones} reacciones</span>
        </button>

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
            setReaccionado((estadoActual) => !estadoActual)
          }
          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${
            reaccionado
              ? "bg-red-500/10 text-red-400"
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          <Heart
            size={21}
            fill={reaccionado ? "currentColor" : "none"}
          />
          Me gusta
        </button>

        <button
          type="button"
          onClick={() =>
            setMostrarComentarios((estadoActual) => !estadoActual)
          }
          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${
            mostrarComentarios
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
          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${
            guardado
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 text-xs font-bold">
              DT
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
              disabled={!nuevoComentario.trim()}
              aria-label="Enviar comentario"
              className="rounded-full bg-blue-500 p-2.5 text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </form>

          <div className="mt-4 space-y-4">
            {comentarios.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-500">
                Sé el primero en comentar.
              </p>
            ) : (
              comentarios.map((comentario) => (
                <article key={comentario.id}>
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 text-[10px] font-bold">
                      {comentario.iniciales}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl bg-white/5 px-3 py-2">
                        <p className="text-xs font-semibold text-white">
                          {comentario.autor}
                        </p>

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

                      {comentario.respuestas.map((respuesta) => (
                        <div
                          key={respuesta.id}
                          className="ml-5 mt-3 flex items-start gap-2"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[9px] font-bold text-blue-300">
                            DT
                          </div>

                          <div className="rounded-2xl bg-white/5 px-3 py-2">
                            <p className="text-xs font-semibold">
                              {respuesta.autor}
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                              {respuesta.contenido}
                            </p>
                          </div>
                        </div>
                      ))}

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
                              if (evento.key === "Enter") {
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
                            disabled={!nuevaRespuesta.trim()}
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
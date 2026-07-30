import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  Construction,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";

export default function ReportCard({ reporte }) {
  const claveReporte = useMemo(
    () =>
      `reportard_report_${
        reporte.id ?? `${reporte.autor}_${reporte.tiempo}`
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

  const [guardado, setGuardado] = useState(
    estadoGuardado.guardado ?? false,
  );

  const [comentarios, setComentarios] = useState(
    estadoGuardado.comentarios ?? [],
  );

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

  useEffect(() => {
    localStorage.setItem(
      claveReporte,
      JSON.stringify({
        confirmado,
        guardado,
        comentarios,
        compartidosLocales,
      }),
    );
  }, [
    claveReporte,
    confirmado,
    guardado,
    comentarios,
    compartidosLocales,
  ]);

  const cambiarConfirmacion = () => {
    setConfirmado((estadoActual) => !estadoActual);
  };

  const totalConfirmaciones =
    reporte.confirmaciones + (confirmado ? 1 : 0);

  const comentariosLocales = comentarios.reduce(
    (total, comentario) =>
      total + 1 + comentario.respuestas.length,
    0,
  );

  const totalComentarios =
    reporte.comentarios + comentariosLocales;

  const totalCompartidos =
    reporte.compartidos + compartidosLocales;

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
              iniciales: "DT",
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

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <header className="flex items-start gap-3 p-4">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 font-bold text-white"
        >
          {reporte.iniciales}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate font-semibold text-white">
              {reporte.autor}
            </h2>

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

        <button
          type="button"
          aria-label="Opciones del reporte"
          className="rounded-full p-2 text-slate-500 transition hover:bg-white/5"
        >
          <MoreHorizontal size={20} />
        </button>
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

        <h3 className="mt-4 text-lg font-bold text-white">
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

      <div className="relative mx-4 flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#64748b_1px,transparent_1px),linear-gradient(90deg,#64748b_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative flex flex-col items-center text-slate-500">
          <Construction size={45} />

          <span className="mt-2 text-xs">
            Fotografía del reporte
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-4 text-xs text-slate-400">
        <button
          type="button"
          onClick={cambiarConfirmacion}
          className="flex items-center gap-2"
        >
          <span className="flex -space-x-1">
            <span className="h-5 w-5 rounded-full border-2 border-[#0b1626] bg-red-500" />
            <span className="h-5 w-5 rounded-full border-2 border-[#0b1626] bg-blue-500" />
            <span className="h-5 w-5 rounded-full border-2 border-[#0b1626] bg-green-500" />
          </span>

          <span>
            {totalConfirmaciones} confirmaciones
          </span>
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
          onClick={cambiarConfirmacion}
          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${
            confirmado
              ? "bg-red-500/10 text-red-400"
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          <CheckCircle2
            size={21}
            fill={confirmado ? "currentColor" : "none"}
          />
          Confirmar
        </button>

        <button
          type="button"
          onClick={() =>
            setMostrarComentarios(
              (estadoActual) => !estadoActual,
            )
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
              placeholder="Comenta sobre este reporte..."
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
                Sé el primero en comentar sobre este reporte.
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
                        <p className="text-xs font-semibold">
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

                      {comentario.respuestas.map(
                        (respuesta) => (
                          <div
                            key={respuesta.id}
                            className="ml-5 mt-3 flex items-start gap-2"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[9px] font-bold text-blue-300">
                              {respuesta.iniciales}
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
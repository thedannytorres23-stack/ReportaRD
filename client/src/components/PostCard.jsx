import { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Users,
} from "lucide-react";

export default function PostCard({ publicacion }) {
  const [reaccionado, setReaccionado] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const totalReacciones =
    publicacion.reacciones + (reaccionado ? 1 : 0);

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
          className="rounded-full p-2 text-slate-500 hover:bg-white/5"
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
          onClick={() => setReaccionado((estado) => !estado)}
          className="flex items-center gap-2"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
            <Heart size={11} fill="currentColor" />
          </span>

          <span>{totalReacciones} reacciones</span>
        </button>

        <div className="flex gap-3">
          <span>{publicacion.comentarios} comentarios</span>
          <span>{publicacion.compartidos} compartidos</span>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      <footer className="grid grid-cols-4 px-2 py-2">
        <button
          type="button"
          onClick={() => setReaccionado((estado) => !estado)}
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
          className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs text-slate-400 hover:bg-white/5"
        >
          <MessageCircle size={21} />
          Comentar
        </button>

        <button
          type="button"
          className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs text-slate-400 hover:bg-white/5"
        >
          <Share2 size={21} />
          Compartir
        </button>

        <button
          type="button"
          onClick={() => setGuardado((estado) => !estado)}
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
    </article>
  );
}
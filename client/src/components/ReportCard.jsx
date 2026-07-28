import { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  Construction,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";

export default function ReportCard({ reporte }) {
  const [confirmado, setConfirmado] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const cambiarConfirmacion = () => {
    setConfirmado((estadoActual) => !estadoActual);
  };

  const totalConfirmaciones =
    reporte.confirmaciones + (confirmado ? 1 : 0);

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
          aria-label="Opciones de la publicación"
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

          <span>{totalConfirmaciones} confirmaciones</span>
        </button>

        <div className="flex gap-3">
          <span>{reporte.comentarios} comentarios</span>
          <span>{reporte.compartidos} compartidos</span>
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
          className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs text-slate-400 transition hover:bg-white/5"
        >
          <MessageCircle size={21} />
          Comentar
        </button>

        <button
          type="button"
          className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs text-slate-400 transition hover:bg-white/5"
        >
          <Share2 size={21} />
          Compartir
        </button>

        <button
          type="button"
          onClick={() => setGuardado((estadoActual) => !estadoActual)}
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
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Users,
  Vote,
} from "lucide-react";
import { motion } from "motion/react";

const opcionesIniciales = [
  {
    id: "alumbrado",
    nombre: "Alumbrado público",
    votos: 42,
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "calles",
    nombre: "Calles y aceras",
    votos: 35,
    color: "from-red-400 to-rose-500",
  },
  {
    id: "limpieza",
    nombre: "Limpieza y basura",
    votos: 23,
    color: "from-emerald-400 to-green-500",
  },
];

const CLAVE_VOTO = "reportard_community_vote";

export default function CommunityPoll({
  onOpenDiscussion,
}) {
  const [seleccion, setSeleccion] = useState(() => {
    return localStorage.getItem(CLAVE_VOTO) || "";
  });

  const opciones = useMemo(() => {
    return opcionesIniciales.map((opcion) => ({
      ...opcion,
      votos:
        opcion.votos +
        (seleccion === opcion.id ? 1 : 0),
    }));
  }, [seleccion]);

  const totalVotos = opciones.reduce(
    (total, opcion) => total + opcion.votos,
    0,
  );

  const votar = (id) => {
    if (seleccion) return;

    localStorage.setItem(CLAVE_VOTO, id);
    setSeleccion(id);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5 }}
      className="px-5 pb-7 pt-6"
    >
      <div className="overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 via-[#0b1626] to-blue-500/10 p-5 shadow-xl shadow-black/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/15 text-violet-300">
              <Vote size={21} />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                Decisión comunitaria
              </p>

              <h2 className="mt-1 font-bold leading-snug text-white">
                ¿Qué debería atenderse primero esta semana?
              </h2>
            </div>
          </div>

          <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] text-slate-400">
            <Users size={11} />
            Santiago
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {opciones.map((opcion) => {
            const porcentaje = Math.round(
              (opcion.votos / totalVotos) * 100,
            );

            const seleccionada =
              seleccion === opcion.id;

            return (
              <button
                type="button"
                key={opcion.id}
                onClick={() => votar(opcion.id)}
                disabled={Boolean(seleccion)}
                className={`group relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                  seleccionada
                    ? "border-violet-400/35 bg-violet-500/10"
                    : "border-white/5 bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.06]"
                }`}
              >
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    {seleccionada && (
                      <CheckCircle2
                        size={16}
                        className="text-violet-300"
                      />
                    )}

                    {opcion.nombre}
                  </span>

                  <span className="text-xs font-bold text-slate-300">
                    {porcentaje}%
                  </span>
                </div>

                <div className="relative z-10 mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${porcentaje}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: 0.15,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${opcion.color}`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
          <p className="text-[10px] leading-4 text-slate-500">
            {seleccion
              ? "Tu voto fue registrado para esta demostración."
              : `${totalVotos} ciudadanos ya participaron.`}
          </p>

          <button
            type="button"
            onClick={onOpenDiscussion}
            className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-violet-300 transition hover:text-violet-200"
          >
            Ver comunidad
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
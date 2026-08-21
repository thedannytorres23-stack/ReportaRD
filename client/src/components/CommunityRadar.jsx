import { MapPin, Radar } from "lucide-react";
import { motion } from "motion/react";

export default function CommunityRadar({ onOpenMap }) {
  return (
    <div className="flex w-full justify-center py-1">
      <motion.button
        type="button"
        onClick={onOpenMap}
        aria-label="Abrir mapa ciudadano"
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="group relative flex h-32 w-32 shrink-0 items-center justify-center"
      >
        <span className="absolute inset-2 rounded-full border border-blue-400/20 bg-[#071426]/95 shadow-2xl shadow-blue-950/70 transition-colors group-hover:border-blue-400/35" />

        <span className="absolute inset-5 rounded-full border border-blue-400/15" />
        <span className="absolute inset-9 rounded-full border border-blue-400/15" />

        <span className="absolute left-1/2 top-5 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-blue-400/10" />
        <span className="absolute left-5 top-1/2 h-px w-[calc(100%-2.5rem)] -translate-y-1/2 bg-blue-400/10" />

        <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-red-300/30 bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-950/30">
          <MapPin size={20} fill="currentColor" />
        </span>

        <span className="absolute -bottom-1 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0d1b2e] px-3 py-1.5 text-[9px] font-semibold text-blue-300 shadow-xl transition-colors group-hover:border-blue-400/20 group-hover:text-blue-200">
          <Radar size={10} className="text-blue-400" />
          Abrir mapa
        </span>
      </motion.button>
    </div>
  );
}
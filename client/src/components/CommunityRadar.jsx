import { MapPin, Radio } from "lucide-react";
import { motion } from "motion/react";

const puntos = [
  {
    id: 1,
    posicion: "left-[22%] top-[30%]",
    color: "bg-red-400",
    retraso: 0,
  },
  {
    id: 2,
    posicion: "right-[18%] top-[43%]",
    color: "bg-amber-400",
    retraso: 0.7,
  },
  {
    id: 3,
    posicion: "bottom-[21%] left-[42%]",
    color: "bg-blue-400",
    retraso: 1.4,
  },
];

export default function CommunityRadar({
  onOpenMap,
}) {
  return (
    <div className="flex w-full justify-center py-1">
      <motion.button
        type="button"
        onClick={onOpenMap}
        aria-label="Explorar actividad ciudadana cercana"
        initial={{
          opacity: 0,
          scale: 0.8,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 170,
          damping: 15,
        }}
        whileHover={{
          scale: 1.06,
          y: -4,
        }}
        whileTap={{
          scale: 0.94,
        }}
        className="group relative flex h-32 w-32 shrink-0 items-center justify-center"
      >
        {/* Resplandor exterior */}

        <motion.span
          animate={{
            scale: [0.9, 1.12, 0.9],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-blue-500/15 blur-2xl"
        />

        {/* Fondo principal */}

        <span className="absolute inset-2 rounded-full border border-blue-400/20 bg-[#071426]/95 shadow-2xl shadow-blue-950/70 transition duration-300 group-hover:border-blue-400/35" />

        {/* Círculos del radar */}

        <span className="absolute inset-5 rounded-full border border-blue-400/15" />

        <span className="absolute inset-9 rounded-full border border-blue-400/15" />

        {/* Líneas centrales */}

        <span className="absolute left-1/2 top-5 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-blue-400/10" />

        <span className="absolute left-5 top-1/2 h-px w-[calc(100%-2.5rem)] -translate-y-1/2 bg-blue-400/10" />

        {/* Barrido giratorio */}

        <motion.span
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-5 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 275deg, rgba(59,130,246,0.06) 295deg, rgba(59,130,246,0.6) 360deg)",
          }}
        />

        {/* Reportes detectados */}

        {puntos.map((punto) => (
          <motion.span
            key={punto.id}
            animate={{
              scale: [0.65, 1.35, 0.65],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: punto.retraso,
            }}
            className={`absolute h-2.5 w-2.5 rounded-full ${punto.posicion} ${punto.color}`}
          >
            <span
              className={`absolute inset-0 animate-ping rounded-full opacity-40 ${punto.color}`}
            />
          </motion.span>
        ))}

        {/* Ubicación central */}

        <motion.span
          animate={{
            scale: [1, 1.12, 1],
            boxShadow: [
              "0 0 0 rgba(239,68,68,0)",
              "0 0 28px rgba(239,68,68,0.6)",
              "0 0 0 rgba(239,68,68,0)",
            ],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
          }}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-red-300/30 bg-gradient-to-br from-red-400 to-red-600 text-white"
        >
          <MapPin
            size={20}
            fill="currentColor"
          />
        </motion.span>

        {/* Indicador inferior */}

        <motion.span
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute -bottom-1 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0d1b2e] px-3 py-1.5 text-[9px] font-semibold text-blue-300 shadow-xl"
        >
          <Radio
            size={10}
            className="text-red-400"
          />

          12 reportes cerca
        </motion.span>
      </motion.button>
    </div>
  );
}
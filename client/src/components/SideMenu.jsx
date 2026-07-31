import {
  Bell,
  FilePlus2,
  House,
  LogOut,
  Megaphone,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

const perfilInicial = {
  nombre: "Danny Torres",
  usuario: "dannytorres",
  foto: "",
};

const obtenerPerfilGuardado = () => {
  try {
    const datos = localStorage.getItem("reportard_profile");

    return datos
      ? {
          ...perfilInicial,
          ...JSON.parse(datos),
        }
      : perfilInicial;
  } catch {
    return perfilInicial;
  }
};

const obtenerIniciales = (nombre) => {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
};

export default function SideMenu({
  abierto,
  onClose,
  onRequestLogout,
}) {
  const navigate = useNavigate();

  const perfil = obtenerPerfilGuardado();
  const iniciales = obtenerIniciales(perfil.nombre);

  const navegar = (ruta) => {
    onClose();
    navigate(ruta);
  };

  const opciones = [
    {
      nombre: "Inicio",
      ruta: "/",
      icono: House,
      activa: true,
    },
    {
      nombre: "Buscar",
      ruta: "/buscar",
      icono: Search,
    },
    {
      nombre: "Mi perfil",
      ruta: "/perfil",
      icono: UserRound,
    },
    {
      nombre: "Personas",
      ruta: "/personas",
      icono: UsersRound,
    },
    {
      nombre: "Comunidades",
      ruta: "/comunidades",
      icono: UsersRound,
      nueva: true,
    },
    {
      nombre: "Notificaciones",
      ruta: "/notificaciones",
      icono: Bell,
    },
  ];

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50">
      <style>
        {`
          @keyframes reportardMenuFondo {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes reportardMenuEntrada {
            from {
              opacity: 0;
              transform: translateY(-12px) scale(0.94);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes reportardOpcionEntrada {
            from {
              opacity: 0;
              transform: translateX(-8px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes reportardPulso {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.7);
              opacity: 0.35;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .reportard-menu-fondo,
            .reportard-menu-tarjeta,
            .reportard-menu-opcion {
              animation: none !important;
            }
          }
        `}
      </style>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar menú"
        className="reportard-menu-fondo absolute inset-0 bg-black/10"
        style={{
          animation:
            "reportardMenuFondo 160ms ease-out both",
        }}
      />

      <aside
        style={{
          left: "max(1rem, calc(50% - 13rem))",
          animation:
            "reportardMenuEntrada 230ms cubic-bezier(0.16, 1, 0.3, 1) both",
          transformOrigin: "top left",
        }}
        className="reportard-menu-tarjeta fixed top-[4.5rem] w-[17rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1626]/95 text-white shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <header className="flex items-center gap-3 border-b border-white/10 p-3">
          <button
            type="button"
            onClick={() => navegar("/perfil")}
            className="group flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-red-500 text-sm font-bold shadow-lg shadow-red-500/10 transition duration-300 group-hover:scale-105 group-hover:shadow-red-500/25">
              {perfil.foto ? (
                <img
                  src={perfil.foto}
                  alt={`Foto de ${perfil.nombre}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                iniciales
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold transition group-hover:text-blue-300">
                {perfil.nombre}
              </h2>

              <p className="truncate text-[11px] text-slate-500">
                @{perfil.usuario}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-xl p-2 text-slate-500 transition duration-200 hover:rotate-90 hover:bg-white/5 hover:text-white"
          >
            <X size={17} />
          </button>
        </header>

        <nav className="space-y-1 p-2">
          {opciones.map((opcion, indice) => {
            const Icono = opcion.icono;

            return (
              <button
                type="button"
                key={opcion.nombre}
                onClick={() => navegar(opcion.ruta)}
                className={`reportard-menu-opcion group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition duration-200 hover:translate-x-1 ${
                  opcion.activa
                    ? "bg-red-500/10 font-medium text-red-400"
                    : "text-slate-300 hover:bg-white/5"
                }`}
                style={{
                  opacity: 0,
                  animation: `reportardOpcionEntrada 220ms ease-out ${
                    55 + indice * 35
                  }ms forwards`,
                }}
              >
                <Icono
                  size={18}
                  className={`transition duration-200 group-hover:scale-110 ${
                    opcion.nueva ? "text-violet-400" : ""
                  }`}
                />

                {opcion.nombre}

                {opcion.nueva && (
                  <span className="relative ml-auto flex h-3 w-3 items-center justify-center">
                    <span
                      className="absolute h-2 w-2 rounded-full bg-violet-500"
                      style={{
                        animation:
                          "reportardPulso 1.8s ease-in-out infinite",
                      }}
                    />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-violet-300" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mx-3 h-px bg-white/10" />

        <section className="grid grid-cols-2 gap-2 p-3">
          <button
            type="button"
            onClick={() => navegar("/publicar")}
            className="group flex flex-col items-center justify-center gap-1.5 rounded-xl bg-blue-500/10 px-2 py-3 text-xs font-medium text-blue-300 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500/15 hover:shadow-lg hover:shadow-blue-500/10 active:scale-95"
          >
            <FilePlus2
              size={19}
              className="transition duration-200 group-hover:rotate-6 group-hover:scale-110"
            />
            Publicar
          </button>

          <button
            type="button"
            onClick={() => navegar("/reportar")}
            className="group flex flex-col items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-2 py-3 text-xs font-medium text-red-300 transition duration-200 hover:-translate-y-0.5 hover:bg-red-500/15 hover:shadow-lg hover:shadow-red-500/10 active:scale-95"
          >
            <Megaphone
              size={19}
              className="transition duration-200 group-hover:-rotate-6 group-hover:scale-110"
            />
            Reportar
          </button>
        </section>

        <footer className="border-t border-white/10 p-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestLogout();
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition duration-200 hover:bg-red-500/10"
          >
            <LogOut
              size={18}
              className="transition duration-200 group-hover:translate-x-1"
            />
            Cerrar sesión
          </button>
        </footer>
      </aside>
    </div>
  );
}
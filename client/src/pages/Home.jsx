import {
  Bell,
  Construction,
  House,
  Lightbulb,
  LogOut,
  Map,
  Menu,
  MoreHorizontal,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router";

const categorias = [
  {
    nombre: "Infraestructura",
    icono: Construction,
    color: "bg-red-500/15 text-red-400",
  },
  {
    nombre: "Alumbrado",
    icono: Lightbulb,
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    nombre: "Basura",
    icono: Trash2,
    color: "bg-green-500/15 text-green-400",
  },
  {
    nombre: "Más",
    icono: MoreHorizontal,
    color: "bg-slate-700 text-slate-300",
  },
];

const reportes = [
  {
    id: 1,
    titulo: "Hueco en la vía",
    ubicacion: "Av. Estrella Sadhalá, Santiago",
    tiempo: "Hace 15 min",
    confirmaciones: 32,
    color: "bg-red-500",
  },
  {
    id: 2,
    titulo: "Semáforo averiado",
    ubicacion: "Calle Duarte, Santiago",
    tiempo: "Hace 32 min",
    confirmaciones: 18,
    color: "bg-amber-500",
  },
];

export default function Home({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-24">
        <header className="flex items-center justify-between px-5 pb-5 pt-6">
          <button
            type="button"
            aria-label="Abrir menú"
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
          >
            <Menu size={25} />
          </button>

          <h1 className="text-xl font-bold">
            Reporta<span className="text-red-500">RD</span>
          </h1>

          <div className="flex items-center">
            <button
              type="button"
              aria-label="Ver notificaciones"
              className="relative rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
            >
              <Bell size={23} />

              <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button
              type="button"
              onClick={onLogout}
              aria-label="Cerrar sesión"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-red-400"
            >
              <LogOut size={21} />
            </button>
          </div>
        </header>

        <main className="px-5">
          <section>
            <p className="text-lg font-semibold text-slate-300">
              ¡Hola, Danny! 👋
            </p>

            <h2 className="mt-1 max-w-xs text-3xl font-bold leading-tight">
              ¿Qué sucede en tu comunidad hoy?
            </h2>

            <button
              type="button"
              onClick={() => navigate("/reportar")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-4 font-semibold shadow-lg shadow-red-500/20 transition active:scale-[0.98]"
            >
              <Plus size={21} strokeWidth={3} />
              Reportar problema
            </button>
          </section>

          <section className="mt-6 grid grid-cols-4 gap-3">
            {categorias.map(({ nombre, icono: Icono, color }) => (
              <button
                type="button"
                key={nombre}
                className="flex min-w-0 flex-col items-center gap-2"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${color}`}
                >
                  <Icono size={24} />
                </span>

                <span className="w-full truncate text-center text-[11px] text-slate-400">
                  {nombre}
                </span>
              </button>
            ))}
          </section>

          <div className="my-6 h-px bg-white/10" />

          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Actividad cerca de ti
            </h3>

            <div className="relative h-48 overflow-hidden rounded-2xl border border-blue-400/10 bg-[#0b2138]">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#3b82f6_1px,transparent_1px),linear-gradient(90deg,#3b82f6_1px,transparent_1px)] [background-size:32px_32px]" />

              <span className="absolute left-[20%] top-[55%] h-4 w-4 rounded-full border-4 border-red-300 bg-red-500 shadow-lg shadow-red-500/50" />

              <span className="absolute left-[52%] top-[25%] h-4 w-4 rounded-full border-4 border-violet-300 bg-violet-500 shadow-lg shadow-violet-500/50" />

              <span className="absolute right-[18%] top-[48%] h-4 w-4 rounded-full border-4 border-amber-300 bg-amber-500 shadow-lg shadow-amber-500/50" />

              <span className="absolute bottom-[18%] right-[38%] h-4 w-4 rounded-full border-4 border-green-300 bg-green-500 shadow-lg shadow-green-500/50" />
            </div>

            <div className="mt-4 divide-y divide-white/10">
              {reportes.map((reporte) => (
                <article
                  key={reporte.id}
                  className="flex items-center gap-3 py-4"
                >
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-800">
                    <div className="flex h-full items-center justify-center text-slate-500">
                      <Construction size={24} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold">
                      {reporte.titulo}
                    </h4>

                    <p className="truncate text-xs text-slate-400">
                      {reporte.ubicacion}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {reporte.tiempo}
                    </p>
                  </div>

                  <span
                    className={`${reporte.color} rounded-lg px-2.5 py-1 text-xs font-bold`}
                  >
                    {reporte.confirmaciones}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </main>

        <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-white/10 bg-[#06101f]/95 px-3 pb-4 pt-3 backdrop-blur-xl">
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-red-500"
          >
            <House size={21} fill="currentColor" />
            <span className="text-[10px] font-medium">Inicio</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <Map size={21} />
            <span className="text-[10px]">Mapa</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/reportar")}
            aria-label="Crear reporte"
            className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#06101f] bg-red-500 text-white shadow-lg shadow-red-500/30"
          >
            <Plus size={28} />
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <Bell size={21} />
            <span className="text-[10px]">Alertas</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <UserRound size={21} />
            <span className="text-[10px]">Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
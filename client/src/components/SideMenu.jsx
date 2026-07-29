import {
  FilePlus2,
  House,
  LogOut,
  Megaphone,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function SideMenu({
  abierto,
  onClose,
  onRequestLogout,
}) {
  const navigate = useNavigate();

  const navegar = (ruta) => {
    onClose();
    navigate(ruta);
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar menú"
        className="absolute inset-0 bg-black/25"
      />

      <aside
        style={{
          left: "max(1rem, calc(50% - 13rem))",
        }}
        className="fixed top-17 w-72 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1626] text-white shadow-2xl shadow-black/50"
      >
        <header className="border-b border-white/10 p-4">
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={() => navegar("/perfil")}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 font-bold">
                DT
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-semibold">
                  Danny Torres
                </h2>

                <p className="truncate text-xs text-slate-500">
                  @dannytorres
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="rounded-xl p-2 text-slate-500 hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <nav className="space-y-1 p-2">
          <button
            type="button"
            onClick={() => navegar("/")}
            className="flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-400"
          >
            <House size={19} />
            Inicio
          </button>

          <button
            type="button"
            onClick={() => navegar("/perfil")}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5"
          >
            <UserRound size={19} />
            Mi perfil
          </button>

          <button
            type="button"
            onClick={() => navegar("/publicar")}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5"
          >
            <FilePlus2 size={19} />
            Crear publicación
          </button>

          <button
            type="button"
            onClick={() => navegar("/reportar")}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5"
          >
            <Megaphone size={19} />
            Crear reporte
          </button>
        </nav>

        <footer className="border-t border-white/10 p-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestLogout();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>
        </footer>
      </aside>
    </div>
  );
}
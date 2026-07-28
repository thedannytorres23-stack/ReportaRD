import {
  Bell,
  FilePlus2,
  House,
  LogOut,
  Megaphone,
  UserRound,
  Users,
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <aside className="relative flex h-full w-[85%] max-w-sm flex-col border-r border-white/10 bg-[#081321] text-white shadow-2xl">
        <header className="border-b border-white/10 px-5 pb-5 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              Reporta<span className="text-red-500">RD</span>
            </h1>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="rounded-xl bg-white/5 p-2 text-slate-400"
            >
              <X size={21} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navegar("/perfil")}
            className="mt-6 flex w-full items-center gap-3 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 font-bold">
              DT
            </div>

            <div>
              <h2 className="font-semibold">Danny Torres</h2>
              <p className="text-sm text-slate-500">
                @dannytorres
              </p>
            </div>
          </button>
        </header>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          <button
            type="button"
            onClick={() => navegar("/")}
            className="flex w-full items-center gap-4 rounded-2xl bg-red-500/10 px-4 py-3.5 text-left font-medium text-red-400"
          >
            <House size={21} />
            Inicio
          </button>

          <button
            type="button"
            onClick={() => navegar("/perfil")}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-slate-300 hover:bg-white/5"
          >
            <UserRound size={21} />
            Mi perfil
          </button>

          <button
            type="button"
            onClick={() => navegar("/publicar")}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-slate-300 hover:bg-white/5"
          >
            <FilePlus2 size={21} />
            Crear publicación
          </button>

          <button
            type="button"
            onClick={() => navegar("/reportar")}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-slate-300 hover:bg-white/5"
          >
            <Megaphone size={21} />
            Crear reporte
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-slate-500"
            disabled
          >
            <span className="flex items-center gap-4">
              <Bell size={21} />
              Notificaciones
            </span>

            <span className="text-[10px] uppercase">
              Próximamente
            </span>
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-slate-500"
            disabled
          >
            <span className="flex items-center gap-4">
              <Users size={21} />
              Comunidades
            </span>

            <span className="text-[10px] uppercase">
              Próximamente
            </span>
          </button>
        </nav>

        <footer className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestLogout();
            }}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={21} />
            Cerrar sesión
          </button>
        </footer>
      </aside>
    </div>
  );
}
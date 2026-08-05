import { useState } from "react";
import {
  House,
  Image,
  Map,
  Megaphone,
  MessageCircle,
  PenLine,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [accionesAbiertas, setAccionesAbiertas] = useState(false);

  const navegar = (ruta) => {
    setAccionesAbiertas(false);
    navigate(ruta);
  };

  const estaActivo = (ruta) => {
    if (ruta === "/") return location.pathname === "/";
    return location.pathname.startsWith(ruta);
  };

  const abrirHistorias = () => {
    setAccionesAbiertas(false);
    navigate("/?crearHistoria=1");
  };

  return (
    <>
      {accionesAbiertas && (
        <button
          type="button"
          onClick={() => setAccionesAbiertas(false)}
          aria-label="Cerrar acciones"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <div
        className={`pointer-events-none fixed bottom-[5.8rem] left-1/2 z-[60] h-28 w-full max-w-sm -translate-x-1/2 transition lg:hidden ${
          accionesAbiertas ? "visible" : "invisible"
        }`}
      >
        <Accion
          abierto={accionesAbiertas}
          retraso="delay-0"
          posicion="bottom-0 left-7"
          cerrado="translate-x-20 translate-y-16"
          color="from-blue-500 to-cyan-500 shadow-blue-500/30"
          textoColor="text-blue-300"
          texto="Publicar"
          onClick={() => navegar("/publicar")}
        >
          <PenLine size={21} />
        </Accion>

        <Accion
          abierto={accionesAbiertas}
          retraso="delay-75"
          posicion="bottom-10 left-1/2 -translate-x-1/2"
          cerrado="translate-y-20"
          color="from-violet-500 to-fuchsia-500 shadow-violet-500/30"
          textoColor="text-violet-300"
          texto="Historia"
          onClick={abrirHistorias}
          destacado
        >
          <Image size={22} />
        </Accion>

        <Accion
          abierto={accionesAbiertas}
          retraso="delay-150"
          posicion="bottom-0 right-7"
          cerrado="-translate-x-20 translate-y-16"
          color="from-red-500 to-orange-500 shadow-red-500/30"
          textoColor="text-red-300"
          texto="Reportar"
          onClick={() => navegar("/reportar")}
        >
          <Megaphone size={22} />
        </Accion>
      </div>

      <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-white/10 bg-[#06101f]/95 px-3 pb-4 pt-3 text-white shadow-2xl shadow-black/40 backdrop-blur-xl lg:hidden">
        <Navegacion
          texto="Inicio"
          activo={estaActivo("/")}
          onClick={() => navegar("/")}
        >
          <House size={21} fill={estaActivo("/") ? "currentColor" : "none"} />
        </Navegacion>

        <Navegacion
          texto="Mapa"
          activo={estaActivo("/mapa")}
          onClick={() => navegar("/mapa")}
        >
          <Map size={21} />
        </Navegacion>

        <button
          type="button"
          onClick={() => setAccionesAbiertas((actual) => !actual)}
          aria-label={accionesAbiertas ? "Cerrar acciones" : "Crear"}
          aria-expanded={accionesAbiertas}
          className={`group relative -mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#06101f] bg-gradient-to-br from-red-500 via-red-500 to-orange-500 text-white shadow-xl transition-all duration-300 active:scale-90 ${
            accionesAbiertas
              ? "scale-110 shadow-red-500/50"
              : "shadow-red-500/30 hover:-translate-y-1"
          }`}
        >
          {!accionesAbiertas && (
            <span className="absolute inset-1 animate-ping rounded-full bg-red-400/20 [animation-duration:2.6s]" />
          )}

          <span className="absolute inset-1 rounded-full border border-white/15" />

          <Plus
            size={29}
            strokeWidth={2.6}
            className={`relative transition-transform duration-300 ${
              accionesAbiertas ? "rotate-45" : "rotate-0"
            }`}
          />
        </button>

        <Navegacion
          texto="Mensajes"
          activo={estaActivo("/mensajes")}
          onClick={() => navegar("/mensajes")}
        >
          <MessageCircle size={21} />
        </Navegacion>

        <Navegacion
          texto="Perfil"
          activo={estaActivo("/perfil")}
          onClick={() => navegar("/perfil")}
        >
          <UserRound size={21} />
        </Navegacion>
      </nav>
    </>
  );
}

function Navegacion({ children, texto, activo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-w-12 flex-col items-center gap-1 transition duration-200 active:scale-90 ${
        activo ? "text-red-500" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {activo && (
        <span className="absolute -top-3 h-0.5 w-7 rounded-full bg-red-500 shadow-lg shadow-red-500/60" />
      )}
      {children}
      <span className="text-[10px] font-medium">{texto}</span>
    </button>
  );
}

function Accion({
  children,
  abierto,
  retraso,
  posicion,
  cerrado,
  color,
  textoColor,
  texto,
  onClick,
  destacado = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto absolute flex flex-col items-center gap-2 transition-all duration-300 ease-out ${retraso} ${posicion} ${
        abierto
          ? "translate-y-0 scale-100 opacity-100"
          : `${cerrado} scale-50 opacity-0`
      }`}
    >
      <span
        className={`relative flex ${
          destacado ? "h-14 w-14" : "h-13 w-13"
        } items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br text-white shadow-xl transition hover:-translate-y-1 active:scale-90 ${color}`}
      >
        {children}
        {destacado && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#06101f] bg-amber-400 text-slate-950">
            <Sparkles size={10} />
          </span>
        )}
      </span>

      <span
        className={`rounded-full bg-[#0b1626]/95 px-2.5 py-1 text-[10px] font-semibold shadow-lg ${textoColor}`}
      >
        {texto}
      </span>
    </button>
  );
}
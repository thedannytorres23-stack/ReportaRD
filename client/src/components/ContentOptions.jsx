import { useState } from "react";
import {
  EyeOff,
  Flag,
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  Trash2,
  UserX,
  VolumeX,
  X,
} from "lucide-react";

const motivosReporte = [
  "Información falsa o engañosa",
  "Acoso o lenguaje ofensivo",
  "Contenido peligroso",
  "Spam o publicidad",
  "Otro motivo",
];

const obtenerLista = (clave) => {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
};

const agregarALista = (clave, valor) => {
  const lista = obtenerLista(clave);

  if (!lista.includes(valor)) {
    localStorage.setItem(clave, JSON.stringify([...lista, valor]));
  }
};

export default function ContentOptions({
  contenidoId,
  autor,
  tipo = "publicación",
  esPropio = false,
  onOcultar,
  onEditar,
  onEliminar,
}) {
  const esReporte = tipo === "reporte";
  const determinante = esReporte ? "este" : "esta";
  const participioOculto = esReporte ? "oculto" : "oculta";
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
  const [aviso, setAviso] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const mostrarAviso = (texto) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(""), 2300);
  };

  const solicitarAccion = (accion) => {
    setMenuAbierto(false);

    if (accion === "reportar") {
      setMostrarReporte(true);
      return;
    }

    if (accion === "editar") {
      onEditar?.();
      return;
    }

    setAccionPendiente(accion);
  };

  const confirmarAccion = async () => {
    if (!accionPendiente) return;

    try {
      setProcesando(true);
      setErrorAccion("");

      if (accionPendiente === "ocultar") {
        agregarALista("reportard_hidden_content", contenidoId);
        mostrarAviso(`${tipo} ${participioOculto}`);
      }

      if (accionPendiente === "silenciar") {
        agregarALista("reportard_muted_users", autor);
        mostrarAviso(`${autor} fue silenciado`);
      }

      if (accionPendiente === "bloquear") {
        agregarALista("reportard_blocked_users", autor);
        mostrarAviso(`${autor} fue bloqueado`);
      }

      if (accionPendiente === "eliminar") {
        if (!onEliminar) {
          throw new Error("Esta opción todavía no está disponible.");
        }

        await onEliminar();
        mostrarAviso(`${tipo} eliminada`);
      }

      const accionRealizada = accionPendiente;
      setAccionPendiente(null);

      window.setTimeout(() => {
        if (accionRealizada !== "eliminar") {
          onOcultar?.(accionRealizada);
        }
        window.dispatchEvent(
          new CustomEvent("reportard_moderation_changed", {
            detail: { accion: accionRealizada, contenidoId, autor },
          }),
        );
      }, 300);
    } catch (error) {
      setErrorAccion(error.message || "No se pudo completar la acción.");
    } finally {
      setProcesando(false);
    }
  };

  const enviarReporte = () => {
    if (!motivoSeleccionado) return;

    const reportes = obtenerLista("reportard_content_reports");

    localStorage.setItem(
      "reportard_content_reports",
      JSON.stringify([
        ...reportes,
        {
          id: Date.now(),
          contenidoId,
          autor,
          tipo,
          motivo: motivoSeleccionado,
          fecha: new Date().toISOString(),
          estado: "pendiente",
        },
      ]),
    );

    setMostrarReporte(false);
    setMotivoSeleccionado("");
    mostrarAviso("Reporte enviado para revisión");
  };

  const textosConfirmacion = {
    ocultar: {
      titulo: `¿Ocultar ${determinante} ${tipo}?`,
      descripcion:
        "Dejará de aparecer en tu feed, pero no será eliminada para los demás.",
      boton: "Ocultar",
    },
    silenciar: {
      titulo: `¿Silenciar a ${autor}?`,
      descripcion:
        "No verás sus publicaciones. Esta persona no recibirá ninguna notificación.",
      boton: "Silenciar",
    },
    bloquear: {
      titulo: `¿Bloquear a ${autor}?`,
      descripcion:
        "No podrá interactuar contigo y su contenido dejará de aparecer.",
      boton: "Bloquear",
    },
    eliminar: {
      titulo: `¿Eliminar ${determinante} ${tipo}?`,
      descripcion:
        "Esta acción no se puede deshacer y el contenido desaparecerá de tu perfil.",
      boton: "Eliminar",
    },
  };

  const confirmacion = textosConfirmacion[accionPendiente];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuAbierto((actual) => !actual)}
        aria-label={`Opciones de ${determinante} ${tipo}`}
        aria-expanded={menuAbierto}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition duration-200 active:scale-90 ${
          menuAbierto
            ? "bg-white/10 text-white"
            : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
        }`}
      >
        <MoreHorizontal size={20} />
      </button>

      {menuAbierto && (
        <>
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar opciones"
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="options-enter absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#101c2d]/98 p-1.5 text-white shadow-2xl shadow-black/60 backdrop-blur-xl">
            <div className="border-b border-white/5 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Opciones
              </p>
            </div>

            {esPropio ? (
              <>
                {onEditar && (
                  <Opcion
                    icono={Pencil}
                    texto="Editar contenido"
                    color="text-blue-400"
                    onClick={() => solicitarAccion("editar")}
                  />
                )}
                {onEliminar && (
                  <Opcion
                    icono={Trash2}
                    texto="Eliminar contenido"
                    color="text-red-400"
                    onClick={() => solicitarAccion("eliminar")}
                  />
                )}
              </>
            ) : (
              <>
                <Opcion
                  icono={EyeOff}
                  texto={`Ocultar ${tipo}`}
                  onClick={() => solicitarAccion("ocultar")}
                />
                <Opcion
                  icono={VolumeX}
                  texto={`Silenciar a ${autor.split(" ")[0]}`}
                  onClick={() => solicitarAccion("silenciar")}
                />
                <Opcion
                  icono={UserX}
                  texto={`Bloquear a ${autor.split(" ")[0]}`}
                  onClick={() => solicitarAccion("bloquear")}
                />
                <div className="my-1 h-px bg-white/5" />
                <Opcion
                  icono={Flag}
                  texto="Reportar contenido"
                  color="text-red-400"
                  onClick={() => solicitarAccion("reportar")}
                />
              </>
            )}
          </div>
        </>
      )}

      {confirmacion && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="options-modal-enter w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b1626] p-6 text-white shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
              <ShieldAlert size={23} />
            </div>

            <h2 className="mt-5 text-xl font-bold">{confirmacion.titulo}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {confirmacion.descripcion}
            </p>

            {errorAccion && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {errorAccion}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccionPendiente(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarAccion}
                disabled={procesando}
                className="rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-400 active:scale-[0.98]"
              >
                {procesando ? "Procesando…" : confirmacion.boton}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarReporte && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="options-modal-enter w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b1626] p-5 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Reportar contenido</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tu reporte será revisado de forma confidencial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarReporte(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {motivosReporte.map((motivo) => (
                <button
                  type="button"
                  key={motivo}
                  onClick={() => setMotivoSeleccionado(motivo)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    motivoSeleccionado === motivo
                      ? "border-red-500/40 bg-red-500/10 text-white"
                      : "border-white/5 bg-white/[0.03] text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`h-3 w-3 rounded-full border-2 ${
                      motivoSeleccionado === motivo
                        ? "border-red-400 bg-red-500"
                        : "border-slate-600"
                    }`}
                  />
                  {motivo}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={enviarReporte}
              disabled={!motivoSeleccionado}
              className="mt-5 w-full rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar reporte
            </button>
          </div>
        </div>
      )}

      {aviso && (
        <div className="notice-enter fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#101c2d] px-4 py-2.5 text-xs font-medium text-white shadow-2xl">
          {aviso}
        </div>
      )}

      <style>{`
        .options-enter {
          animation: optionsEnter 180ms cubic-bezier(.2,.8,.2,1) both;
          transform-origin: top right;
        }
        .options-modal-enter {
          animation: optionsModalEnter 260ms cubic-bezier(.2,.8,.2,1) both;
        }
        .notice-enter {
          animation: noticeEnter 220ms ease-out both;
        }
        @keyframes optionsEnter {
          from { opacity: 0; transform: translateY(-6px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes optionsModalEnter {
          from { opacity: 0; transform: translateY(18px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes noticeEnter {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .options-enter, .options-modal-enter, .notice-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function Opcion({ icono: Icono, texto, color = "text-slate-400", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/5 active:scale-[0.99]"
    >
      <Icono size={18} className={color} />
      <span className="truncate">{texto}</span>
    </button>
  );
}
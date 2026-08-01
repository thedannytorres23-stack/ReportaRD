import { ArrowLeft, FileQuestion } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import PostCard from "../components/PostCard";
import ReportCard from "../components/ReportCard";

const obtenerContenidoGuardado = () => {
  try {
    const contenido = localStorage.getItem(
      "reportard_selected_content",
    );

    return contenido ? JSON.parse(contenido) : null;
  } catch {
    return null;
  }
};

export default function ContentDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const contenido = location.state || obtenerContenidoGuardado();

  if (!contenido?.datos) {
    return (
      <div className="min-h-screen bg-slate-950 px-5 text-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-slate-500">
            <FileQuestion size={30} />
          </div>

          <h1 className="mt-5 text-xl font-bold">
            Contenido no disponible
          </h1>

          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
            Regresa al inicio y selecciona nuevamente la publicación o
            el reporte que deseas consultar.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold transition hover:bg-red-400"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const esReporte = contenido.tipo === "reporte";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-8">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#06101f]/95 px-4 py-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="font-bold">
              {esReporte ? "Detalle del reporte" : "Publicación"}
            </h1>

            <p className="text-xs text-slate-500">
              {esReporte
                ? "Evidencia y actividad ciudadana"
                : "Conversación de la comunidad"}
            </p>
          </div>
        </header>

        <main className="px-3 py-5">
          {esReporte ? (
            <ReportCard reporte={contenido.datos} modoDetalle />
          ) : (
            <PostCard publicacion={contenido.datos} modoDetalle />
          )}
        </main>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Globe2,
  ImagePlus,
  MapPin,
  Send,
  Video,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function CreatePost() {
  const navigate = useNavigate();
  const inputArchivo = useRef(null);

  const [contenido, setContenido] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [error, setError] = useState("");
  const [publicacionCreada, setPublicacionCreada] = useState(false);

  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  const abrirSelector = (tipo) => {
    if (!inputArchivo.current) return;

    inputArchivo.current.accept =
      tipo === "imagen" ? "image/*" : "video/*";

    inputArchivo.current.click();
  };

  const seleccionarArchivo = (event) => {
    const archivoSeleccionado = event.target.files[0];

    if (!archivoSeleccionado) return;

    const esImagen = archivoSeleccionado.type.startsWith("image/");
    const esVideo = archivoSeleccionado.type.startsWith("video/");

    if (!esImagen && !esVideo) {
      setError("Selecciona una imagen o un video válido.");
      return;
    }

    const limite = 25 * 1024 * 1024;

    if (archivoSeleccionado.size > limite) {
      setError("El archivo no puede superar los 25 MB.");
      return;
    }

    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setArchivo(archivoSeleccionado);
    setVistaPrevia(URL.createObjectURL(archivoSeleccionado));
    setError("");
  };

  const eliminarArchivo = () => {
    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setArchivo(null);
    setVistaPrevia("");
    inputArchivo.current.value = "";
  };

  const publicar = (event) => {
    event.preventDefault();

    if (!contenido.trim() && !archivo) {
      setError("Escribe algo o agrega una imagen o video.");
      return;
    }

    setError("");
    setPublicacionCreada(true);
  };

  const terminarPublicacion = () => {
    setPublicacionCreada(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#06101f]/95 px-4 py-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Volver al inicio"
            className="rounded-xl p-2 text-slate-300 hover:bg-white/5"
          >
            <ArrowLeft size={23} />
          </button>

          <h1 className="font-bold">Crear publicación</h1>

          <button
            type="submit"
            form="formulario-publicacion"
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold"
          >
            Publicar
          </button>
        </header>

        <form
          id="formulario-publicacion"
          onSubmit={publicar}
          className="px-5 py-6"
        >
          <section className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 font-bold">
              DT
            </div>

            <div>
              <h2 className="font-semibold">Danny Torres</h2>

              <button
                type="button"
                className="mt-1 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                <Globe2 size={13} />
                Público
              </button>
            </div>
          </section>

          <textarea
            value={contenido}
            onChange={(event) => {
              setContenido(event.target.value);
              setError("");
            }}
            placeholder="¿Qué quieres compartir con tu comunidad?"
            maxLength={1000}
            className="mt-6 min-h-40 w-full resize-none bg-transparent text-lg leading-7 text-white outline-none placeholder:text-slate-600"
          />

          <div className="text-right text-xs text-slate-600">
            {contenido.length}/1000
          </div>

          {vistaPrevia && (
            <section className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
              <button
                type="button"
                onClick={eliminarArchivo}
                aria-label="Eliminar archivo"
                className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white backdrop-blur"
              >
                <X size={19} />
              </button>

              {archivo?.type.startsWith("image/") ? (
                <img
                  src={vistaPrevia}
                  alt="Vista previa de la publicación"
                  className="max-h-96 w-full object-contain"
                />
              ) : (
                <video
                  src={vistaPrevia}
                  controls
                  className="max-h-96 w-full"
                />
              )}

              <div className="border-t border-white/10 px-4 py-3">
                <p className="truncate text-sm text-slate-300">
                  {archivo?.name}
                </p>
              </div>
            </section>
          )}

          {error && (
            <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <input
            ref={inputArchivo}
            type="file"
            onChange={seleccionarArchivo}
            className="hidden"
          />

          <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-sm font-medium">
              Agregar a tu publicación
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => abrirSelector("imagen")}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 px-3 py-4 text-xs text-slate-300 transition active:scale-95"
              >
                <ImagePlus size={23} className="text-green-400" />
                Imagen
              </button>

              <button
                type="button"
                onClick={() => abrirSelector("video")}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 px-3 py-4 text-xs text-slate-300 transition active:scale-95"
              >
                <Video size={23} className="text-blue-400" />
                Video
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 px-3 py-4 text-xs text-slate-300"
              >
                <MapPin size={23} className="text-red-400" />
                Ubicación
              </button>
            </div>
          </section>

          <button
            type="submit"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-semibold shadow-lg shadow-red-500/20 transition active:scale-[0.98]"
          >
            <Send size={20} />
            Compartir publicación
          </button>
        </form>
      </div>

      {publicacionCreada && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b1626] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400">
              <Send size={25} />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Publicación preparada
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              La vista previa funciona correctamente. Cuando conectemos el
              backend, esta publicación se guardará y aparecerá en el feed.
            </p>

            <button
              type="button"
              onClick={terminarPublicacion}
              className="mt-6 w-full rounded-2xl bg-red-500 px-5 py-3 font-semibold"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
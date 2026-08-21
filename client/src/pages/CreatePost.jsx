import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Globe2,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Send,
  Video,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { crearPublicacion } from "../services/contentService";

const perfilInicial = {
  nombre: "Ciudadano ReportaRD",
  usuario: "ciudadano",
  foto: "",
};

const obtenerSesion = () => {
  try {
    const token = localStorage.getItem("reportard_token") || "";
    const datosUsuario = localStorage.getItem("reportard_user");

    return {
      token,
      usuario: datosUsuario
        ? { ...perfilInicial, ...JSON.parse(datosUsuario) }
        : perfilInicial,
    };
  } catch {
    return { token: "", usuario: perfilInicial };
  }
};

const obtenerIniciales = (nombre = "") => {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("") || "RD";
};

export default function CreatePost() {
  const navigate = useNavigate();
  const inputArchivo = useRef(null);
  const [sesion] = useState(obtenerSesion);
  const [contenido, setContenido] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [error, setError] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [publicacionCreada, setPublicacionCreada] = useState(false);

  const { token, usuario } = sesion;
  const iniciales = obtenerIniciales(usuario.nombre);

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  const abrirSelector = (tipo) => {
    if (!inputArchivo.current || publicando) return;

    inputArchivo.current.accept =
      tipo === "imagen" ? "image/*" : "video/*";
    inputArchivo.current.click();
  };

  const seleccionarArchivo = (event) => {
    const archivoSeleccionado = event.target.files?.[0];
    if (!archivoSeleccionado) return;

    const esImagen = archivoSeleccionado.type.startsWith("image/");
    const esVideo = archivoSeleccionado.type.startsWith("video/");

    if (!esImagen && !esVideo) {
      setError("Selecciona una imagen o un video válido.");
      return;
    }

    if (archivoSeleccionado.size > 25 * 1024 * 1024) {
      setError("El archivo no puede superar los 25 MB.");
      return;
    }

    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);

    setArchivo(archivoSeleccionado);
    setVistaPrevia(URL.createObjectURL(archivoSeleccionado));
    setError("");
  };

  const eliminarArchivo = () => {
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);

    setArchivo(null);
    setVistaPrevia("");
    if (inputArchivo.current) inputArchivo.current.value = "";
  };

  const publicar = async (event) => {
    event.preventDefault();
    const texto = contenido.trim();

    if (!texto) {
      setError("Escribe algo para compartir con tu comunidad.");
      return;
    }

    if (archivo) {
      setError(
        "La publicación de fotos y videos necesita almacenamiento multimedia. Elimina el archivo y publica el texto por ahora.",
      );
      return;
    }

    if (!token) {
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
      return;
    }

    try {
      setPublicando(true);
      setError("");

      await crearPublicacion(token, {
        contenido: texto,
        comunidad: "Comunidad ReportaRD",
        mediaUrl: "",
        mediaTipo: "",
      });

      setPublicacionCreada(true);
    } catch (errorSolicitud) {
      setError(errorSolicitud.message);
    } finally {
      setPublicando(false);
    }
  };

  const terminarPublicacion = () => {
    navigate("/", { replace: true });
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
            disabled={publicando}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publicando ? "Guardando…" : "Publicar"}
          </button>
        </header>

        <form
          id="formulario-publicacion"
          onSubmit={publicar}
          className="px-5 py-6"
        >
          <section className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-red-500 font-bold">
              {usuario.foto ? (
                <img
                  src={usuario.foto}
                  alt={`Foto de ${usuario.nombre}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                iniciales
              )}
            </div>

            <div>
              <h2 className="font-semibold">{usuario.nombre}</h2>
              <span className="mt-1 flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <Globe2 size={13} />
                Público
              </span>
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
            disabled={publicando}
            className="mt-6 min-h-40 w-full resize-none bg-transparent text-lg leading-7 text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
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
                <video src={vistaPrevia} controls className="max-h-96 w-full" />
              )}

              <div className="border-t border-white/10 px-4 py-3">
                <p className="truncate text-sm text-slate-300">{archivo?.name}</p>
                <p className="mt-1 text-xs text-amber-300">
                  Vista previa local; todavía no se puede guardar este archivo.
                </p>
              </div>
            </section>
          )}

          {error && (
            <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
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
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Agregar a tu publicación</p>
              <span className="text-[10px] text-slate-500">Vista previa</span>
            </div>

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
                onClick={() => setError("La ubicación se conectará junto con el mapa ciudadano.")}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 px-3 py-4 text-xs text-slate-300"
              >
                <MapPin size={23} className="text-red-400" />
                Ubicación
              </button>
            </div>
          </section>

          <button
            type="submit"
            disabled={publicando}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-semibold shadow-lg shadow-red-500/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publicando ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
            {publicando ? "Publicando…" : "Compartir publicación"}
          </button>
        </form>
      </div>

      {publicacionCreada && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-400/15 bg-[#0b1626] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Send size={25} />
            </div>

            <h2 className="mt-5 text-xl font-bold">Publicación guardada</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Ya está en MongoDB y aparecerá al principio del feed.
            </p>

            <button
              type="button"
              onClick={terminarPublicacion}
              className="mt-6 w-full rounded-2xl bg-red-500 px-5 py-3 font-semibold"
            >
              Ver en el feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
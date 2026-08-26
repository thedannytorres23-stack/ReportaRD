import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Image,
  LoaderCircle,
  Send,
  Video,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import {
  crearPublicacion,
  editarPublicacion,
  obtenerPublicacion,
  subirArchivo,
} from "../services/contentService";

const obtenerToken = () => {
  return localStorage.getItem("reportard_token") || "";
};

const obtenerUsuarioActual = () => {
  try {
    return JSON.parse(
      localStorage.getItem("reportard_user") || "{}"
    );
  } catch {
    return {};
  }
};

export default function CreatePost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const publicacionId = searchParams.get("editar");
  const modoEdicion = Boolean(publicacionId);

  const token = useMemo(obtenerToken, []);
  const usuarioActual = useMemo(obtenerUsuarioActual, []);

  const [contenido, setContenido] = useState("");
  const [titulo, setTitulo] = useState("");
  const [comunidad, setComunidad] = useState("");

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaTipo, setMediaTipo] = useState("");

  const [archivoSeleccionado, setArchivoSeleccionado] =
    useState(null);

  const [vistaPrevia, setVistaPrevia] = useState("");

  const inputImagenRef = useRef(null);
  const inputVideoRef = useRef(null);

  const [cargando, setCargando] = useState(false);
  const [cargandoPublicacion, setCargandoPublicacion] =
    useState(modoEdicion);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!modoEdicion) return undefined;

    if (!token) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let activo = true;

    const cargarPublicacion = async () => {
      try {
        setCargandoPublicacion(true);
        setError("");

        const respuesta = await obtenerPublicacion(
          token,
          publicacionId
        );

        if (!activo) return;

        const publicacion = respuesta.publicacion;

        const miId = String(
          usuarioActual._id || usuarioActual.id || ""
        );

        const autorId = String(
          publicacion.autor?._id ||
            publicacion.autor?.id ||
            publicacion.autor ||
            ""
        );

        if (!miId || miId !== autorId) {
          setError(
            "No tienes permiso para editar esta publicación."
          );
          return;
        }

        setTitulo(publicacion.titulo || "");
        setContenido(publicacion.contenido || "");
        setComunidad(publicacion.comunidad || "");
        setMediaUrl(publicacion.mediaUrl || "");
        setMediaTipo(publicacion.mediaTipo || "");
        setVistaPrevia(publicacion.mediaUrl || "");
      } catch (errorSolicitud) {
        if (!activo) return;

        setError(
          errorSolicitud.message ||
            "No se pudo cargar la publicación."
        );
      } finally {
        if (activo) {
          setCargandoPublicacion(false);
        }
      }
    };

    cargarPublicacion();

    return () => {
      activo = false;
    };
  }, [
    modoEdicion,
    navigate,
    publicacionId,
    token,
    usuarioActual,
  ]);

  useEffect(() => {
    return () => {
      if (
        vistaPrevia &&
        vistaPrevia.startsWith("blob:")
      ) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  const seleccionarArchivo = (evento) => {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      setError(
        "Formato no permitido. Usa JPG, PNG, WEBP, MP4, WEBM o MOV."
      );
      evento.target.value = "";
      return;
    }

    if (archivo.size > 25 * 1024 * 1024) {
      setError(
        "El archivo supera el límite de 25 MB."
      );
      evento.target.value = "";
      return;
    }

    if (
      vistaPrevia &&
      vistaPrevia.startsWith("blob:")
    ) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setArchivoSeleccionado(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
    setMediaTipo(
      archivo.type.startsWith("video/")
        ? "video"
        : "imagen"
    );
    setError("");
  };

  const quitarMultimedia = () => {
    if (
      vistaPrevia &&
      vistaPrevia.startsWith("blob:")
    ) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setArchivoSeleccionado(null);
    setVistaPrevia("");
    setMediaUrl("");
    setMediaTipo("");

    if (inputImagenRef.current) {
      inputImagenRef.current.value = "";
    }

    if (inputVideoRef.current) {
      inputVideoRef.current.value = "";
    }
  };

  const publicar = async (evento) => {
    evento.preventDefault();

    const contenidoLimpio = contenido.trim();

    if (!contenidoLimpio) {
      setError("Escribe algo para publicar.");
      return;
    }

    if (!token) {
      setError(
        "Tu sesión expiró. Inicia sesión nuevamente."
      );
      return;
    }

    try {
      setCargando(true);
      setError("");
      setMensaje("");

      let mediaUrlFinal = mediaUrl;
      let mediaTipoFinal = mediaTipo;

      if (archivoSeleccionado) {
        const respuestaSubida = await subirArchivo(
          token,
          archivoSeleccionado
        );

        mediaUrlFinal =
          respuestaSubida.archivo?.url || "";

        mediaTipoFinal =
          respuestaSubida.archivo?.tipo || "";
      }

      const datos = {
        titulo: titulo.trim(),
        contenido: contenidoLimpio,
        comunidad: comunidad.trim(),
        mediaUrl: mediaUrlFinal || null,
        mediaTipo: mediaTipoFinal || null,
      };

      if (modoEdicion) {
        await editarPublicacion(
          token,
          publicacionId,
          datos
        );

        setMensaje(
          "Publicación actualizada correctamente."
        );
      } else {
        await crearPublicacion(token, datos);

        setMensaje(
          "Publicación creada correctamente."
        );
      }

      window.setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
    } catch (errorSolicitud) {
      setError(
        errorSolicitud.message ||
          "No se pudo guardar la publicación."
      );
    } finally {
      setCargando(false);
    }
  };

  if (cargandoPublicacion) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-[#06101f]">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <LoaderCircle
              size={28}
              className="animate-spin"
            />

            <p className="text-sm">
              Cargando publicación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-24">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#06101f]/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07]"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="font-bold">
                {modoEdicion
                  ? "Editar publicación"
                  : "Crear publicación"}
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                {modoEdicion
                  ? "Actualiza el contenido de tu publicación"
                  : "Comparte algo con tu comunidad"}
              </p>
            </div>
          </div>
        </header>

        <main className="px-5 py-5">
          <form
            onSubmit={publicar}
            className="space-y-5"
          >
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <label
                htmlFor="titulo"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Título opcional
              </label>

              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(evento) =>
                  setTitulo(evento.target.value)
                }
                placeholder="Ej. Jornada comunitaria"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
              />

              <label
                htmlFor="contenido"
                className="mt-5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Publicación
              </label>

              <textarea
                id="contenido"
                value={contenido}
                onChange={(evento) =>
                  setContenido(evento.target.value)
                }
                placeholder="¿Qué quieres compartir?"
                rows={8}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
              />
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <label
                htmlFor="comunidad"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Comunidad
              </label>

              <input
                id="comunidad"
                type="text"
                value={comunidad}
                onChange={(evento) =>
                  setComunidad(evento.target.value)
                }
                placeholder="Ej. Comunidad ReportaRD"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
              />
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Multimedia
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Agrega una foto o video. El archivo se subirá de forma segura al publicar.
              </p>

              <input
                ref={inputImagenRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={seleccionarArchivo}
                className="hidden"
              />

              <input
                ref={inputVideoRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={seleccionarArchivo}
                className="hidden"
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    inputImagenRef.current?.click()
                  }
                  disabled={cargando}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
                >
                  <Image size={18} />
                  Imagen
                </button>

                <button
                  type="button"
                  onClick={() =>
                    inputVideoRef.current?.click()
                  }
                  disabled={cargando}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
                >
                  <Video size={18} />
                  Video
                </button>
              </div>

              {vistaPrevia && (
                <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <button
                    type="button"
                    onClick={quitarMultimedia}
                    aria-label="Quitar archivo"
                    className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                  >
                    <X size={17} />
                  </button>

                  {mediaTipo === "video" ? (
                    <video
                      src={vistaPrevia}
                      controls
                      className="max-h-[420px] w-full bg-black object-contain"
                    />
                  ) : (
                    <img
                      src={vistaPrevia}
                      alt="Vista previa"
                      className="max-h-[420px] w-full object-cover"
                    />
                  )}

                  {archivoSeleccionado && (
                    <div className="border-t border-white/10 px-3 py-2 text-[11px] text-slate-500">
                      {archivoSeleccionado.name} ·{" "}
                      {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                </div>
              )}
            </section>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-4 font-bold text-white transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />

                  {archivoSeleccionado
                    ? "Subiendo archivo..."
                    : modoEdicion
                      ? "Guardando..."
                      : "Publicando..."}
                </>
              ) : (
                <>
                  <Send size={18} />

                  {modoEdicion
                    ? "Guardar cambios"
                    : "Publicar"}
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
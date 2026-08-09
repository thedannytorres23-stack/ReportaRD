import { useState } from "react";
import {
  AlignLeft,
  ArrowLeft,
  AtSign,
  Camera,
  Image,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router";
import { actualizarMiPerfil } from "../services/authService";

const usuarioVacio = {
  nombre: "",
  usuario: "",
  biografia: "",
  ubicacion: "República Dominicana",
  foto: "",
  portada: "",
};

const obtenerUsuarioAutenticado = () => {
  try {
    const datos = localStorage.getItem("reportard_user");
    return datos
      ? { ...usuarioVacio, ...JSON.parse(datos) }
      : usuarioVacio;
  } catch {
    return usuarioVacio;
  }
};

const obtenerIniciales = (nombre) => {
  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");

  return iniciales || "U";
};

export default function EditProfile() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(obtenerUsuarioAutenticado);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;

    setPerfil((perfilActual) => ({
      ...perfilActual,
      [name]: value,
    }));

    setError("");
    setMensaje("");
  };

  const convertirImagen = (archivo, campo) => {
    if (!archivo) return;

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

    if (!tiposPermitidos.includes(archivo.type)) {
      setError("Selecciona una imagen JPG, PNG o WEBP.");
      return;
    }

    if (archivo.size > 1024 * 1024) {
      setError("Cada imagen debe pesar menos de 1 MB.");
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      setPerfil((perfilActual) => ({
        ...perfilActual,
        [campo]: lector.result,
      }));
      setError("");
    };

    lector.onerror = () => {
      setError("No se pudo leer la imagen seleccionada.");
    };

    lector.readAsDataURL(archivo);
  };

  const guardarPerfil = async (evento) => {
    evento.preventDefault();

    const token = localStorage.getItem("reportard_token");
    const nombre = perfil.nombre.trim();
    const usuario = perfil.usuario
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    if (!token) {
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
      return;
    }

    if (!nombre || !usuario) {
      setError("El nombre y el nombre de usuario son obligatorios.");
      return;
    }

    if (!/^[a-z0-9._]{3,30}$/.test(usuario)) {
      setError(
        "El usuario debe tener entre 3 y 30 caracteres y solo puede contener letras, números, puntos o guiones bajos.",
      );
      return;
    }

    if (perfil.biografia.trim().length > 160) {
      setError("La biografía no puede superar los 160 caracteres.");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const respuesta = await actualizarMiPerfil(
        {
          nombre,
          usuario,
          biografia: perfil.biografia.trim(),
          ubicacion: perfil.ubicacion.trim(),
          foto: perfil.foto || "",
          portada: perfil.portada || "",
        },
        token,
      );

      localStorage.setItem(
        "reportard_user",
        JSON.stringify(respuesta.usuario),
      );
      localStorage.removeItem("reportard_profile");

      setPerfil((perfilActual) => ({
        ...perfilActual,
        ...respuesta.usuario,
      }));
      setMensaje("Perfil actualizado correctamente.");

      window.setTimeout(() => {
        navigate("/perfil", { replace: true });
      }, 550);
    } catch (errorGuardado) {
      setError(
        errorGuardado.message || "No se pudo actualizar el perfil.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const iniciales = obtenerIniciales(perfil.nombre);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-10">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#06101f]/95 px-4 py-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="text-center">
            <h1 className="font-bold">Editar perfil</h1>
            <p className="text-xs text-slate-500">Datos de tu cuenta real</p>
          </div>

          <div className="h-10 w-10" />
        </header>

        <form onSubmit={guardarPerfil}>
          <section className="relative">
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-red-950">
              {perfil.portada && (
                <img
                  src={perfil.portada}
                  alt="Vista previa de la portada"
                  className="h-full w-full object-cover"
                />
              )}

              <label className="absolute right-4 top-4 flex cursor-pointer items-center gap-2 rounded-xl bg-black/60 px-3 py-2 text-xs font-medium backdrop-blur transition hover:bg-black/75">
                <Image size={16} />
                Cambiar portada
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={guardando}
                  onChange={(evento) =>
                    convertirImagen(evento.target.files?.[0], "portada")
                  }
                  className="hidden"
                />
              </label>
            </div>

            <div className="px-5">
              <div className="relative z-10 -mt-14 h-28 w-28">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-[#06101f] bg-gradient-to-br from-blue-500 to-red-500 text-3xl font-bold shadow-xl">
                  {perfil.foto ? (
                    <img
                      src={perfil.foto}
                      alt="Vista previa del perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    iniciales
                  )}
                </div>

                <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#06101f] bg-blue-500 text-white transition hover:bg-blue-400">
                  <Camera size={17} />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={guardando}
                    onChange={(evento) =>
                      convertirImagen(evento.target.files?.[0], "foto")
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>

          <main className="space-y-5 px-5 pt-7">
            <div>
              <label htmlFor="nombre" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <UserRound size={17} className="text-blue-400" />
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={perfil.nombre}
                onChange={actualizarCampo}
                disabled={guardando}
                maxLength={60}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="usuario" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <AtSign size={17} className="text-violet-400" />
                Nombre de usuario
              </label>
              <div className="flex rounded-2xl border border-white/10 bg-white/5 focus-within:border-blue-500/50">
                <span className="flex items-center pl-4 text-sm text-slate-500">@</span>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  value={perfil.usuario}
                  onChange={actualizarCampo}
                  disabled={guardando}
                  maxLength={30}
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 pr-4 text-sm text-white outline-none disabled:opacity-60"
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">Letras, números, puntos y guiones bajos.</p>
            </div>

            <div>
              <label htmlFor="biografia" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <AlignLeft size={17} className="text-green-400" />
                Biografía
              </label>
              <textarea
                id="biografia"
                name="biografia"
                value={perfil.biografia}
                onChange={actualizarCampo}
                disabled={guardando}
                maxLength={160}
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-blue-500/50 disabled:opacity-60"
              />
              <p className="mt-2 text-right text-xs text-slate-600">{perfil.biografia.length}/160</p>
            </div>

            <div>
              <label htmlFor="ubicacion" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <MapPin size={17} className="text-red-400" />
                Ubicación
              </label>
              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                value={perfil.ubicacion}
                onChange={actualizarCampo}
                disabled={guardando}
                maxLength={70}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 disabled:opacity-60"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-red-500 px-5 py-3.5 font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={19} />
              {guardando ? "Guardando en MongoDB..." : "Guardar cambios"}
            </button>
          </main>
        </form>
      </div>
    </div>
  );
}
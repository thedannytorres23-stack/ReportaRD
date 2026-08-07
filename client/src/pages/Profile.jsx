import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Pencil,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router";

const usuarioVacio = {
  nombre: "Usuario",
  usuario: "usuario",
  biografia: "",
  ubicacion: "República Dominicana",
  foto: "",
  portada: "",
  activo: false,
  rol: "usuario",
  createdAt: null,
};

const publicaciones = [];

const obtenerUsuarioAutenticado = () => {
  try {
    const datos = localStorage.getItem("reportard_user");

    return datos
      ? {
          ...usuarioVacio,
          ...JSON.parse(datos),
        }
      : usuarioVacio;
  } catch {
    return usuarioVacio;
  }
};

const obtenerIniciales = (nombre) => {
  const palabras = nombre.trim().split(/\s+/);

  return palabras
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
};

export default function Profile() {
  const navigate = useNavigate();

  const [perfil] = useState(obtenerUsuarioAutenticado);

  const [seccionActiva, setSeccionActiva] =
    useState("publicaciones");

  const iniciales = obtenerIniciales(perfil.nombre);

  const estadisticas = {
    seguidores: perfil.totalSeguidores ?? 0,
    siguiendo: perfil.totalSiguiendo ?? 0,
    comunidades: perfil.totalComunidades ?? 0,
    reportes: perfil.totalReportes ?? 0,
  };

  const fechaRegistro = perfil.createdAt
    ? new Intl.DateTimeFormat("es-DO", {
        month: "long",
        year: "numeric",
      }).format(new Date(perfil.createdAt))
    : "Fecha no disponible";

  const nombreRol =
    perfil.rol === "administrador"
      ? "Administrador"
      : perfil.rol === "moderador"
        ? "Moderador"
        : "Ciudadano";

  const contenidoVisible = publicaciones.filter((elemento) => {
    if (seccionActiva === "publicaciones") {
      return true;
    }

    if (seccionActiva === "reportes") {
      return elemento.tipo === "reporte";
    }

    return false;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-10">
        <header className="absolute left-1/2 top-0 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Volver al inicio"
            className="rounded-full bg-black/40 p-2.5 text-white backdrop-blur"
          >
            <ArrowLeft size={21} />
          </button>

          <button
            type="button"
            aria-label="Configuración"
            className="rounded-full bg-black/40 p-2.5 text-white backdrop-blur"
          >
            <Settings size={21} />
          </button>
        </header>

        <section className="relative">
          <div className="relative h-44 bg-gradient-to-br from-blue-900 via-slate-900 to-red-950">
            {perfil.portada && (
              <img
                src={perfil.portada}
                alt="Portada del perfil"
                className="h-full w-full object-cover"
              />
            )}

            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />
          </div>

          <div className="px-5">
            <div className="relative z-10 -mt-14 flex items-end justify-between">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#06101f] bg-gradient-to-br from-blue-500 to-red-500 text-3xl font-bold shadow-xl">
                {perfil.foto ? (
                  <img
                    src={perfil.foto}
                    alt={`Foto de ${perfil.nombre}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  iniciales
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate("/editar-perfil")}
                className="mb-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"
              >
                <Pencil size={16} />
                Editar perfil
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {perfil.nombre}
                </h1>

                {perfil.rol !== "usuario" && (
                  <CheckCircle2
                    size={20}
                    className="text-blue-400"
                    fill="currentColor"
                    strokeWidth={3}
                  />
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                @{perfil.usuario}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {perfil.biografia ||
                  "Este usuario todavía no ha agregado una biografía."}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin
                  size={16}
                  className="text-red-400"
                />

                {perfil.ubicacion ||
                  "Ubicación no especificada"}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.035] py-4 text-center">
              <button
                type="button"
                onClick={() =>
                  navigate("/personas?vista=seguidores")
                }
                className="transition hover:text-blue-400"
              >
                <strong className="block text-lg">
                  {estadisticas.seguidores}
                </strong>

                <span className="text-[10px] text-slate-500">
                  Seguidores
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/personas?vista=siguiendo")
                }
                className="transition hover:text-blue-400"
              >
                <strong className="block text-lg">
                  {estadisticas.siguiendo}
                </strong>

                <span className="text-[10px] text-slate-500">
                  Siguiendo
                </span>
              </button>

              <button type="button">
                <strong className="block text-lg">
                  {estadisticas.comunidades}
                </strong>

                <span className="text-[10px] text-slate-500">
                  Comunidades
                </span>
              </button>

              <button type="button">
                <strong className="block text-lg">
                  {estadisticas.reportes}
                </strong>

                <span className="text-[10px] text-slate-500">
                  Reportes
                </span>
              </button>
            </div>
          </div>
        </section>

        <section className="mx-5 mt-6 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-red-500/5 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Identidad ciudadana
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {nombreRol}
              </h2>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                perfil.activo
                  ? "bg-green-500/15 text-green-400"
                  : "bg-slate-500/15 text-slate-400"
              }`}
            >
              <Activity size={23} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-xs text-slate-300">
              <ShieldCheck
                size={16}
                className={
                  perfil.activo
                    ? "text-green-400"
                    : "text-slate-500"
                }
              />
              {perfil.activo ? "Cuenta activa" : "Cuenta inactiva"}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-xs text-slate-300">
              <CalendarDays
                size={16}
                className="text-blue-400"
              />
              Desde {fechaRegistro}
            </div>
          </div>
        </section>

        <section className="mt-7">
          <nav className="grid grid-cols-3 border-b border-white/10 px-5">
            <button
              type="button"
              onClick={() =>
                setSeccionActiva("publicaciones")
              }
              className={`border-b-2 px-2 pb-3 text-sm font-medium ${
                seccionActiva === "publicaciones"
                  ? "border-red-500 text-white"
                  : "border-transparent text-slate-500"
              }`}
            >
              Publicaciones
            </button>

            <button
              type="button"
              onClick={() => setSeccionActiva("reportes")}
              className={`border-b-2 px-2 pb-3 text-sm font-medium ${
                seccionActiva === "reportes"
                  ? "border-red-500 text-white"
                  : "border-transparent text-slate-500"
              }`}
            >
              Reportes
            </button>

            <button
              type="button"
              onClick={() => setSeccionActiva("guardados")}
              className={`flex items-center justify-center gap-1 border-b-2 px-2 pb-3 text-sm font-medium ${
                seccionActiva === "guardados"
                  ? "border-red-500 text-white"
                  : "border-transparent text-slate-500"
              }`}
            >
              <Bookmark size={15} />
              Guardados
            </button>
          </nav>

          <div className="space-y-3 px-5 py-5">
            {seccionActiva === "guardados" ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center">
                <Bookmark
                  size={32}
                  className="mx-auto text-slate-600"
                />

                <h3 className="mt-4 font-semibold">
                  No hay publicaciones guardadas
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Las publicaciones que guardes aparecerán aquí.
                </p>
              </div>
            ) : contenidoVisible.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center">
                {seccionActiva === "reportes" ? (
                  <MapPin
                    size={32}
                    className="mx-auto text-slate-600"
                  />
                ) : (
                  <Pencil
                    size={32}
                    className="mx-auto text-slate-600"
                  />
                )}

                <h3 className="mt-4 font-semibold">
                  {seccionActiva === "reportes"
                    ? "Todavía no has creado reportes"
                    : "Todavía no has publicado contenido"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {seccionActiva === "reportes"
                    ? "Tus reportes reales aparecerán aquí cuando los conectemos con el backend."
                    : "Tus publicaciones reales aparecerán aquí cuando las conectemos con el backend."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      seccionActiva === "reportes"
                        ? "/reportar"
                        : "/publicar",
                    )
                  }
                  className="mt-5 rounded-2xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
                >
                  {seccionActiva === "reportes"
                    ? "Crear reporte"
                    : "Crear publicación"}
                </button>
              </div>
            ) : (
              contenidoVisible.map((elemento) => (
                <article
                  key={elemento.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={`text-xs font-semibold ${
                          elemento.tipo === "reporte"
                            ? "text-red-400"
                            : "text-blue-400"
                        }`}
                      >
                        {elemento.tipo === "reporte"
                          ? "REPORTE"
                          : "PUBLICACIÓN"}
                      </span>

                      <h3 className="mt-2 font-semibold">
                        {elemento.titulo}
                      </h3>

                      <p className="mt-2 text-xs text-slate-500">
                        {elemento.fecha} ·{" "}
                        {elemento.interacciones}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                      {elemento.estado}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
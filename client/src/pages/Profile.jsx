import { useEffect, useMemo, useState } from "react";
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
  Sparkles,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  listarPublicaciones,
  listarReportes,
} from "../services/contentService";

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


const calcularProgreso = ({
  publicaciones = 0,
  reportes = 0,
}) => {
  const xp =
    publicaciones * 10 +
    reportes * 25;

  const niveles = [
    {
      nivel: 1,
      nombre: "Ciudadano",
      xpMinimo: 0,
      xpSiguiente: 100,
    },
    {
      nivel: 2,
      nombre: "Colaborador",
      xpMinimo: 100,
      xpSiguiente: 250,
    },
    {
      nivel: 3,
      nombre: "Reportero",
      xpMinimo: 250,
      xpSiguiente: 500,
    },
    {
      nivel: 4,
      nombre: "Verificador",
      xpMinimo: 500,
      xpSiguiente: 1000,
    },
    {
      nivel: 5,
      nombre: "Líder comunitario",
      xpMinimo: 1000,
      xpSiguiente: 2000,
    },
    {
      nivel: 6,
      nombre: "Guardián ciudadano",
      xpMinimo: 2000,
      xpSiguiente: null,
    },
  ];

  const rango =
    [...niveles]
      .reverse()
      .find(
        (nivel) => xp >= nivel.xpMinimo,
      ) || niveles[0];

  const progreso = rango.xpSiguiente
    ? Math.min(
      100,
      Math.round(
        ((xp - rango.xpMinimo) /
          (rango.xpSiguiente -
            rango.xpMinimo)) *
        100,
      ),
    )
    : 100;

  return {
    xp,
    ...rango,
    progreso,
  };
};


const obtenerEmblemaNivel = (nivel) => {
  if (nivel >= 6) return "🛡️";
  if (nivel === 5) return "⭐";
  if (nivel === 4) return "✓";
  if (nivel === 3) return "📍";
  if (nivel === 2) return "🤝";
  return "👤";
};

const obtenerClaveNivelVisto = (perfil) => {
  const identificador =
    perfil._id || perfil.id || perfil.usuario || "usuario";
  return `reportard_last_level_seen_${identificador}`;
};


export default function Profile() {
  const navigate = useNavigate();

const [perfil, setPerfil] = useState(obtenerUsuarioAutenticado);

  const [celebracionNivel, setCelebracionNivel] =
    useState(null);

  const [progresoAnimado, setProgresoAnimado] =
    useState(0);

  const [publicacionesReales, setPublicacionesReales] =
    useState([]);

  const [reportesReales, setReportesReales] =
    useState([]);

  const [cargandoContenido, setCargandoContenido] =
    useState(true);

  const [seccionActiva, setSeccionActiva] =
    useState("publicaciones");

  const iniciales = obtenerIniciales(perfil.nombre);

  useEffect(() => {
  let activo = true;

  const cargarPerfilActualizado = async () => {
    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token) return;

    try {
      const API_URL = (
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api"
      ).replace(/\/$/, "");

      const respuesta = await fetch(
        `${API_URL}/auth/perfil`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No se pudo cargar el perfil.",
        );
      }

      if (!activo) return;

      setPerfil((actual) => ({
        ...actual,
        ...datos.usuario,
      }));

      localStorage.setItem(
        "reportard_user",
        JSON.stringify(datos.usuario),
      );
    } catch (error) {
      console.error(
        "Error actualizando perfil:",
        error,
      );
    }
  };

  cargarPerfilActualizado();

  return () => {
    activo = false;
  };
}, []);

  useEffect(() => {
    let activo = true;

    const cargarContenido = async () => {
      const token =
        localStorage.getItem("reportard_token") || "";

      if (!token) {
        setCargandoContenido(false);
        return;
      }

      try {
        const [
          respuestaPublicaciones,
          respuestaReportes,
        ] = await Promise.all([
          listarPublicaciones(token),
          listarReportes(token),
        ]);

        if (!activo) return;

        const miId = String(
          perfil._id || perfil.id || "",
        );

        const misPublicaciones = (
          respuestaPublicaciones.publicaciones || []
        ).filter(
          (publicacion) =>
            String(
              publicacion.autor?._id ||
              publicacion.autor,
            ) === miId,
        );

        const misReportes = (
          respuestaReportes.reportes || []
        ).filter(
          (reporte) =>
            String(
              reporte.autor?._id ||
              reporte.autor,
            ) === miId,
        );

        setPublicacionesReales(misPublicaciones);
        setReportesReales(misReportes);
      } catch (error) {
        console.error(
          "Error cargando contenido del perfil:",
          error,
        );
      } finally {
        if (activo) {
          setCargandoContenido(false);
        }
      }
    };

    cargarContenido();

    return () => {
      activo = false;
    };
  }, [perfil]);


  const progresoCiudadano = useMemo(
    () =>
      calcularProgreso({
        publicaciones:
          publicacionesReales.length,
        reportes: reportesReales.length,
      }),
    [
      publicacionesReales.length,
      reportesReales.length,
    ],
  );

 const estadisticas = {
  seguidores:
    perfil.totalSeguidores ?? 0,

  siguiendo:
    perfil.totalSeguidos ?? 0,

  comunidades:
    perfil.totalComunidades ?? 0,

  reportes:
    reportesReales.length,
};
  useEffect(() => {
    if (cargandoContenido) return undefined;

    setProgresoAnimado(0);

    const temporizador = window.setTimeout(() => {
      setProgresoAnimado(progresoCiudadano.progreso);
    }, 120);

    return () => window.clearTimeout(temporizador);
  }, [cargandoContenido, progresoCiudadano.progreso]);

  useEffect(() => {
    if (cargandoContenido) return undefined;

    const claveNivel = obtenerClaveNivelVisto(perfil);
    const valorGuardado = localStorage.getItem(claveNivel);
    const nivelActual = progresoCiudadano.nivel;

    if (valorGuardado === null) {
      localStorage.setItem(claveNivel, String(nivelActual));
      return undefined;
    }

    const nivelGuardado = Number(valorGuardado);

    if (Number.isFinite(nivelGuardado) && nivelActual > nivelGuardado) {
      setCelebracionNivel({
        nivel: nivelActual,
        nombre: progresoCiudadano.nombre,
        xp: progresoCiudadano.xp,
        emblema: obtenerEmblemaNivel(nivelActual),
      });

      localStorage.setItem(claveNivel, String(nivelActual));

      const temporizador = window.setTimeout(() => {
        setCelebracionNivel(null);
      }, 3000);

      return () => window.clearTimeout(temporizador);
    }

    if (!Number.isFinite(nivelGuardado) || nivelGuardado > nivelActual) {
      localStorage.setItem(claveNivel, String(nivelActual));
    }

    return undefined;
  }, [
    cargandoContenido,
    perfil,
    progresoCiudadano.nivel,
    progresoCiudadano.nombre,
    progresoCiudadano.xp,
  ]);

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

  const contenidoVisible = useMemo(() => {
    if (seccionActiva === "publicaciones") {
      return publicacionesReales.map(
        (publicacion) => ({
          id: publicacion._id,
          tipo: "publicacion",
          titulo:
            publicacion.titulo ||
            publicacion.contenido,
          fecha: publicacion.createdAt,
          interacciones: "Publicación",
          estado: "Publicada",
        }),
      );
    }

    if (seccionActiva === "reportes") {
      return reportesReales.map(
        (reporte) => ({
          id: reporte._id,
          tipo: "reporte",
          titulo: reporte.titulo,
          fecha: reporte.createdAt,
          interacciones: `${reporte.confirmaciones || 0
            } confirmaciones`,
          estado: reporte.estado,
        }),
      );
    }

    return [];
  }, [
    seccionActiva,
    publicacionesReales,
    reportesReales,
  ]);
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {celebracionNivel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950/85 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="level-flash pointer-events-none absolute h-44 w-44 rounded-full bg-blue-400/15" />
          <div className="level-ring pointer-events-none absolute h-56 w-56 rounded-full border border-blue-300/30" />

          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 18 }).map((_, indice) => (
              <span
                key={`particula-${indice}`}
                className="level-particle absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                style={{
                  "--angulo": `${indice * 20}deg`,
                  "--retraso": `${indice * 25}ms`,
                }}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 16 }).map((_, indice) => (
              <span
                key={`confeti-${indice}`}
                className="level-confetti absolute top-[-8%] h-3 w-1.5 rounded-full"
                style={{
                  left: `${4 + indice * 6}%`,
                  "--retraso": `${indice * 45}ms`,
                  "--desplazamiento": `${indice % 2 === 0 ? 36 : -36}px`,
                }}
              />
            ))}
          </div>

          <div className="level-card relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b1626] p-7 text-center shadow-2xl shadow-black/40">
            <button type="button" onClick={() => setCelebracionNivel(null)} className="absolute right-3 top-3 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white">
              Cerrar
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-4xl shadow-lg">
              {celebracionNivel.emblema}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              <Sparkles size={16} />
              Nuevo nivel
              <Sparkles size={16} />
            </div>

            <h2 className="mt-3 text-3xl font-black">{celebracionNivel.nombre}</h2>
            <p className="mt-2 text-sm text-slate-400">Nivel {celebracionNivel.nivel}</p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300">
              <Trophy size={16} />
              {celebracionNivel.xp} XP alcanzados
            </div>
          </div>
        </div>
      )}

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
                {progresoCiudadano.nombre}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Nivel {progresoCiudadano.nivel}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${perfil.activo
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

          <div className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Progreso de nivel
                </p>

                <p className="mt-1 text-sm font-bold text-blue-300">
                  {progresoCiudadano.xp} XP
                  {progresoCiudadano.xpSiguiente && (
                    <span className="font-medium text-slate-500">
                      {" "}/ {progresoCiudadano.xpSiguiente} XP
                    </span>
                  )}
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {progresoCiudadano.progreso}%
              </span>
            </div>

            <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-red-500 transition-[width] duration-1000 ease-out"
                style={{ width: `${progresoAnimado}%` }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-60" />
            </div>

            {progresoCiudadano.xpSiguiente ? (
              <p className="mt-2 text-[11px] text-slate-500">
                Te faltan <span className="font-semibold text-slate-300">
                  {Math.max(0, progresoCiudadano.xpSiguiente - progresoCiudadano.xp)} XP
                </span> para subir de nivel.
              </p>
            ) : (
              <p className="mt-2 text-[11px] font-medium text-amber-300">
                Has alcanzado el nivel máximo.
              </p>
            )}

            <p className="mt-3 text-[11px] text-slate-600">
              +10 XP por publicación · +25 XP por reporte
            </p>
          </div>
        </section>

        <section className="mt-7">
          <nav className="grid grid-cols-3 border-b border-white/10 px-5">
            <button
              type="button"
              onClick={() =>
                setSeccionActiva("publicaciones")
              }
              className={`border-b-2 px-2 pb-3 text-sm font-medium ${seccionActiva === "publicaciones"
                ? "border-red-500 text-white"
                : "border-transparent text-slate-500"
                }`}
            >
              Publicaciones
            </button>

            <button
              type="button"
              onClick={() => setSeccionActiva("reportes")}
              className={`border-b-2 px-2 pb-3 text-sm font-medium ${seccionActiva === "reportes"
                ? "border-red-500 text-white"
                : "border-transparent text-slate-500"
                }`}
            >
              Reportes
            </button>

            <button
              type="button"
              onClick={() => setSeccionActiva("guardados")}
              className={`flex items-center justify-center gap-1 border-b-2 px-2 pb-3 text-sm font-medium ${seccionActiva === "guardados"
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
                    ? "Tus reportes aparecerán aquí cuando crees uno."
                    : "Tus publicaciones aparecerán aquí cuando crees una."}
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
                        className={`text-xs font-semibold ${elemento.tipo === "reporte"
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

      <style>{`
        @keyframes levelCard {
          0% { opacity: 0; transform: scale(.65) translateY(14px); }
          65% { opacity: 1; transform: scale(1.06) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes levelRing {
          0% { opacity: .8; transform: scale(.45); }
          100% { opacity: 0; transform: scale(1.75); }
        }
        @keyframes levelFlash {
          0% { opacity: 0; transform: scale(.2); }
          35% { opacity: 1; }
          100% { opacity: 0; transform: scale(2.1); }
        }
        @keyframes levelParticle {
          from { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angulo)) translateX(0) scale(1); }
          to { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angulo)) translateX(175px) scale(.15); }
        }
        @keyframes levelConfetti {
          0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); }
          100% { opacity: 0; transform: translate3d(var(--desplazamiento), 620px, 0) rotate(520deg); }
        }
        .level-card { animation: levelCard .6s cubic-bezier(.2,.8,.2,1) both; }
        .level-ring { animation: levelRing 1.35s ease-out both; }
        .level-flash { animation: levelFlash .9s ease-out both; }
        .level-particle { background: rgba(255,255,255,.85); animation: levelParticle 1.25s ease-out var(--retraso) forwards; }
        .level-particle:nth-child(3n) { background: rgb(96 165 250); }
        .level-particle:nth-child(3n + 1) { background: rgb(248 113 113); }
        .level-confetti { background: rgb(248 113 113); animation: levelConfetti 1.8s ease-in var(--retraso) forwards; }
        .level-confetti:nth-child(3n) { background: rgb(96 165 250); }
        .level-confetti:nth-child(3n + 1) { background: rgb(255 255 255); }
        @media (prefers-reduced-motion: reduce) {
          .level-card, .level-ring, .level-flash, .level-particle, .level-confetti { animation: none !important; }
        }
      `}</style>

      </div>
    </div>
  );
}
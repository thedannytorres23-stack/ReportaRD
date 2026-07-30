import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router";

const usuarios = [
  {
    id: 1,
    nombre: "Laura Méndez",
    usuario: "@lauramendez",
    iniciales: "LM",
    ubicacion: "Santiago",
    biografia:
      "Promotora de iniciativas ambientales y jornadas comunitarias.",
    seguidores: 842,
    siguiendo: 231,
    reportes: 18,
    verificado: true,
    color: "from-emerald-500 to-blue-500",
    portada: "from-emerald-950 via-slate-900 to-blue-950",
  },
  {
    id: 2,
    nombre: "Carlos Ramírez",
    usuario: "@carlosrd",
    iniciales: "CR",
    ubicacion: "Santiago Oeste",
    biografia:
      "Ciudadano activo reportando problemas de infraestructura.",
    seguidores: 521,
    siguiendo: 184,
    reportes: 24,
    verificado: false,
    color: "from-orange-500 to-red-500",
    portada: "from-orange-950 via-slate-900 to-red-950",
  },
  {
    id: 3,
    nombre: "María Fernández",
    usuario: "@mariaf",
    iniciales: "MF",
    ubicacion: "Los Jardines",
    biografia:
      "Organizadora comunitaria y defensora de espacios públicos.",
    seguidores: 1204,
    siguiendo: 316,
    reportes: 31,
    verificado: true,
    color: "from-violet-500 to-pink-500",
    portada: "from-violet-950 via-slate-900 to-pink-950",
  },
  {
    id: 4,
    nombre: "José Martínez",
    usuario: "@josemartinez",
    iniciales: "JM",
    ubicacion: "Cienfuegos",
    biografia:
      "Compartiendo soluciones y noticias de mi comunidad.",
    seguidores: 368,
    siguiendo: 147,
    reportes: 12,
    verificado: false,
    color: "from-blue-500 to-cyan-500",
    portada: "from-blue-950 via-slate-900 to-cyan-950",
  },
  {
    id: 5,
    nombre: "Ana Rodríguez",
    usuario: "@anarodriguez",
    iniciales: "AR",
    ubicacion: "La Trinitaria",
    biografia:
      "Interesada en seguridad vial y bienestar ciudadano.",
    seguidores: 695,
    siguiendo: 208,
    reportes: 20,
    verificado: true,
    color: "from-red-500 to-amber-500",
    portada: "from-red-950 via-slate-900 to-amber-950",
  },
];

const actividad = [
  {
    id: 1,
    tipo: "publicacion",
    titulo: "Una comunidad informada puede lograr grandes cambios.",
    fecha: "Hace 3 horas",
    interacciones: "46 reacciones",
  },
  {
    id: 2,
    tipo: "reporte",
    titulo: "Acumulación de basura cerca del parque",
    fecha: "Hace 1 día",
    interacciones: "29 confirmaciones",
  },
  {
    id: 3,
    tipo: "publicacion",
    titulo: "Gracias a todos los que participaron en la jornada.",
    fecha: "Hace 4 días",
    interacciones: "71 reacciones",
  },
];

const obtenerUsuariosSeguidos = () => {
  try {
    const datos = localStorage.getItem(
      "reportard_usuarios_seguidos",
    );

    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
};

export default function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const persona = usuarios.find(
    (usuario) => usuario.id === Number(id),
  );

  const [usuariosSeguidos, setUsuariosSeguidos] = useState(
    obtenerUsuariosSeguidos,
  );

  const [seccionActiva, setSeccionActiva] =
    useState("publicaciones");

  useEffect(() => {
    localStorage.setItem(
      "reportard_usuarios_seguidos",
      JSON.stringify(usuariosSeguidos),
    );
  }, [usuariosSeguidos]);

  if (!persona) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="text-center">
          <FileText
            size={42}
            className="mx-auto text-slate-700"
          />

          <h1 className="mt-4 text-xl font-bold">
            Perfil no encontrado
          </h1>

          <button
            type="button"
            onClick={() => navigate("/personas")}
            className="mt-5 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold"
          >
            Volver a personas
          </button>
        </div>
      </div>
    );
  }

  const siguiendo = usuariosSeguidos.includes(persona.id);

  const cambiarSeguimiento = () => {
    setUsuariosSeguidos((usuariosActuales) => {
      if (usuariosActuales.includes(persona.id)) {
        return usuariosActuales.filter(
          (usuarioId) => usuarioId !== persona.id,
        );
      }

      return [...usuariosActuales, persona.id];
    });
  };

  const actividadVisible = actividad.filter((elemento) => {
    if (seccionActiva === "publicaciones") {
      return true;
    }

    return elemento.tipo === "reporte";
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-10">
        <header className="absolute left-1/2 top-0 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="rounded-full bg-black/40 p-2.5 text-white backdrop-blur"
          >
            <ArrowLeft size={21} />
          </button>

          <span className="rounded-full bg-black/40 px-3 py-2 text-xs text-slate-300 backdrop-blur">
            Perfil ciudadano
          </span>
        </header>

        <section>
          <div
            className={`relative h-44 bg-gradient-to-br ${persona.portada}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />
          </div>

          <div className="px-5">
            <div className="relative z-10 -mt-14 flex items-end justify-between">
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#06101f] bg-gradient-to-br ${persona.color} text-3xl font-bold shadow-xl`}
              >
                {persona.iniciales}
              </div>

              <button
                type="button"
                onClick={cambiarSeguimiento}
                className={`mb-2 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                  siguiendo
                    ? "border border-white/10 bg-white/5 text-slate-300"
                    : "bg-blue-500 text-white hover:bg-blue-400"
                }`}
              >
                {siguiendo ? (
                  <>
                    <UserCheck size={17} />
                    Siguiendo
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    Seguir
                  </>
                )}
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {persona.nombre}
                </h1>

                {persona.verificado && (
                  <CheckCircle2
                    size={20}
                    fill="currentColor"
                    strokeWidth={3}
                    className="text-blue-400"
                  />
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {persona.usuario}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {persona.biografia}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin
                  size={16}
                  className="text-red-400"
                />

                {persona.ubicacion}, República Dominicana
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.035] py-4 text-center">
              <div>
                <strong className="block text-lg">
                  {persona.seguidores + (siguiendo ? 1 : 0)}
                </strong>

                <span className="text-xs text-slate-500">
                  Seguidores
                </span>
              </div>

              <div>
                <strong className="block text-lg">
                  {persona.siguiendo}
                </strong>

                <span className="text-xs text-slate-500">
                  Siguiendo
                </span>
              </div>

              <div>
                <strong className="block text-lg">
                  {persona.reportes}
                </strong>

                <span className="text-xs text-slate-500">
                  Reportes
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-5 mt-6 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-violet-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
              <ShieldCheck size={23} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Participación ciudadana
              </p>

              <h2 className="mt-1 font-bold">
                Miembro activo de ReportaRD
              </h2>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <nav className="grid grid-cols-2 border-b border-white/10 px-5">
            <button
              type="button"
              onClick={() =>
                setSeccionActiva("publicaciones")
              }
              className={`border-b-2 pb-3 text-sm font-medium ${
                seccionActiva === "publicaciones"
                  ? "border-red-500 text-white"
                  : "border-transparent text-slate-500"
              }`}
            >
              Publicaciones
            </button>

            <button
              type="button"
              onClick={() =>
                setSeccionActiva("reportes")
              }
              className={`border-b-2 pb-3 text-sm font-medium ${
                seccionActiva === "reportes"
                  ? "border-red-500 text-white"
                  : "border-transparent text-slate-500"
              }`}
            >
              Reportes
            </button>
          </nav>

          <div className="space-y-3 px-5 py-5">
            {actividadVisible.map((elemento) => (
              <article
                key={elemento.id}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
              >
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

                <h3 className="mt-2 font-semibold leading-6">
                  {elemento.titulo}
                </h3>

                <p className="mt-3 text-xs text-slate-500">
                  {elemento.fecha} · {elemento.interacciones}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
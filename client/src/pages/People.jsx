import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router";

const personasSugeridas = [
  {
    id: 1,
    nombre: "Laura Méndez",
    usuario: "@lauramendez",
    iniciales: "LM",
    ubicacion: "Santiago",
    descripcion:
      "Promotora de iniciativas ambientales y jornadas comunitarias.",
    seguidores: 842,
    teSigue: true,
    verificado: true,
    color: "from-emerald-500 to-blue-500",
  },
  {
    id: 2,
    nombre: "Carlos Ramírez",
    usuario: "@carlosrd",
    iniciales: "CR",
    ubicacion: "Santiago Oeste",
    descripcion:
      "Ciudadano activo reportando problemas de infraestructura.",
    seguidores: 521,
    teSigue: false,
    verificado: false,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 3,
    nombre: "María Fernández",
    usuario: "@mariaf",
    iniciales: "MF",
    ubicacion: "Los Jardines",
    descripcion:
      "Organizadora comunitaria y defensora de espacios públicos.",
    seguidores: 1204,
    teSigue: true,
    verificado: true,
    color: "from-violet-500 to-pink-500",
  },
  {
    id: 4,
    nombre: "José Martínez",
    usuario: "@josemartinez",
    iniciales: "JM",
    ubicacion: "Cienfuegos",
    descripcion:
      "Compartiendo soluciones y noticias de mi comunidad.",
    seguidores: 368,
    teSigue: false,
    verificado: false,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 5,
    nombre: "Ana Rodríguez",
    usuario: "@anarodriguez",
    iniciales: "AR",
    ubicacion: "La Trinitaria",
    descripcion:
      "Interesada en seguridad vial y bienestar ciudadano.",
    seguidores: 695,
    teSigue: true,
    verificado: true,
    color: "from-red-500 to-amber-500",
  },
];

const obtenerSeguidosGuardados = () => {
  try {
    const datos = localStorage.getItem(
      "reportard_usuarios_seguidos",
    );

    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
};

export default function People() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const vistaRecibida = searchParams.get("vista");

  const vistaActiva = [
    "descubrir",
    "seguidores",
    "siguiendo",
  ].includes(vistaRecibida)
    ? vistaRecibida
    : "descubrir";

  const [busqueda, setBusqueda] = useState("");

  const [usuariosSeguidos, setUsuariosSeguidos] = useState(
    obtenerSeguidosGuardados,
  );

  useEffect(() => {
    localStorage.setItem(
      "reportard_usuarios_seguidos",
      JSON.stringify(usuariosSeguidos),
    );
  }, [usuariosSeguidos]);

  const cambiarVista = (nuevaVista) => {
    setSearchParams({
      vista: nuevaVista,
    });

    setBusqueda("");
  };

  const cambiarSeguimiento = (personaId) => {
    setUsuariosSeguidos((usuariosActuales) => {
      const yaLoSigue = usuariosActuales.includes(personaId);

      if (yaLoSigue) {
        return usuariosActuales.filter(
          (usuarioId) => usuarioId !== personaId,
        );
      }

      return [...usuariosActuales, personaId];
    });
  };

  const personasDeLaVista = useMemo(() => {
    if (vistaActiva === "seguidores") {
      return personasSugeridas.filter(
        (persona) => persona.teSigue,
      );
    }

    if (vistaActiva === "siguiendo") {
      return personasSugeridas.filter((persona) =>
        usuariosSeguidos.includes(persona.id),
      );
    }

    return personasSugeridas;
  }, [vistaActiva, usuariosSeguidos]);

  const personasVisibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return personasDeLaVista;
    }

    return personasDeLaVista.filter((persona) => {
      return (
        persona.nombre.toLowerCase().includes(texto) ||
        persona.usuario.toLowerCase().includes(texto) ||
        persona.ubicacion.toLowerCase().includes(texto)
      );
    });
  }, [busqueda, personasDeLaVista]);

  const tituloVista = {
    descubrir: "Personas sugeridas",
    seguidores: "Tus seguidores",
    siguiendo: "Personas que sigues",
  }[vistaActiva];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06101f]/95 px-4 pb-4 pt-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="text-center">
              <h1 className="font-bold">
                Red ciudadana
              </h1>

              <p className="text-xs text-slate-500">
                Conecta con tu comunidad
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Users size={20} />
            </div>
          </div>

          <div className="relative mt-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Buscar personas..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
            />
          </div>

          <nav className="mt-4 grid grid-cols-3 rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => cambiarVista("descubrir")}
              className={`rounded-xl px-2 py-2.5 text-xs font-medium transition ${
                vistaActiva === "descubrir"
                  ? "bg-blue-500 text-white"
                  : "text-slate-500"
              }`}
            >
              Descubrir
            </button>

            <button
              type="button"
              onClick={() => cambiarVista("seguidores")}
              className={`rounded-xl px-2 py-2.5 text-xs font-medium transition ${
                vistaActiva === "seguidores"
                  ? "bg-blue-500 text-white"
                  : "text-slate-500"
              }`}
            >
              Seguidores
            </button>

            <button
              type="button"
              onClick={() => cambiarVista("siguiendo")}
              className={`rounded-xl px-2 py-2.5 text-xs font-medium transition ${
                vistaActiva === "siguiendo"
                  ? "bg-blue-500 text-white"
                  : "text-slate-500"
              }`}
            >
              Siguiendo
            </button>
          </nav>
        </header>

        <main className="px-4 py-5">
          <section className="mb-5 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-red-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Tu red ciudadana
            </p>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <strong className="text-3xl">
                  {vistaActiva === "seguidores"
                    ? 128
                    : usuariosSeguidos.length}
                </strong>

                <p className="mt-1 text-sm text-slate-400">
                  {vistaActiva === "seguidores"
                    ? "Personas que te siguen"
                    : "Personas que sigues"}
                </p>
              </div>

              <UserCheck
                size={35}
                className="text-blue-400"
              />
            </div>

            {vistaActiva === "seguidores" && (
              <p className="mt-3 text-xs text-slate-500">
                Mostrando algunos seguidores de ejemplo.
              </p>
            )}
          </section>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              {tituloVista}
            </h2>

            <span className="text-xs text-slate-500">
              {personasVisibles.length} mostrados
            </span>
          </div>

          <section className="space-y-3">
            {personasVisibles.map((persona) => {
              const siguiendo = usuariosSeguidos.includes(
                persona.id,
              );

              return (
                <article
                  key={persona.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${persona.color} font-bold`}
                    >
                      {persona.iniciales}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-semibold">
                          {persona.nombre}
                        </h3>

                        {persona.verificado && (
                          <CheckCircle2
                            size={15}
                            fill="currentColor"
                            strokeWidth={3}
                            className="shrink-0 text-blue-400"
                          />
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        {persona.usuario}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin
                          size={13}
                          className="text-red-400"
                        />

                        {persona.ubicacion}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {persona.descripcion}
                  </p>

                  {persona.teSigue && (
                    <span className="mt-3 inline-block rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-medium text-violet-300">
                      Te sigue
                    </span>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {persona.seguidores +
                        (siguiendo ? 1 : 0)}{" "}
                      seguidores
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        cambiarSeguimiento(persona.id)
                      }
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-95 ${
                        siguiendo
                          ? "border border-white/10 bg-white/5 text-slate-300"
                          : "bg-blue-500 text-white hover:bg-blue-400"
                      }`}
                    >
                      {siguiendo ? (
                        <>
                          <UserCheck size={16} />
                          Siguiendo
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Seguir
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}

            {personasVisibles.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 px-5 py-12 text-center">
                <Users
                  size={34}
                  className="mx-auto text-slate-700"
                />

                <h3 className="mt-4 font-semibold">
                  No hay personas aquí
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Puedes descubrir y seguir nuevas personas.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    cambiarVista("descubrir")
                  }
                  className="mt-5 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold"
                >
                  Descubrir personas
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
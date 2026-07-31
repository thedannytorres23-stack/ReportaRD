import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Globe2,
  Lock,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

const comunidades = [
  {
    id: 1,
    nombre: "Santiago Centro",
    categoria: "Comunidad local",
    descripcion:
      "Reportes, actividades y conversaciones sobre el centro de Santiago.",
    miembros: 3420,
    publicaciones: 184,
    privada: false,
    verificada: true,
    iniciales: "SC",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    nombre: "Los Jardines Unidos",
    categoria: "Sector",
    descripcion:
      "Vecinos trabajando juntos por espacios públicos más seguros y limpios.",
    miembros: 1280,
    publicaciones: 96,
    privada: false,
    verificada: true,
    iniciales: "LJ",
    color: "from-emerald-500 to-green-600",
  },
  {
    id: 3,
    nombre: "Santiago Verde",
    categoria: "Medioambiente",
    descripcion:
      "Iniciativas ambientales, reciclaje y recuperación de áreas verdes.",
    miembros: 895,
    publicaciones: 73,
    privada: false,
    verificada: false,
    iniciales: "SV",
    color: "from-green-500 to-teal-500",
  },
  {
    id: 4,
    nombre: "Seguridad Vial RD",
    categoria: "Seguridad",
    descripcion:
      "Reportes y propuestas para mejorar las calles y reducir accidentes.",
    miembros: 2150,
    publicaciones: 142,
    privada: false,
    verificada: true,
    iniciales: "SR",
    color: "from-red-500 to-orange-500",
  },
  {
    id: 5,
    nombre: "Cienfuegos Comunitario",
    categoria: "Sector",
    descripcion:
      "Espacio para residentes, líderes y organizaciones de Cienfuegos.",
    miembros: 742,
    publicaciones: 61,
    privada: true,
    verificada: false,
    iniciales: "CC",
    color: "from-violet-500 to-purple-600",
  },
];

const obtenerComunidadesUnidas = () => {
  try {
    const datos = localStorage.getItem(
      "reportard_comunidades_unidas",
    );

    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
};

export default function Communities() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");

  const [vistaActiva, setVistaActiva] =
    useState("descubrir");

  const [comunidadesUnidas, setComunidadesUnidas] = useState(
    obtenerComunidadesUnidas,
  );

  useEffect(() => {
    localStorage.setItem(
      "reportard_comunidades_unidas",
      JSON.stringify(comunidadesUnidas),
    );
  }, [comunidadesUnidas]);

  const comunidadesVisibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    let lista =
      vistaActiva === "unidas"
        ? comunidades.filter((comunidad) =>
            comunidadesUnidas.includes(comunidad.id),
          )
        : comunidades;

    if (!texto) {
      return lista;
    }

    return lista.filter((comunidad) => {
      return [
        comunidad.nombre,
        comunidad.categoria,
        comunidad.descripcion,
      ].some((valor) =>
        valor.toLowerCase().includes(texto),
      );
    });
  }, [busqueda, vistaActiva, comunidadesUnidas]);

  const cambiarMembresia = (comunidadId) => {
    setComunidadesUnidas((comunidadesActuales) => {
      const yaEstaUnido =
        comunidadesActuales.includes(comunidadId);

      if (yaEstaUnido) {
        return comunidadesActuales.filter(
          (id) => id !== comunidadId,
        );
      }

      return [...comunidadesActuales, comunidadId];
    });
  };

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
              <h1 className="font-bold">Comunidades</h1>

              <p className="text-xs text-slate-500">
                Espacios para construir juntos
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Users size={21} />
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
              placeholder="Buscar comunidades..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />

            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-white/10"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <nav className="mt-4 grid grid-cols-2 rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setVistaActiva("descubrir")}
              className={`rounded-xl py-2.5 text-sm font-medium transition ${
                vistaActiva === "descubrir"
                  ? "bg-violet-500 text-white"
                  : "text-slate-500"
              }`}
            >
              Descubrir
            </button>

            <button
              type="button"
              onClick={() => setVistaActiva("unidas")}
              className={`rounded-xl py-2.5 text-sm font-medium transition ${
                vistaActiva === "unidas"
                  ? "bg-violet-500 text-white"
                  : "text-slate-500"
              }`}
            >
              Mis comunidades
            </button>
          </nav>
        </header>

        <main className="px-4 py-5">
          <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-[#0b1626] to-blue-500/10 p-5">
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                  Tu red comunitaria
                </p>

                <strong className="mt-2 block text-3xl">
                  {comunidadesUnidas.length}
                </strong>

                <p className="mt-1 text-sm text-slate-400">
                  Comunidades a las que perteneces
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
                <Users size={29} />
              </div>
            </div>
          </section>

          <div className="mb-4 mt-7 flex items-center justify-between">
            <h2 className="font-semibold">
              {vistaActiva === "unidas"
                ? "Mis comunidades"
                : "Comunidades sugeridas"}
            </h2>

            <span className="text-xs text-slate-500">
              {comunidadesVisibles.length} resultados
            </span>
          </div>

          <section className="space-y-4">
            {comunidadesVisibles.map((comunidad) => {
              const unido = comunidadesUnidas.includes(
                comunidad.id,
              );

              return (
                <article
                  key={comunidad.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]"
                >
                  <div
                    className={`relative h-24 bg-gradient-to-br ${comunidad.color}`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-black/25" />

                    <div className="absolute bottom-3 left-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 bg-black/30 font-bold shadow-xl backdrop-blur">
                      {comunidad.iniciales}
                    </div>

                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] backdrop-blur">
                      {comunidad.privada ? (
                        <>
                          <Lock size={11} />
                          Privada
                        </>
                      ) : (
                        <>
                          <Globe2 size={11} />
                          Pública
                        </>
                      )}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold">
                        {comunidad.nombre}
                      </h3>

                      {comunidad.verificada && (
                        <ShieldCheck
                          size={16}
                          fill="currentColor"
                          strokeWidth={3}
                          className="text-blue-400"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-xs font-medium text-violet-400">
                      {comunidad.categoria}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {comunidad.descripcion}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        {comunidad.miembros +
                          (unido ? 1 : 0)}{" "}
                        miembros
                      </span>

                      <span>
                        {comunidad.publicaciones} publicaciones
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/comunidad/${comunidad.id}`)
                        }
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-slate-200 transition duration-200 hover:bg-white/10 active:scale-95"
                      >
                        Ver comunidad
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          cambiarMembresia(comunidad.id)
                        }
                        className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition duration-200 active:scale-95 ${
                          unido
                            ? "border border-white/10 bg-white/5 text-slate-300 hover:bg-red-500/10 hover:text-red-400"
                            : "bg-violet-500 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-400"
                        }`}
                      >
                        {unido ? (
                          <>
                            <UserCheck size={18} />
                            Miembro
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} />
                            {comunidad.privada
                              ? "Solicitar"
                              : "Unirme"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {comunidadesVisibles.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 px-5 py-12 text-center">
                <Users
                  size={36}
                  className="mx-auto text-slate-700"
                />

                <h3 className="mt-4 font-semibold">
                  No hay comunidades aquí
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explora otros espacios y únete a las comunidades que te interesen.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setVistaActiva("descubrir")
                  }
                  className="mt-5 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold"
                >
                  Descubrir comunidades
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
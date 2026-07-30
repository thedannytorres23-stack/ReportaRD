import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MapPin,
  Search,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

const personas = [
  {
    id: 1,
    tipo: "persona",
    nombre: "Laura Méndez",
    usuario: "@lauramendez",
    iniciales: "LM",
    ubicacion: "Santiago Centro",
    verificado: true,
    color: "from-emerald-500 to-blue-500",
  },
  {
    id: 2,
    tipo: "persona",
    nombre: "Carlos Ramírez",
    usuario: "@carlosrd",
    iniciales: "CR",
    ubicacion: "Santiago Oeste",
    verificado: false,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 3,
    tipo: "persona",
    nombre: "María Fernández",
    usuario: "@mariaf",
    iniciales: "MF",
    ubicacion: "Los Jardines",
    verificado: true,
    color: "from-violet-500 to-pink-500",
  },
  {
    id: 4,
    tipo: "persona",
    nombre: "José Martínez",
    usuario: "@josemartinez",
    iniciales: "JM",
    ubicacion: "Cienfuegos",
    verificado: false,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 5,
    tipo: "persona",
    nombre: "Ana Rodríguez",
    usuario: "@anarodriguez",
    iniciales: "AR",
    ubicacion: "La Trinitaria",
    verificado: true,
    color: "from-red-500 to-amber-500",
  },
];

const publicaciones = [
  {
    id: "post-1",
    tipo: "publicacion",
    autorId: 3,
    autor: "María Fernández",
    titulo: "Jornada de limpieza comunitaria",
    contenido:
      "Este sábado estaremos realizando una jornada de limpieza en el parque del sector.",
    comunidad: "Los Jardines",
    tiempo: "Hace 8 min",
  },
  {
    id: "post-2",
    tipo: "publicacion",
    autorId: 4,
    autor: "José Martínez",
    titulo: "Recuperación del área verde",
    contenido:
      "Gracias a todos los vecinos que ayudaron a recuperar el área verde.",
    comunidad: "Cienfuegos",
    tiempo: "Hace 26 min",
  },
];

const reportes = [
  {
    id: "report-1",
    tipo: "reporte",
    autorId: 1,
    autor: "Laura Méndez",
    titulo: "Hueco peligroso en la avenida",
    contenido:
      "El hueco representa un riesgo para conductores y peatones.",
    categoria: "Infraestructura",
    ubicacion: "Av. Estrella Sadhalá, Santiago",
    tiempo: "Hace 15 min",
  },
  {
    id: "report-2",
    tipo: "reporte",
    autorId: 2,
    autor: "Carlos Ramírez",
    titulo: "Poste de luz averiado",
    contenido:
      "La calle lleva varios días completamente oscura.",
    categoria: "Alumbrado",
    ubicacion: "Calle Duarte, Santiago",
    tiempo: "Hace 32 min",
  },
];

const filtros = [
  {
    id: "todos",
    nombre: "Todo",
  },
  {
    id: "personas",
    nombre: "Personas",
  },
  {
    id: "publicaciones",
    nombre: "Publicaciones",
  },
  {
    id: "reportes",
    nombre: "Reportes",
  },
];

const busquedasSugeridas = [
  "Problemas de alumbrado",
  "Reportes en Santiago",
  "Jornadas comunitarias",
  "Infraestructura",
];

export default function SearchPage() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");

  const textoBusqueda = busqueda.trim().toLowerCase();

  const resultados = useMemo(() => {
    if (!textoBusqueda) {
      return [];
    }

    const coincide = (valores) =>
      valores.some((valor) =>
        valor.toLowerCase().includes(textoBusqueda),
      );

    const personasEncontradas = personas.filter((persona) =>
      coincide([
        persona.nombre,
        persona.usuario,
        persona.ubicacion,
      ]),
    );

    const publicacionesEncontradas = publicaciones.filter(
      (publicacion) =>
        coincide([
          publicacion.autor,
          publicacion.titulo,
          publicacion.contenido,
          publicacion.comunidad,
        ]),
    );

    const reportesEncontrados = reportes.filter((reporte) =>
      coincide([
        reporte.autor,
        reporte.titulo,
        reporte.contenido,
        reporte.categoria,
        reporte.ubicacion,
      ]),
    );

    if (filtroActivo === "personas") {
      return personasEncontradas;
    }

    if (filtroActivo === "publicaciones") {
      return publicacionesEncontradas;
    }

    if (filtroActivo === "reportes") {
      return reportesEncontrados;
    }

    return [
      ...personasEncontradas,
      ...publicacionesEncontradas,
      ...reportesEncontrados,
    ];
  }, [textoBusqueda, filtroActivo]);

  const abrirResultado = (resultado) => {
    if (resultado.tipo === "persona") {
      navigate(`/usuario/${resultado.id}`);
      return;
    }

    if (resultado.tipo === "reporte") {
      navigate(
        `/mapa?categoria=${encodeURIComponent(
          resultado.categoria,
        )}`,
      );
      return;
    }

    navigate(`/usuario/${resultado.autorId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06101f]/95 px-4 pb-4 pt-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="search"
                autoFocus
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                placeholder="Buscar en ReportaRD..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
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
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filtros.map((filtro) => (
              <button
                type="button"
                key={filtro.id}
                onClick={() => setFiltroActivo(filtro.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
                  filtroActivo === filtro.id
                    ? "bg-blue-500 text-white"
                    : "border border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                {filtro.nombre}
              </button>
            ))}
          </nav>
        </header>

        <main className="px-4 py-5">
          {!textoBusqueda ? (
            <section>
              <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-red-500/5 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                  <Search size={24} />
                </div>

                <h1 className="mt-4 text-xl font-bold">
                  Encuentra tu comunidad
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Busca personas, publicaciones y reportes ciudadanos.
                </p>
              </div>

              <div className="mt-7">
                <h2 className="font-semibold">
                  Búsquedas sugeridas
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {busquedasSugeridas.map((sugerencia) => (
                    <button
                      type="button"
                      key={sugerencia}
                      onClick={() =>
                        setBusqueda(sugerencia)
                      }
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/10"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="font-semibold">
                  Resultados
                </h1>

                <span className="text-xs text-slate-500">
                  {resultados.length} encontrados
                </span>
              </div>

              <div className="space-y-3">
                {resultados.map((resultado) => {
                  if (resultado.tipo === "persona") {
                    return (
                      <button
                        type="button"
                        key={`persona-${resultado.id}`}
                        onClick={() =>
                          abrirResultado(resultado)
                        }
                        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.06]"
                      >
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${resultado.color} font-bold`}
                        >
                          {resultado.iniciales}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <strong className="truncate">
                              {resultado.nombre}
                            </strong>

                            {resultado.verificado && (
                              <CheckCircle2
                                size={15}
                                fill="currentColor"
                                strokeWidth={3}
                                className="shrink-0 text-blue-400"
                              />
                            )}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            {resultado.usuario} ·{" "}
                            {resultado.ubicacion}
                          </span>
                        </span>

                        <UserRound
                          size={18}
                          className="shrink-0 text-slate-600"
                        />
                      </button>
                    );
                  }

                  if (resultado.tipo === "reporte") {
                    return (
                      <button
                        type="button"
                        key={resultado.id}
                        onClick={() =>
                          abrirResultado(resultado)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center gap-2 text-xs font-medium text-red-400">
                          <Wrench size={15} />
                          {resultado.categoria}
                        </div>

                        <h2 className="mt-2 font-semibold">
                          {resultado.titulo}
                        </h2>

                        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                          {resultado.contenido}
                        </p>

                        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={13} />
                          {resultado.ubicacion}
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      key={resultado.id}
                      onClick={() =>
                        abrirResultado(resultado)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                        <FileText size={15} />
                        Publicación
                      </div>

                      <h2 className="mt-2 font-semibold">
                        {resultado.titulo}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                        {resultado.contenido}
                      </p>

                      <p className="mt-3 text-xs text-slate-500">
                        {resultado.autor} ·{" "}
                        {resultado.comunidad}
                      </p>
                    </button>
                  );
                })}

                {resultados.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-white/10 px-5 py-12 text-center">
                    <Users
                      size={36}
                      className="mx-auto text-slate-700"
                    />

                    <h2 className="mt-4 font-semibold">
                      No encontramos resultados
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Prueba con otro nombre, lugar o categoría.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
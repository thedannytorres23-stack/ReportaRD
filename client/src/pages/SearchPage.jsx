import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  MapPin,
  Search,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { listarUsuarios } from "../services/userService";

const filtros = [
  { id: "todos", nombre: "Todo" },
  { id: "personas", nombre: "Personas" },
  { id: "publicaciones", nombre: "Publicaciones" },
  { id: "reportes", nombre: "Reportes" },
];

const busquedasSugeridas = [
  "Danny",
  "Santiago",
  "Usuarios activos",
  "República Dominicana",
];

const obtenerToken = () => {
  return localStorage.getItem("reportard_token") || "";
};

const obtenerIniciales = (nombre = "") => {
  return (
    nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((palabra) => palabra[0]?.toUpperCase())
      .join("") || "RD"
  );
};

const textoActividad = (persona) => {
  if (persona.activo) return "Activo ahora";
  if (!persona.ultimaActividad) return "Usuario registrado";

  const diferencia = Date.now() - new Date(persona.ultimaActividad).getTime();
  const minutos = Math.max(1, Math.floor(diferencia / 60000));

  if (minutos < 60) return `Activo hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Activo hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `Activo hace ${dias} d`;
};

export default function SearchPage() {
  const navigate = useNavigate();
 const token = useMemo(() => obtenerToken(), []);

  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [personas, setPersonas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const textoBusqueda = busqueda.trim();
  const buscandoPersonas =
    filtroActivo === "todos" || filtroActivo === "personas";
  const filtroContenido =
    filtroActivo === "publicaciones" || filtroActivo === "reportes";

  useEffect(() => {
    if (!textoBusqueda || !buscandoPersonas) {
      return undefined;
    }

    if (!token) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let solicitudActiva = true;

    const temporizador = window.setTimeout(async () => {
      try {
        setCargando(true);
        setError("");

        const datos = await listarUsuarios(token, textoBusqueda);

        if (solicitudActiva) {
          setPersonas(datos.usuarios || []);
        }
      } catch (errorSolicitud) {
        if (solicitudActiva) {
          setPersonas([]);
          setError(errorSolicitud.message);
        }
      } finally {
        if (solicitudActiva) {
          setCargando(false);
        }
      }
    }, 300);

    return () => {
      solicitudActiva = false;
      window.clearTimeout(temporizador);
    };
  }, [buscandoPersonas, navigate, textoBusqueda, token]);

  const limpiarBusqueda = () => {
    setBusqueda("");
    setPersonas([]);
    setError("");
  };

  const cambiarFiltro = (filtroId) => {
    setFiltroActivo(filtroId);
    setError("");

    if (filtroId === "publicaciones" || filtroId === "reportes") {
      setPersonas([]);
    }
  };

  const seleccionarSugerencia = (sugerencia) => {
    setFiltroActivo("personas");

    if (sugerencia === "Usuarios activos") {
      setBusqueda("");
      navigate("/personas?vista=conectados");
      return;
    }

    setBusqueda(sugerencia);
  };

  const abrirPersona = (personaId) => {
    navigate(`/usuario/${personaId}`);
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
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 active:scale-95"
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
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar usuarios en ReportaRD..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07]"
              />

              {busqueda && (
                <button
                  type="button"
                  onClick={limpiarBusqueda}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
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
                onClick={() => cambiarFiltro(filtro.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition active:scale-95 ${
                  filtroActivo === filtro.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/15"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
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
              <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-[#0b1626] to-red-500/5 p-5">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                    <Search size={24} />
                  </div>

                  <h1 className="mt-4 text-xl font-bold">
                    Encuentra personas reales
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Busca por nombre, usuario o ubicación entre las personas
                    registradas en ReportaRD.
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <h2 className="font-semibold">Búsquedas sugeridas</h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {busquedasSugeridas.map((sugerencia) => (
                    <button
                      type="button"
                      key={sugerencia}
                      onClick={() => seleccionarSugerencia(sugerencia)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 transition hover:border-blue-500/20 hover:bg-white/10 active:scale-95"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/personas")}
                className="mt-7 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.06] active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <Users size={21} />
                </span>

                <span className="min-w-0 flex-1">
                  <strong className="block text-sm">Explorar ciudadanos</strong>
                  <span className="mt-1 block text-xs text-slate-500">
                    Mira todas las cuentas disponibles
                  </span>
                </span>
              </button>
            </section>
          ) : (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="font-semibold">Resultados reales</h1>

                {!cargando && !filtroContenido && (
                  <span className="text-xs text-slate-500">
                    {personas.length} encontrados
                  </span>
                )}
              </div>

              {filtroContenido ? (
                <div className="rounded-3xl border border-dashed border-white/10 px-5 py-12 text-center">
                  {filtroActivo === "publicaciones" ? (
                    <FileText size={36} className="mx-auto text-blue-500/50" />
                  ) : (
                    <Wrench size={36} className="mx-auto text-red-500/50" />
                  )}

                  <h2 className="mt-4 font-semibold">
                    Búsqueda en {filtroActivo}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Esta sección se activará cuando conectemos las publicaciones
                    y los reportes reales al backend.
                  </p>
                </div>
              ) : cargando ? (
                <div className="flex flex-col items-center py-16 text-slate-500">
                  <LoaderCircle size={32} className="animate-spin text-blue-400" />
                  <p className="mt-3 text-sm">Buscando ciudadanos...</p>
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-6 text-center">
                  <p className="text-sm text-red-300">{error}</p>

                  <button
                    type="button"
                    onClick={() => setBusqueda((valor) => `${valor} `)}
                    className="mt-4 rounded-xl bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-300"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              ) : personas.length > 0 ? (
                <div className="space-y-3">
                  {personas.map((persona) => (
                    <button
                      type="button"
                      key={persona._id}
                      onClick={() => abrirPersona(persona._id)}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-blue-500/20 hover:bg-white/[0.06] active:scale-[0.99]"
                    >
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-bold text-white">
                        {persona.foto ? (
                          <img
                            src={persona.foto}
                            alt={`Foto de ${persona.nombre}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          obtenerIniciales(persona.nombre)
                        )}

                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0b1626] ${
                            persona.activo ? "bg-green-400" : "bg-slate-600"
                          }`}
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-white">
                          {persona.nombre}
                        </strong>

                        <span className="mt-1 block truncate text-xs text-slate-500">
                          @{persona.usuario}
                        </span>

                        <span className="mt-1 flex items-center gap-1 truncate text-[10px] text-slate-600">
                          <MapPin size={11} className="shrink-0 text-red-400" />
                          {persona.ubicacion || textoActividad(persona)}
                        </span>
                      </span>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-500 transition group-hover:bg-blue-500/10 group-hover:text-blue-400">
                        <UserRound size={17} />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 px-5 py-12 text-center">
                  <Users size={36} className="mx-auto text-slate-700" />

                  <h2 className="mt-4 font-semibold">
                    No encontramos usuarios
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Prueba con otro nombre, usuario o ubicación.
                  </p>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
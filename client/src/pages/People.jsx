import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Search,
  UserRoundSearch,
  Users,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { crearChatPrivado } from "../services/chatService";
import { listarUsuarios } from "../services/userService";

const obtenerToken = () => {
  return localStorage.getItem("reportard_token") || "";
};

const obtenerIniciales = (nombre = "") =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join("") || "RD";

const formatearActividad = (persona) => {
  if (persona.activo) return "Activo ahora";
  if (!persona.ultimaActividad) return "Desconectado";

  const diferencia = Date.now() - new Date(persona.ultimaActividad);
  const minutos = Math.max(1, Math.floor(diferencia / 60000));

  if (minutos < 60) return `Activo hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Activo hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `Activo hace ${dias} d`;
};

export default function People() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
 const token = useMemo(() => obtenerToken(), []);

  const vistaRecibida = searchParams.get("vista");
  const vistaActiva = ["descubrir", "conectados", "recientes"].includes(
    vistaRecibida,
  )
    ? vistaRecibida
    : "descubrir";

  const [busqueda, setBusqueda] = useState("");
  const [personas, setPersonas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [abriendoChatId, setAbriendoChatId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let activo = true;

    const temporizador = window.setTimeout(async () => {
      try {
        setCargando(true);
        setError("");
        const datos = await listarUsuarios(token, busqueda);

        if (activo) setPersonas(datos.usuarios || []);
      } catch (errorSolicitud) {
        if (activo) {
          setPersonas([]);
          setError(errorSolicitud.message);
        }
      } finally {
        if (activo) setCargando(false);
      }
    }, 300);

    return () => {
      activo = false;
      window.clearTimeout(temporizador);
    };
  }, [busqueda, navigate, token]);

  const personasVisibles = useMemo(() => {
    if (vistaActiva === "conectados") {
      return personas.filter((persona) => persona.activo);
    }

    if (vistaActiva === "recientes") {
      return [...personas].sort(
        (a, b) =>
          new Date(b.ultimaActividad || 0) -
          new Date(a.ultimaActividad || 0),
      );
    }

    return personas;
  }, [personas, vistaActiva]);

  const cambiarVista = (nuevaVista) => {
    setSearchParams({ vista: nuevaVista });
  };

  const abrirChat = async (personaId) => {
    if (abriendoChatId) return;

    try {
      setAbriendoChatId(personaId);
      setError("");
      const datos = await crearChatPrivado(personaId, token);
      navigate(`/mensajes?chat=${datos.conversacion._id}`);
    } catch (errorSolicitud) {
      setError(errorSolicitud.message);
      setAbriendoChatId("");
    }
  };

  const vistas = [
    { id: "descubrir", etiqueta: "Descubrir" },
    { id: "conectados", etiqueta: "En línea" },
    { id: "recientes", etiqueta: "Recientes" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06101f]/95 px-4 pb-4 pt-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="text-center">
              <h1 className="font-bold">Red ciudadana</h1>
              <p className="text-xs text-slate-500">
                Personas registradas en ReportaRD
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
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre, usuario o ubicación..."
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

          <nav className="mt-4 grid grid-cols-3 rounded-2xl bg-white/5 p-1">
            {vistas.map((vista) => (
              <button
                type="button"
                key={vista.id}
                onClick={() => cambiarVista(vista.id)}
                className={`rounded-xl px-2 py-2.5 text-xs font-medium transition ${
                  vistaActiva === vista.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/15"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {vista.etiqueta}
              </button>
            ))}
          </nav>
        </header>

        <main className="px-4 py-5">
          <section className="mb-5 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-[#0b1626] to-violet-500/10 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Comunidad real
                </p>
                <strong className="mt-2 block text-3xl">
                  {personas.length}
                </strong>
                <p className="mt-1 text-sm text-slate-400">
                  ciudadanos disponibles
                </p>
              </div>

              <div className="rounded-2xl border border-green-500/15 bg-green-500/10 px-3 py-2 text-right">
                <strong className="text-lg text-green-400">
                  {personas.filter((persona) => persona.activo).length}
                </strong>
                <p className="text-[10px] text-green-300/70">en línea</p>
              </div>
            </div>
          </section>

          {error && (
            <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              {busqueda ? "Resultados" : "Ciudadanos"}
            </h2>
            <span className="text-xs text-slate-500">
              {personasVisibles.length} encontrados
            </span>
          </div>

          {cargando ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <LoaderCircle size={21} className="animate-spin text-blue-400" />
              Buscando ciudadanos...
            </div>
          ) : (
            <section className="space-y-3">
              {personasVisibles.map((persona) => (
                <article
                  key={persona._id}
                  className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-blue-400/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/usuario/${persona._id}`)}
                      aria-label={`Abrir perfil de ${persona.nombre}`}
                      className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-bold transition hover:scale-105 active:scale-95"
                    >
                      {persona.foto ? (
                        <img
                          src={persona.foto}
                          alt={`Foto de ${persona.nombre}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        obtenerIniciales(persona.nombre)
                      )}

                      {persona.activo && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#06101f] bg-green-400" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/usuario/${persona._id}`)}
                        className="block max-w-full truncate text-left font-semibold hover:underline"
                      >
                        {persona.nombre}
                      </button>

                      <p className="truncate text-xs text-slate-500">
                        @{persona.usuario}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} className="shrink-0 text-red-400" />
                        <span className="truncate">
                          {persona.ubicacion || "República Dominicana"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-medium ${
                        persona.activo
                          ? "bg-green-500/10 text-green-400"
                          : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {formatearActividad(persona)}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">
                    {persona.biografia ||
                      "Ciudadano registrado en la comunidad de ReportaRD."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/usuario/${persona._id}`)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 active:scale-95"
                    >
                      Ver perfil
                    </button>

                    <button
                      type="button"
                      onClick={() => abrirChat(persona._id)}
                      disabled={Boolean(abriendoChatId)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-400 active:scale-95 disabled:opacity-60"
                    >
                      {abriendoChatId === persona._id ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <MessageCircle size={15} />
                      )}
                      {abriendoChatId === persona._id
                        ? "Abriendo..."
                        : "Mensaje"}
                    </button>
                  </div>
                </article>
              ))}

              {personasVisibles.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 px-5 py-12 text-center">
                  <UserRoundSearch
                    size={38}
                    className="mx-auto text-slate-700"
                  />
                  <h3 className="mt-4 font-semibold">
                    No encontramos ciudadanos
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {busqueda
                      ? "Prueba con otro nombre, usuario o ubicación."
                      : "Cuando otras personas se registren aparecerán aquí."}
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
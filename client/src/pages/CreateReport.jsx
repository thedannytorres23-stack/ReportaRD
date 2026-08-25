import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Construction,
  Droplets,
  Ellipsis,
  FileVideo2,
  ImagePlus,
  Lightbulb,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Recycle,
  ShieldCheck,
  Siren,
  Trash2,
  Truck,
  X,
  Map,


} from "lucide-react";

import { useNavigate } from "react-router";
import { crearReporte } from "../services/contentService";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const categorias = [
  {
    nombre: "Infraestructura",
    descripcion: "Calles, aceras, puentes y señales",
    icono: Construction,
    color: "bg-red-500/15 text-red-400",
  },
  {
    nombre: "Alumbrado",
    descripcion: "Lámparas y postes averiados",
    icono: Lightbulb,
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    nombre: "Basura",
    descripcion: "Vertederos y acumulación de residuos",
    icono: Trash2,
    color: "bg-green-500/15 text-green-400",
  },
  {
    nombre: "Agua",
    descripcion: "Fugas y problemas de suministro",
    icono: Droplets,
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    nombre: "Transporte",
    descripcion: "Tránsito y transporte público",
    icono: Truck,
    color: "bg-violet-500/15 text-violet-400",
  },
  {
    nombre: "Medioambiente",
    descripcion: "Contaminación y áreas naturales",
    icono: Recycle,
    color: "bg-emerald-500/15 text-emerald-400",
  },
  {
    nombre: "Emergencia",
    descripcion: "Situaciones que requieren atención",
    icono: Siren,
    color: "bg-orange-500/15 text-orange-400",
  },
  {
    nombre: "Otro",
    descripcion: "Una situación diferente",
    icono: Ellipsis,
    color: "bg-slate-700 text-slate-300",
  },
];

const titulosPasos = [
  "Selecciona una categoría",
  "Describe el problema",
  "Indica la ubicación",
  "Agrega evidencias",
];


const iconoSeleccion = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #ef4444;
      border: 4px solid white;
      box-shadow: 0 6px 18px rgba(0,0,0,.35);
    "></div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function SelectorPunto({ posicion, onSeleccionar }) {
  useMapEvents({
    click(evento) {
      onSeleccionar({
        latitud: evento.latlng.lat,
        longitud: evento.latlng.lng,
      });
    },
  });

  if (!posicion) return null;

  return (
    <Marker
      position={[
        posicion.latitud,
        posicion.longitud,
      ]}
      icon={iconoSeleccion}
    />
  );
}

export default function CreateReport() {
  const navigate = useNavigate();
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const inputArchivos = useRef(null);
  const archivosActuales = useRef([]);

  const [paso, setPaso] = useState(1);
  const [categoria, setCategoria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [coordenadas, setCoordenadas] = useState({
    latitud: null,
    longitud: null,
  });
  const [referencia, setReferencia] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [aceptaResponsabilidad, setAceptaResponsabilidad] =
    useState(false);
  const [error, setError] = useState("");
  const [buscandoUbicacion, setBuscandoUbicacion] =
    useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reporteCreado, setReporteCreado] = useState(false);

  useEffect(() => {
    archivosActuales.current = archivos;
  }, [archivos]);

  useEffect(() => {
    return () => {
      archivosActuales.current.forEach((archivo) =>
        URL.revokeObjectURL(archivo.url),
      );
    };
  }, []);

  const validarPaso = () => {
    if (paso === 1 && !categoria) {
      setError("Selecciona una categoría para continuar.");
      return false;
    }

    if (paso === 2) {
      if (titulo.trim().length < 8) {
        setError("El título debe tener al menos 8 caracteres.");
        return false;
      }

      if (descripcion.trim().length < 20) {
        setError("Describe el problema usando al menos 20 caracteres.");
        return false;
      }
    }

    if (paso === 3 && ubicacion.trim().length < 5) {
      setError("Indica una ubicación válida.");
      return false;
    }

    setError("");
    return true;
  };

  const avanzar = () => {
    if (validarPaso()) {
      setPaso((actual) => Math.min(actual + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const retroceder = () => {
    if (paso === 1) {
      navigate(-1);
      return;
    }

    setError("");
    setPaso((actual) => actual - 1);
  };

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      setError("Tu dispositivo no permite obtener la ubicación.");
      return;
    }

    <button
      type="button"
      onClick={() =>
        setMostrarMapa((estado) => !estado)
      }
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
    >
      <Map size={18} />

      {mostrarMapa
        ? "Cerrar mapa"
        : "Seleccionar en el mapa"}
    </button>


    {
      mostrarMapa && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <div className="h-72">
            <MapContainer
              center={[19.4517, -70.697]}
              zoom={13}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <SelectorPunto
                posicion={
                  coordenadas.latitud !== null &&
                    coordenadas.longitud !== null
                    ? coordenadas
                    : null
                }
                onSeleccionar={(nuevasCoordenadas) => {
                  setCoordenadas(nuevasCoordenadas);

                  setUbicacion(
                    `Punto seleccionado (${nuevasCoordenadas.latitud.toFixed(
                      5,
                    )}, ${nuevasCoordenadas.longitud.toFixed(
                      5,
                    )})`,
                  );
                }}
              />
            </MapContainer>
          </div>

          <div className="bg-[#0b1626] px-4 py-3 text-xs text-slate-500">
            Toca el lugar exacto donde ocurre el problema.
          </div>
        </div>
      )
    }

    setBuscandoUbicacion(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordenadas({
          latitud: coords.latitude,
          longitud: coords.longitude,
        });

        setUbicacion(
          `Ubicación actual (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`,
        );

        setBuscandoUbicacion(false);
      },
      () => {
        setError(
          "No pudimos obtener tu ubicación. Escríbela manualmente.",
        );
        setBuscandoUbicacion(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const seleccionarArchivos = (evento) => {
    const seleccionados = Array.from(evento.target.files || []);
    setError("");

    if (archivos.length + seleccionados.length > 4) {
      setError("Puedes agregar un máximo de 4 evidencias.");
      evento.target.value = "";
      return;
    }

    const demasiadoGrande = seleccionados.find(
      (archivo) => archivo.size > 25 * 1024 * 1024,
    );

    if (demasiadoGrande) {
      setError(`El archivo ${demasiadoGrande.name} supera los 25 MB.`);
      evento.target.value = "";
      return;
    }

    const nuevos = seleccionados.map((archivo) => ({
      id: `${archivo.name}-${archivo.lastModified}-${Math.random()}`,
      archivo,
      url: URL.createObjectURL(archivo),
      esVideo: archivo.type.startsWith("video/"),
    }));

    setArchivos((actuales) => [...actuales, ...nuevos]);
    evento.target.value = "";
  };

  const eliminarArchivo = (id) => {
    setArchivos((actuales) => {
      const eliminado = actuales.find((archivo) => archivo.id === id);

      if (eliminado) URL.revokeObjectURL(eliminado.url);

      return actuales.filter((archivo) => archivo.id !== id);
    });
  };

  const publicarReporte = async () => {
    if (!aceptaResponsabilidad) {
      setError(
        "Confirma que la información del reporte es verdadera.",
      );
      return;
    }

    const token =
      localStorage.getItem("reportard_token") || "";

    if (!token) {
      setError(
        "Tu sesión expiró. Inicia sesión nuevamente.",
      );
      return;
    }

    try {
      setError("");
      setEnviando(true);

      const datosReporte = {
        categoria,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        ubicacion: referencia.trim()
          ? `${ubicacion.trim()} · Referencia: ${referencia.trim()}`
          : ubicacion.trim(),

        coordenadas: {
          latitud: coordenadas.latitud,
          longitud: coordenadas.longitud,
        },

        // La evidencia se conectará cuando tengamos
        // almacenamiento real en la nube.
        mediaUrl: "",
        mediaTipo: "",
      };

      await crearReporte(token, datosReporte);

      setReporteCreado(true);
    } catch (errorSolicitud) {
      setError(
        errorSolicitud.message ||
        "No se pudo crear el reporte.",
      );
    } finally {
      setEnviando(false);
    }
  };

  if (reporteCreado) {
    return (
      <div className="min-h-screen bg-slate-950 px-5 text-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center text-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 size={48} />
            <span className="absolute inset-0 animate-ping rounded-full border border-emerald-400/20" />
          </div>

          <p className="mt-8 text-xs font-bold tracking-[0.25em] text-emerald-400">
            REPORTE RECIBIDO
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Tu comunidad ya puede verlo
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            El reporte fue registrado correctamente y quedó disponible
            para la comunidad.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 w-full max-w-xs rounded-2xl bg-red-500 px-5 py-3.5 font-semibold transition hover:bg-red-400 active:scale-[0.98]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-8">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06101f]/95 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={retroceder}
              aria-label="Volver"
              className="rounded-xl bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
            >
              <ArrowLeft size={23} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-red-400">
                PASO {paso} DE 4
              </p>
              <h1 className="truncate text-lg font-bold">
                {titulosPasos[paso - 1]}
              </h1>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((numero) => (
              <span
                key={numero}
                className={`h-1.5 rounded-full transition-all duration-300 ${numero <= paso ? "bg-red-500" : "bg-white/10"
                  }`}
              />
            ))}
          </div>
        </header>

        <main className="px-5 py-7">
          {paso === 1 && (
            <section>
              <h2 className="text-3xl font-bold leading-tight">
                ¿Qué deseas reportar?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Selecciona la categoría que mejor representa el problema.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                {categorias.map(
                  ({ nombre, descripcion, icono: Icono, color }) => {
                    const seleccionada = categoria === nombre;

                    return (
                      <button
                        type="button"
                        key={nombre}
                        onClick={() => {
                          setCategoria(nombre);
                          setError("");
                        }}
                        className={`relative rounded-2xl border p-4 text-left transition duration-200 active:scale-[0.97] ${seleccionada
                          ? "border-red-500/70 bg-red-500/[0.08] shadow-lg shadow-red-950/20"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20"
                          }`}
                      >
                        {seleccionada && (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        )}

                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
                        >
                          <Icono size={22} />
                        </span>
                        <h3 className="mt-4 font-semibold">{nombre}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {descripcion}
                        </p>
                      </button>
                    );
                  },
                )}
              </div>
            </section>
          )}

          {paso === 2 && (
            <section>
              <h2 className="text-3xl font-bold leading-tight">
                Cuéntanos qué sucede
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Describe hechos concretos. Evita publicar datos personales.
              </p>

              <label className="mt-7 block">
                <span className="text-sm font-semibold">Título</span>
                <input
                  value={titulo}
                  onChange={(evento) => {
                    setTitulo(evento.target.value.slice(0, 80));
                    setError("");
                  }}
                  placeholder="Ej.: Semáforo averiado en la avenida"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-red-500/60"
                />
                <span className="mt-2 block text-right text-xs text-slate-600">
                  {titulo.length}/80
                </span>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Descripción</span>
                <textarea
                  value={descripcion}
                  onChange={(evento) => {
                    setDescripcion(evento.target.value.slice(0, 500));
                    setError("");
                  }}
                  rows={7}
                  placeholder="Explica desde cuándo ocurre, a quiénes afecta y cualquier detalle importante..."
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-slate-600 focus:border-red-500/60"
                />
                <span className="mt-2 block text-right text-xs text-slate-600">
                  {descripcion.length}/500
                </span>
              </label>
            </section>
          )}

          {paso === 3 && (
            <section>
              <h2 className="text-3xl font-bold leading-tight">
                ¿Dónde está ocurriendo?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Una ubicación precisa ayuda a verificar y atender el reporte.
              </p>

              <button
                type="button"
                onClick={usarUbicacionActual}
                disabled={buscandoUbicacion}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/15 disabled:opacity-60"
              >
                {buscandoUbicacion ? (
                  <LoaderCircle size={19} className="animate-spin" />
                ) : (
                  <LocateFixed size={19} />
                )}
                {buscandoUbicacion
                  ? "Buscando ubicación..."
                  : "Usar mi ubicación actual"}
              </button>

              <button
                type="button"
                onClick={() => setMostrarMapa((actual) => !actual)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06]"
              >
                <Map size={18} />

                {mostrarMapa
                  ? "Cerrar mapa"
                  : "Seleccionar ubicación en el mapa"}
              </button>

              {mostrarMapa && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <div className="h-72">
                    <MapContainer
                      center={[19.4517, -70.697]}
                      zoom={13}
                      scrollWheelZoom
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <SelectorPunto
                        posicion={
                          coordenadas.latitud !== null &&
                            coordenadas.longitud !== null
                            ? coordenadas
                            : null
                        }
                        onSeleccionar={(nuevasCoordenadas) => {
                          setCoordenadas(nuevasCoordenadas);

                          setUbicacion(
                            `Punto seleccionado (${nuevasCoordenadas.latitud.toFixed(
                              5,
                            )}, ${nuevasCoordenadas.longitud.toFixed(5)})`
                          );
                        }}
                      />
                    </MapContainer>
                  </div>

                  <div className="bg-[#0b1626] px-4 py-3 text-center text-xs text-slate-500">
                    Haz clic en el punto exacto donde ocurre el problema.
                  </div>
                </div>
              )}

              <div className="my-5 flex items-center gap-3 text-xs text-slate-600">
                <span className="h-px flex-1 bg-white/10" />
                O ESCRÍBELA
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Dirección o sector</span>
                <div className="relative mt-2">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-4 text-red-400"
                  />
                  <input
                    value={ubicacion}
                    onChange={(evento) => {
                      setUbicacion(evento.target.value);
                      setError("");
                    }}
                    placeholder="Calle, avenida, sector o municipio"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-red-500/60"
                  />
                </div>
              </label>

              <label className="mt-5 block">
                <span className="text-sm font-semibold">
                  Punto de referencia
                  <span className="ml-2 font-normal text-slate-600">
                    Opcional
                  </span>
                </span>
                <input
                  value={referencia}
                  onChange={(evento) =>
                    setReferencia(evento.target.value.slice(0, 100))
                  }
                  placeholder="Ej.: Frente a la farmacia"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-red-500/60"
                />
              </label>
            </section>
          )}

          {paso === 4 && (
            <section>
              <h2 className="text-3xl font-bold leading-tight">
                Evidencias y revisión
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Las fotos y videos ayudan a la comunidad a confirmar el caso.
              </p>

              <input
                ref={inputArchivos}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={seleccionarArchivos}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => inputArchivos.current?.click()}
                className="mt-7 flex w-full flex-col items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-5 py-8 text-center transition hover:border-red-500/40 hover:bg-red-500/[0.035]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
                  <ImagePlus size={27} />
                </span>
                <strong className="mt-4 text-sm">
                  Agregar fotos o videos
                </strong>
                <span className="mt-1 text-xs text-slate-500">
                  Máximo 4 archivos de hasta 25 MB
                </span>
              </button>

              {archivos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {archivos.map((archivo) => (
                    <div
                      key={archivo.id}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black"
                    >
                      {archivo.esVideo ? (
                        <video
                          src={archivo.url}
                          className="h-full w-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={archivo.url}
                          alt="Vista previa de la evidencia"
                          className="h-full w-full object-cover"
                        />
                      )}

                      {archivo.esVideo && (
                        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px]">
                          <FileVideo2 size={12} /> Video
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => eliminarArchivo(archivo.id)}
                        aria-label="Eliminar evidencia"
                        className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-red-500"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck size={19} className="text-blue-400" />
                  Resumen del reporte
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Categoría</dt>
                    <dd className="text-right font-medium">{categoria}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Título</dt>
                    <dd className="max-w-[65%] text-right font-medium">
                      {titulo}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Ubicación</dt>
                    <dd className="max-w-[65%] text-right font-medium">
                      {ubicacion}
                    </dd>
                  </div>
                </dl>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <input
                  type="checkbox"
                  checked={aceptaResponsabilidad}
                  onChange={(evento) => {
                    setAceptaResponsabilidad(evento.target.checked);
                    setError("");
                  }}
                  className="mt-1 h-4 w-4 accent-red-500"
                />
                <span className="text-xs leading-5 text-slate-400">
                  Confirmo que la información es verdadera y que este reporte
                  no busca acosar, difamar ni exponer datos personales.
                </span>
              </label>
            </section>
          )}

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-7 flex gap-3">
            {paso > 1 && (
              <button
                type="button"
                onClick={retroceder}
                className="rounded-2xl border border-white/10 px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Atrás
              </button>
            )}

            <button
              type="button"
              onClick={paso === 4 ? publicarReporte : avanzar}
              disabled={enviando}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3.5 text-sm font-semibold transition hover:bg-red-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando && <LoaderCircle size={18} className="animate-spin" />}
              {paso === 4
                ? enviando
                  ? "Publicando..."
                  : "Publicar reporte"
                : "Continuar"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
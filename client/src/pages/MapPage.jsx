import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Construction,
  Droplets,
  Lightbulb,
  List,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Trash2,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const centroSantiago = [19.4517, -70.697];

const categorias = [
  "Todos",
  "Infraestructura",
  "Alumbrado",
  "Basura",
  "Agua",
];

const reportes = [
  {
    id: 1,
    titulo: "Hueco peligroso en la avenida",
    categoria: "Infraestructura",
    ubicacion: "Av. Estrella Sadhalá, Santiago",
    tiempo: "Hace 15 min",
    confirmaciones: 32,
    coordenadas: [19.4554, -70.6848],
    color: "bg-red-500",
    colorHex: "#ef4444",
    emoji: "🚧",
    icono: Construction,
  },
  {
    id: 2,
    titulo: "Poste de luz averiado",
    categoria: "Alumbrado",
    ubicacion: "Calle Duarte, Santiago",
    tiempo: "Hace 32 min",
    confirmaciones: 18,
    coordenadas: [19.4487, -70.7012],
    color: "bg-amber-500",
    colorHex: "#f59e0b",
    emoji: "💡",
    icono: Lightbulb,
  },
  {
    id: 3,
    titulo: "Basura acumulada",
    categoria: "Basura",
    ubicacion: "Los Jardines, Santiago",
    tiempo: "Hace 1 h",
    confirmaciones: 21,
    coordenadas: [19.4633, -70.711],
    color: "bg-green-500",
    colorHex: "#22c55e",
    emoji: "🗑️",
    icono: Trash2,
  },
  {
    id: 4,
    titulo: "Fuga de agua",
    categoria: "Agua",
    ubicacion: "Cienfuegos, Santiago",
    tiempo: "Hace 2 h",
    confirmaciones: 14,
    coordenadas: [19.4724, -70.7304],
    color: "bg-blue-500",
    colorHex: "#3b82f6",
    emoji: "💧",
    icono: Droplets,
  },
];

const crearIconoReporte = (reporte) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 4px solid #06101f;
        background: ${reporte.colorHex};
        color: white;
        font-size: 17px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
      ">
        ${reporte.emoji}
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });

const iconoUsuario = L.divIcon({
  className: "",
  html: `
    <div style="
      position: relative;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        position: absolute;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.22);
      "></span>

      <span style="
        position: relative;
        width: 20px;
        height: 20px;
        border: 4px solid white;
        border-radius: 50%;
        background: #3b82f6;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.65);
      "></span>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function ControladorMapa({ destino }) {
  const mapa = useMap();

  useEffect(() => {
    if (!destino) return;

    mapa.flyTo(destino.coordenadas, destino.zoom, {
      duration: 1.2,
    });
  }, [destino, mapa]);

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const categoriaRecibida = searchParams.get("categoria");

  const categoriaInicial = categorias.includes(categoriaRecibida)
    ? categoriaRecibida
    : "Todos";

  const [categoriaActiva, setCategoriaActiva] =
    useState(categoriaInicial);

  const [vista, setVista] = useState("mapa");

  const [reporteSeleccionado, setReporteSeleccionado] =
    useState(null);

  const [ubicacionUsuario, setUbicacionUsuario] =
    useState(null);

  const [buscandoUbicacion, setBuscandoUbicacion] =
    useState(false);

  const [destinoMapa, setDestinoMapa] = useState({
    coordenadas: centroSantiago,
    zoom: 13,
  });

  const reportesVisibles = useMemo(() => {
    if (categoriaActiva === "Todos") {
      return reportes;
    }

    return reportes.filter(
      (reporte) => reporte.categoria === categoriaActiva,
    );
  }, [categoriaActiva]);
  
  const seleccionarCategoria = (categoria) => {
    setCategoriaActiva(categoria);
    setReporteSeleccionado(null);

    if (categoria === "Todos") {
      setSearchParams({});
    } else {
      setSearchParams({
        categoria,
      });
    }
  };

  const seleccionarReporte = (reporte) => {
    setReporteSeleccionado(reporte);
    setVista("mapa");

    setDestinoMapa({
      coordenadas: reporte.coordenadas,
      zoom: 16,
    });
  };

  const ubicarUsuario = () => {
    if (!navigator.geolocation) {
      window.alert(
        "Tu navegador no permite obtener la ubicación.",
      );
      return;
    }

    setBuscandoUbicacion(true);
    setVista("mapa");

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const coordenadas = [
          posicion.coords.latitude,
          posicion.coords.longitude,
        ];

        setUbicacionUsuario(coordenadas);

        setDestinoMapa({
          coordenadas,
          zoom: 16,
        });

        setBuscandoUbicacion(false);
      },
      () => {
        window.alert(
          "No pudimos obtener tu ubicación. Revisa los permisos del navegador.",
        );

        setBuscandoUbicacion(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">
        <header className="sticky top-0 z-[1000] border-b border-white/10 bg-[#06101f]/95 px-4 pb-4 pt-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Volver al inicio"
              className="rounded-xl p-2 text-slate-300 hover:bg-white/5"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="text-center">
              <h1 className="font-bold">Mapa ciudadano</h1>

              <p className="text-xs text-slate-500">
                Santiago, República Dominicana
              </p>
            </div>

            <button
              type="button"
              onClick={ubicarUsuario}
              disabled={buscandoUbicacion}
              aria-label="Usar mi ubicación"
              className={`rounded-xl p-2 text-blue-400 hover:bg-blue-500/10 ${buscandoUbicacion
                ? "animate-pulse opacity-60"
                : ""
                }`}
            >
              <LocateFixed size={22} />
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categorias.map((categoria) => (
              <button
                type="button"
                key={categoria}
                onClick={() =>
                  seleccionarCategoria(categoria)
                }
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium ${categoriaActiva === categoria
                  ? "bg-red-500 text-white"
                  : "border border-white/10 bg-white/5 text-slate-400"
                  }`}
              >
                {categoria}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setVista("mapa")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm ${vista === "mapa"
                ? "bg-white/10 text-white"
                : "text-slate-500"
                }`}
            >
              <MapIcon size={17} />
              Mapa
            </button>

            <button
              type="button"
              onClick={() => setVista("lista")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm ${vista === "lista"
                ? "bg-white/10 text-white"
                : "text-slate-500"
                }`}
            >
              <List size={17} />
              Lista
            </button>
          </div>
        </header>

        <main>
          {vista === "mapa" ? (
            <section className="relative h-[calc(100vh-185px)] min-h-[520px] overflow-hidden bg-[#0b2138]">
              <MapContainer
                center={centroSantiago}
                zoom={13}
                scrollWheelZoom
                zoomControl
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ControladorMapa destino={destinoMapa} />

                {reportesVisibles.map((reporte) => (
                  <Marker
                    key={reporte.id}
                    position={reporte.coordenadas}
                    icon={crearIconoReporte(reporte)}
                    eventHandlers={{
                      click: () =>
                        setReporteSeleccionado(reporte),
                    }}
                  >
                    <Popup>
                      <div
                        style={{
                          minWidth: "180px",
                          color: "#0f172a",
                        }}
                      >
                        <strong>{reporte.titulo}</strong>

                        <p
                          style={{
                            margin: "5px 0",
                            fontSize: "12px",
                          }}
                        >
                          {reporte.ubicacion}
                        </p>

                        <small>
                          {reporte.confirmaciones} confirmaciones
                        </small>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {ubicacionUsuario && (
                  <Marker
                    position={ubicacionUsuario}
                    icon={iconoUsuario}
                  >
                    <Popup>Esta es tu ubicación aproximada.</Popup>
                  </Marker>
                )}
              </MapContainer>

              <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-full border border-white/10 bg-[#06101f]/90 px-3 py-2 text-xs text-slate-300 shadow-xl backdrop-blur">
                {reportesVisibles.length} reportes
              </div>

              {reporteSeleccionado && (
                <article className="absolute bottom-5 left-4 right-4 z-[500] rounded-3xl border border-white/10 bg-[#0b1626]/95 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${reporteSeleccionado.color}`}
                    >
                      {(() => {
                        const Icono =
                          reporteSeleccionado.icono;

                        return <Icono size={22} />;
                      })()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-red-400">
                        {reporteSeleccionado.categoria}
                      </p>

                      <h2 className="mt-1 font-semibold">
                        {reporteSeleccionado.titulo}
                      </h2>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {reporteSeleccionado.ubicacion}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {
                          reporteSeleccionado.confirmaciones
                        }{" "}
                        confirmaciones ·{" "}
                        {reporteSeleccionado.tiempo}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setReporteSeleccionado(null)
                      }
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400"
                    >
                      Cerrar
                    </button>
                  </div>
                </article>
              )}
            </section>
          ) : (
            <section className="space-y-3 px-4 py-5">
              {reportesVisibles.map((reporte) => {
                const Icono = reporte.icono;

                return (
                  <button
                    type="button"
                    key={reporte.id}
                    onClick={() =>
                      seleccionarReporte(reporte)
                    }
                    className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.06]"
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${reporte.color}`}
                    >
                      <Icono size={22} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium text-red-400">
                        {reporte.categoria}
                      </span>

                      <span className="mt-1 block font-semibold">
                        {reporte.titulo}
                      </span>

                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {reporte.ubicacion}
                      </span>

                      <span className="mt-2 block text-xs text-slate-400">
                        {reporte.confirmaciones} confirmaciones
                        {" · "}
                        {reporte.tiempo}
                      </span>
                    </span>

                    <MapPin
                      size={18}
                      className="mt-1 shrink-0 text-slate-600"
                    />
                  </button>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
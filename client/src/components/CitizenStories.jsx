import { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    ImagePlus,
    Plus,
    Radio,
    Sparkles,
    Type,
    UploadCloud,
    Video,
    Trash2,
    X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
    crearHistoria as crearHistoriaAPI,
    eliminarHistoria as eliminarHistoriaAPI,
    obtenerHistorias,
    registrarVistaHistoria,
} from "../services/historiaService";
import { subirArchivo } from "../services/contentService";

const TEMAS = {
    azul: {
        nombre: "Actualización",
        clase: "from-blue-600 via-violet-600 to-red-500",
    },
    verde: {
        nombre: "Avance",
        clase: "from-emerald-600 via-cyan-500 to-blue-600",
    },
    naranja: {
        nombre: "Atención",
        clase: "from-amber-500 via-orange-500 to-red-600",
    },
    violeta: {
        nombre: "Comunidad",
        clase: "from-fuchsia-600 via-pink-500 to-rose-500",
    },
};

const obtenerIniciales = (nombre = "") =>
    nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((palabra) => palabra[0]?.toUpperCase())
        .join("") || "RD";

const formatearTiempo = (fecha) => {
    const instante = new Date(fecha).getTime();
    if (!Number.isFinite(instante)) return "Ahora";

    const segundos = Math.max(0, Math.floor((Date.now() - instante) / 1000));
    if (segundos < 60) return "Ahora";
    if (segundos < 3600) return `Hace ${Math.floor(segundos / 60)} min`;
    if (segundos < 86400) return `Hace ${Math.floor(segundos / 3600)} h`;
    return "Expira pronto";
};

const obtenerUsuarioActual = () => {
    try {
        return JSON.parse(localStorage.getItem("reportard_user") || "{}");
    } catch {
        return {};
    }
};

export default function CitizenStories({ perfil }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [historias, setHistorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [historiaActiva, setHistoriaActiva] = useState(null);
    const [progreso, setProgreso] = useState(0);
    const [mostrarCrear, setMostrarCrear] = useState(false);
    const [texto, setTexto] = useState("");
    const [tema, setTema] = useState("azul");
    const [publicando, setPublicando] = useState(false);
    const [historiaAEliminar, setHistoriaAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [modoCreacion, setModoCreacion] = useState("texto");
    const [archivo, setArchivo] = useState(null);
    const [vistaPrevia, setVistaPrevia] = useState("");
    const [errorCrear, setErrorCrear] = useState("");
    const [fasePublicacion, setFasePublicacion] = useState("");
    const [textoPosicion, setTextoPosicion] = useState({ x: 50, y: 50 });
    const [textoTamano, setTextoTamano] = useState(1);
    const inputArchivo = useRef(null);
    const previewRef = useRef(null);

    const usuarioActual = useMemo(obtenerUsuarioActual, []);
    const usuarioActualId = String(usuarioActual?._id || usuarioActual?.id || "");
    const token = localStorage.getItem("reportard_token") || "";

    const limpiarArchivo = () => {
        if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        setArchivo(null);
        setVistaPrevia("");
        if (inputArchivo.current) inputArchivo.current.value = "";
    };

    const cerrarCreador = () => {
        if (publicando) return;
        limpiarArchivo();
        setTexto("");
        setTema("azul");
        setModoCreacion("texto");
        setTextoPosicion({ x: 50, y: 50 });
        setTextoTamano(1);
        setErrorCrear("");
        setMostrarCrear(false);
    };

    useEffect(() => {
        return () => {
            if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        };
    }, [vistaPrevia]);

    const abrirSelector = (tipo) => {
        if (!inputArchivo.current || publicando) return;
        inputArchivo.current.accept = tipo === "imagen" ? "image/*" : "video/*";
        inputArchivo.current.click();
    };

    const seleccionarArchivo = (evento) => {
        const seleccionado = evento.target.files?.[0];
        if (!seleccionado) return;

        const esImagen = seleccionado.type.startsWith("image/");
        const esVideo = seleccionado.type.startsWith("video/");
        if (!esImagen && !esVideo) {
            setErrorCrear("Selecciona una foto o un video válido.");
            return;
        }

        const limite = 25 * 1024 * 1024;
        if (seleccionado.size > limite) {
            setErrorCrear("El archivo no puede superar los 25 MB.");
            return;
        }

        if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        setArchivo(seleccionado);
        setVistaPrevia(URL.createObjectURL(seleccionado));
        setModoCreacion(esImagen ? "imagen" : "video");
        setErrorCrear("");
    };

    const moverTexto = (evento) => {
        if (!previewRef.current || !texto.trim()) return;

        const rect = previewRef.current.getBoundingClientRect();
        const x = Math.min(90, Math.max(10, ((evento.clientX - rect.left) / rect.width) * 100));
        const y = Math.min(88, Math.max(12, ((evento.clientY - rect.top) / rect.height) * 100));

        setTextoPosicion({ x, y });
    };

    const iniciarArrastreTexto = (evento) => {
        if (!vistaPrevia || !texto.trim() || publicando) return;

        evento.preventDefault();
        evento.currentTarget.setPointerCapture?.(evento.pointerId);
        moverTexto(evento);
    };

    const arrastrarTexto = (evento) => {
        if (!evento.currentTarget.hasPointerCapture?.(evento.pointerId)) return;
        moverTexto(evento);
    };

    const terminarArrastreTexto = (evento) => {
        if (evento.currentTarget.hasPointerCapture?.(evento.pointerId)) {
            evento.currentTarget.releasePointerCapture?.(evento.pointerId);
        }
    };

    const conTiempoLimite = (promesa, milisegundos, mensaje) =>
        Promise.race([
            promesa,
            new Promise((_, reject) => {
                window.setTimeout(() => reject(new Error(mensaje)), milisegundos);
            }),
        ]);

    const cargarHistorias = async () => {
        try {
            setCargando(true);
            setError("");
            const datos = await obtenerHistorias();
            setHistorias(Array.isArray(datos) ? datos : []);
            localStorage.removeItem("reportard_historias");
        } catch (errorHistorias) {
            setError(errorHistorias.message || "No se pudieron cargar las historias.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarHistorias();
    }, []);

    useEffect(() => {
        const parametros = new URLSearchParams(location.search);
        if (parametros.get("crearHistoria") !== "1") return;

        setMostrarCrear(true);
        navigate("/", { replace: true });
    }, [location.search, navigate]);

    const historiasOrdenadas = useMemo(() => {
        const porAutor = new Map();

        historias.forEach((historia) => {
            const autor = historia?.autor || {};
            const autorId = String(autor?._id || autor?.id || "sin-autor");

            if (!porAutor.has(autorId)) {
                porAutor.set(autorId, {
                    autorId,
                    autor,
                    historias: [],
                });
            }

            porAutor.get(autorId).historias.push(historia);
        });

        const grupos = [...porAutor.values()].map((grupo) => ({
            ...grupo,
            propia: grupo.autorId === usuarioActualId,
            historias: grupo.historias.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            ),
        }));

        grupos.sort((a, b) => {
            if (a.propia && !b.propia) return -1;
            if (!a.propia && b.propia) return 1;

            const fechaA = new Date(a.historias.at(-1)?.createdAt || 0).getTime();
            const fechaB = new Date(b.historias.at(-1)?.createdAt || 0).getTime();
            return fechaB - fechaA;
        });

        return {
            grupos,
            planas: grupos.flatMap((grupo) => grupo.historias),
        };
    }, [historias, usuarioActualId]);

    const grupos = historiasOrdenadas.grupos;
    const historiasPlanas = historiasOrdenadas.planas;
    const grupoPropio = grupos.find((grupo) => grupo.propia);
    const historiaVisible =
        historiaActiva !== null ? historiasPlanas[historiaActiva] : null;

    const abrirGrupo = (grupo) => {
        const primera = grupo.historias[0]?._id;
        const indice = historiasPlanas.findIndex(
            (historia) => String(historia._id) === String(primera),
        );

        if (indice >= 0) setHistoriaActiva(indice);
    };

    useEffect(() => {
        if (!historiaVisible) return undefined;

        setProgreso(0);

        const autorId = String(
            historiaVisible?.autor?._id || historiaVisible?.autor?.id || "",
        );

        if (autorId && autorId !== usuarioActualId) {
            registrarVistaHistoria(historiaVisible._id)
                .then((respuesta) => {
                    const vistas = Number(respuesta?.vistas);
                    if (!Number.isFinite(vistas)) return;

                    setHistorias((actuales) =>
                        actuales.map((historia) =>
                            historia._id === historiaVisible._id
                                ? {
                                    ...historia,
                                    vistas,
                                    vistaPorMi: true,
                                }
                                : historia,
                        ),
                    );
                })
                .catch(() => { });
        }

        const intervalo = window.setInterval(() => {
            setProgreso((actual) => {
                if (actual >= 99) {
                    setHistoriaActiva((indiceActual) => {
                        if (indiceActual === null) return null;
                        return indiceActual < historiasPlanas.length - 1
                            ? indiceActual + 1
                            : null;
                    });
                    return 0;
                }

                return actual + 1;
            });
        }, 70);

        return () => window.clearInterval(intervalo);
    }, [historiaVisible?._id, historiasPlanas.length, usuarioActualId]);

    useEffect(() => {
        if (!historiaVisible && !mostrarCrear && !historiaAEliminar) return undefined;

        const cerrarConEscape = (evento) => {
            if (evento.key !== "Escape") return;

            if (historiaAEliminar) {
                setHistoriaAEliminar(null);
                return;
            }

            if (mostrarCrear) {
                cerrarCreador();
                return;
            }

            setHistoriaActiva(null);
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", cerrarConEscape);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", cerrarConEscape);
        };
    }, [historiaVisible, mostrarCrear, historiaAEliminar]);

    const publicarHistoria = async () => {
        const textoLimpio = texto.trim();
        if ((!textoLimpio && !archivo) || publicando) return;

        if (!token) {
            setErrorCrear("Tu sesión expiró. Inicia sesión nuevamente.");
            return;
        }

        try {
            setPublicando(true);
            setErrorCrear("");
            setError("");

            let mediaUrl = "";
            let mediaTipo = null;

            if (archivo) {
                setFasePublicacion(archivo.type.startsWith("video/") ? "Subiendo video..." : "Subiendo foto...");

                const subida = await conTiempoLimite(
                    subirArchivo(token, archivo),
                    60000,
                    "La subida está tardando demasiado. Inténtalo otra vez.",
                );

                mediaUrl = subida?.archivo?.url || "";
                mediaTipo = subida?.archivo?.tipo || "";

                if (!mediaUrl || !["imagen", "video"].includes(mediaTipo)) {
                    throw new Error("El servidor no devolvió correctamente el archivo subido.");
                }
            }

            setFasePublicacion("Guardando historia...");

            await conTiempoLimite(
                crearHistoriaAPI({
                    texto: textoLimpio,
                    mediaUrl,
                    mediaTipo: mediaTipo || null,
                    tema,

                    textoX: textoPosicion.x,
                    textoY: textoPosicion.y,
                    textoTamano,
                }),
                20000,
                "La historia tardó demasiado en guardarse.",
            );

            limpiarArchivo();
            setTexto("");
            setTema("azul");
            setModoCreacion("texto");
            setMostrarCrear(false);
            await cargarHistorias();
        } catch (errorPublicacion) {
            setErrorCrear(errorPublicacion.message || "No se pudo publicar la historia.");
        } finally {
            setPublicando(false);
            setFasePublicacion("");
        }
    };

    const confirmarEliminacion = async () => {
        if (!historiaAEliminar || eliminando) return;

        try {
            setEliminando(true);
            await eliminarHistoriaAPI(historiaAEliminar._id);

            setHistorias((actuales) =>
                actuales.filter((historia) => historia._id !== historiaAEliminar._id),
            );
            setHistoriaActiva(null);
            setHistoriaAEliminar(null);
        } catch (errorEliminacion) {
            setError(errorEliminacion.message || "No se pudo eliminar la historia.");
        } finally {
            setEliminando(false);
        }
    };

    const anterior = () => {
        setHistoriaActiva((indice) =>
            indice !== null && indice > 0 ? indice - 1 : indice,
        );
    };

    const siguiente = () => {
        setHistoriaActiva((indice) => {
            if (indice === null) return null;
            return indice < historiasPlanas.length - 1 ? indice + 1 : null;
        });
    };

    const temaVisible = TEMAS[historiaVisible?.tema] || TEMAS.azul;
    const esHistoriaPropia =
        String(historiaVisible?.autor?._id || "") === usuarioActualId;

    return (
        <>
            <section className="pb-6">
                <div className="mb-4 flex items-end justify-between gap-4 px-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-slate-100">Historias ciudadanas</h2>
                            <span className="rounded-full border border-violet-400/15 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
                                24 h
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Actualizaciones rápidas de lo que ocurre cerca de ti
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/en-vivo")}
                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/15 bg-red-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-red-400 transition hover:border-red-400/30 hover:bg-red-500/15 active:scale-95"
                    >
                        <Radio size={12} />
                        En vivo
                    </button>
                </div>

                {error && (
                    <div className="mx-5 mb-3 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3 text-xs leading-5 text-amber-200">
                        {error}
                    </div>
                )}

                <div className="story-scroll flex gap-3 overflow-x-auto px-5 pb-2">
                    <div className="relative flex w-[76px] shrink-0 flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                grupoPropio ? abrirGrupo(grupoPropio) : setMostrarCrear(true)
                            }
                            className="group"
                        >
                            <span
                                className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-full transition duration-300 group-hover:scale-105 group-active:scale-95 ${grupoPropio
                                    ? `bg-gradient-to-br p-[2px] ${TEMAS[grupoPropio.historias.at(-1)?.tema]?.clase ||
                                    TEMAS.azul.clase
                                    }`
                                    : "border border-dashed border-blue-400/45 bg-blue-500/10"
                                    }`}
                            >
                                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-[#06101f] bg-[#0b1626] text-sm font-bold text-white">
                                    {perfil?.foto ? (
                                        <img
                                            src={perfil.foto}
                                            alt={`Foto de ${perfil.nombre}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        obtenerIniciales(perfil?.nombre)
                                    )}
                                </span>

                                {grupoPropio?.historias?.length > 1 && (
                                    <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#06101f] bg-violet-500 px-1 text-[9px] font-bold text-white">
                                        {grupoPropio.historias.length}
                                    </span>
                                )}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMostrarCrear(true)}
                            aria-label="Crear historia"
                            className="absolute right-0 top-11 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#06101f] bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 active:scale-90"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>

                        <span className="w-full truncate text-center text-[10px] font-medium text-slate-400">
                            {grupoPropio ? "Tu historia" : "Crear historia"}
                        </span>
                    </div>

                    {cargando &&
                        [0, 1, 2].map((item) => (
                            <div
                                key={item}
                                className="flex w-[76px] shrink-0 animate-pulse flex-col items-center gap-2"
                            >
                                <span className="h-[68px] w-[68px] rounded-full bg-white/[0.06]" />
                                <span className="h-2.5 w-12 rounded-full bg-white/[0.05]" />
                            </div>
                        ))}

                    {!cargando &&
                        grupos
                            .filter((grupo) => !grupo.propia)
                            .map((grupo) => {
                                const ultima = grupo.historias.at(-1);
                                const temaGrupo = TEMAS[ultima?.tema] || TEMAS.azul;
                                const nombre = grupo.autor?.nombre || "Ciudadano";

                                const tieneHistoriaSinVer =
                                    grupo.historias.some(
                                        (historia) => !historia.vistaPorMi
                                    );

                                return (
                                    <button
                                        key={grupo.autorId}
                                        type="button"
                                        onClick={() => abrirGrupo(grupo)}
                                        className="group flex w-[76px] shrink-0 flex-col items-center gap-2"
                                    >
                                        <span
                                            className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-full p-[2px] transition duration-300 group-hover:scale-105 group-active:scale-95 ${tieneHistoriaSinVer
                                                    ? `bg-gradient-to-br ${temaGrupo.clase}`
                                                    : "bg-slate-700"
                                                }`}
                                        >
                                            <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-[#06101f] bg-[#0b1626] text-sm font-bold text-white">
                                                {grupo.autor?.foto ? (
                                                    <img
                                                        src={grupo.autor.foto}
                                                        alt={`Foto de ${nombre}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    obtenerIniciales(nombre)
                                                )}
                                            </span>

                                            {grupo.historias.length > 1 && (
                                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#06101f] bg-slate-950 px-1 text-[9px] font-bold text-white">
                                                    {grupo.historias.length}
                                                </span>
                                            )}
                                        </span>

                                        <span className="w-full truncate text-center text-[10px] text-slate-400 transition group-hover:text-white">
                                            {nombre.split(/\s+/)[0]}
                                        </span>
                                    </button>
                                );
                            })}

                    {!cargando && grupos.filter((grupo) => !grupo.propia).length === 0 && (
                        <button
                            type="button"
                            onClick={() => setMostrarCrear(true)}
                            className="flex min-h-[88px] min-w-[205px] flex-1 items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 text-left transition hover:border-blue-400/20 hover:bg-blue-500/[0.04]"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                                <Sparkles size={17} />
                            </span>
                            <span>
                                <strong className="block text-xs font-semibold text-slate-300">
                                    Abre el momento
                                </strong>
                                <span className="mt-1 block text-[10px] leading-4 text-slate-500">
                                    Comparte una actualización breve con la comunidad.
                                </span>
                            </span>
                        </button>
                    )}
                </div>
            </section>

            {historiaVisible && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Historia de ${historiaVisible?.autor?.nombre || "un ciudadano"}`}
                    className="story-viewer-enter fixed inset-0 z-[80] flex justify-center bg-black"
                >
                    <div
                        className={`relative flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-gradient-to-br ${temaVisible.clase}`}
                    >
                        {historiaVisible.mediaUrl && historiaVisible.mediaTipo === "imagen" && (
                            <img
                                src={historiaVisible.mediaUrl}
                                alt="Contenido de la historia"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        )}

                        {historiaVisible.mediaUrl && historiaVisible.mediaTipo === "video" && (
                            <video
                                src={historiaVisible.mediaUrl}
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.68))]" />

                        <header className="relative z-20 px-4 pt-4">
                            <div className="flex gap-1">
                                {historiasPlanas.map((historia, indice) => (
                                    <span
                                        key={historia._id}
                                        className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                                    >
                                        <span
                                            className="block h-full rounded-full bg-white transition-[width] duration-75"
                                            style={{
                                                width:
                                                    indice < historiaActiva
                                                        ? "100%"
                                                        : indice === historiaActiva
                                                            ? `${progreso}%`
                                                            : "0%",
                                            }}
                                        />
                                    </span>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const id = historiaVisible?.autor?._id;
                                        if (!id || esHistoriaPropia) navigate("/perfil");
                                        else navigate(`/usuario/${id}`);
                                        setHistoriaActiva(null);
                                    }}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-black/20 text-xs font-bold backdrop-blur"
                                >
                                    {historiaVisible?.autor?.foto ? (
                                        <img
                                            src={historiaVisible.autor.foto}
                                            alt={`Foto de ${historiaVisible.autor.nombre}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        obtenerIniciales(historiaVisible?.autor?.nombre)
                                    )}
                                </button>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="truncate text-sm font-semibold">
                                            {historiaVisible?.autor?.nombre || "Ciudadano ReportaRD"}
                                        </h2>
                                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-semibold text-white/70 backdrop-blur">
                                            {temaVisible.nombre}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/65">
                                        <Clock3 size={11} />
                                        {formatearTiempo(historiaVisible.createdAt)}
                                    </p>
                                </div>

                                {esHistoriaPropia && (
                                    <button
                                        type="button"
                                        onClick={() => setHistoriaAEliminar(historiaVisible)}
                                        aria-label="Eliminar historia"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur transition hover:bg-red-500/40 hover:text-white active:scale-95"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setHistoriaActiva(null)}
                                    aria-label="Cerrar historia"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur transition hover:bg-black/35 active:scale-95"
                                >
                                    <X size={21} />
                                </button>
                            </div>
                        </header>

                        <button
                            type="button"
                            onClick={anterior}
                            aria-label="Historia anterior"
                            disabled={historiaActiva === 0}
                            className="absolute bottom-24 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur transition hover:bg-black/35 active:scale-95 disabled:opacity-0"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            type="button"
                            onClick={siguiente}
                            aria-label="Historia siguiente"
                            className="absolute bottom-24 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur transition hover:bg-black/35 active:scale-95"
                        >
                            <ChevronRight size={24} />
                        </button>

                        <main className="relative z-10 flex-1">
                            {historiaVisible.texto && (
                                <div
                                    className="story-content-enter absolute max-w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-[1.6rem] bg-black/20 px-5 py-4 text-center backdrop-blur-[3px]"
                                    style={{
                                        left: `${historiaVisible?.textoX ?? 50}%`,
                                        top: `${historiaVisible?.textoY ?? 58}%`,
                                    }}
                                >
                                    <p
                                        className="font-bold leading-snug drop-shadow-lg"
                                        style={{
                                            fontSize: `${24 * (historiaVisible?.textoTamano ?? 1)}px`,
                                        }}
                                    >
                                        {historiaVisible.texto}
                                    </p>
                                </div>
                            )}
                        </main>

                        <footer className="relative z-20 flex items-center justify-between gap-3 px-5 pb-8 text-xs text-white/75">
                            <span className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur">
                                <Eye size={14} />
                                {Number(historiaVisible.vistas) || 0} vistas
                            </span>

                            <span className="rounded-full bg-black/20 px-3 py-2 backdrop-blur">
                                Visible durante 24 h
                            </span>
                        </footer>
                    </div>
                </div>
            )}

            {mostrarCrear && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="titulo-crear-historia"
                    className="fixed inset-0 z-[85] flex items-center justify-center bg-[#02060d]/88 p-3 backdrop-blur-xl sm:p-5"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) cerrarCreador();
                    }}
                >
                    <input
                        ref={inputArchivo}
                        type="file"
                        className="hidden"
                        onChange={seleccionarArchivo}
                    />

                    <div className="story-modal-enter relative w-full max-w-[780px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] shadow-[0_30px_100px_rgba(0,0,0,.72)]">
                        <div className="pointer-events-none absolute inset-x-16 -top-28 h-52 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 right-10 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />

                        <button
                            type="button"
                            onClick={cerrarCreador}
                            aria-label="Cerrar"
                            className="absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/90 backdrop-blur-xl transition hover:bg-black/55 active:scale-95"
                        >
                            <X size={19} />
                        </button>

                        <div className="grid md:grid-cols-[0.92fr_1.08fr]">
                            {/* PREVIEW / IDENTIDAD */}
                            <div ref={previewRef} className="relative min-h-[315px] overflow-hidden md:min-h-[560px]">
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${TEMAS[tema].clase}`}
                                />

                                {vistaPrevia && modoCreacion === "imagen" && (
                                    <img
                                        src={vistaPrevia}
                                        alt="Vista previa de la historia"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                )}

                                {vistaPrevia && modoCreacion === "video" && (
                                    <video
                                        src={vistaPrevia}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                )}

                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.18),transparent_26%),linear-gradient(to_bottom,rgba(2,8,18,.08),rgba(2,8,18,.78))]" />
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#03101d]/80 to-transparent" />

                                <div className="relative z-10 flex h-full min-h-[315px] flex-col p-5 md:min-h-[560px] md:p-6">
                                    <div className="flex items-center justify-between pr-12">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur-xl">
                                            Reporta<span className="-ml-2 text-red-400">RD</span>
                                            <span className="h-1 w-1 rounded-full bg-white/40" />
                                            24 h
                                        </span>

                                        <span className="hidden rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white/80 backdrop-blur-xl sm:inline-flex">
                                            Momento ciudadano
                                        </span>
                                    </div>

                                    <div className="relative flex flex-1 items-center justify-center px-3 py-8 text-center">
                                        <div className="max-w-[270px]">
                                            {!texto && (
                                                <span className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-semibold text-white/90 backdrop-blur-xl">
                                                    <Sparkles size={12} />
                                                    {TEMAS[tema].nombre}
                                                </span>
                                            )}

                                            {texto ? (
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    title={vistaPrevia ? "Arrastra el texto para moverlo" : undefined}
                                                    onPointerDown={iniciarArrastreTexto}
                                                    onPointerMove={arrastrarTexto}
                                                    onPointerUp={terminarArrastreTexto}
                                                    onPointerCancel={terminarArrastreTexto}
                                                    className={`absolute max-w-[82%] -translate-x-1/2 -translate-y-1/2 select-none rounded-[1.45rem] bg-black/20 px-4 py-3 backdrop-blur-[3px] ${vistaPrevia ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
                                                    style={{ left: `${textoPosicion.x}%`, top: `${textoPosicion.y}%` }}
                                                >
                                                    <span className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[9px] font-semibold text-white/90">
                                                        <Sparkles size={10} />
                                                        {TEMAS[tema].nombre}
                                                    </span>
                                                    <p
                                                        className="font-black leading-[1.12] tracking-[-0.02em] text-white drop-shadow-xl"
                                                        style={{
                                                            fontSize: `${26 * textoTamano}px`,
                                                        }}
                                                    >
                                                        {texto}
                                                    </p>
                                                    {vistaPrevia && (
                                                        <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
                                                            Arrastra para mover
                                                        </span>
                                                    )}
                                                </div>
                                            ) : vistaPrevia ? (
                                                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
                                                    <p className="text-sm font-semibold text-white/90">
                                                        Tu evidencia ya está lista
                                                    </p>
                                                    <p className="mt-1 text-[11px] leading-4 text-white/60">
                                                        Añade contexto para que la comunidad entienda qué está pasando.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-[27px] font-black leading-[1.08] tracking-[-0.03em] text-white md:text-[31px]">
                                                        Lo que pasa cerca de ti.
                                                    </p>
                                                    <p className="mt-2 text-[15px] font-semibold text-white/85">
                                                        Contado por quienes están ahí.
                                                    </p>
                                                    <p className="mx-auto mt-4 max-w-[240px] text-[11px] leading-5 text-white/55">
                                                        Texto, foto o video. Una actualización real de tu comunidad.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3.5 py-3 backdrop-blur-xl">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-[10px] font-bold text-white">
                                                {perfil?.foto ? (
                                                    <img
                                                        src={perfil.foto}
                                                        alt={perfil?.nombre || "Tu perfil"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    obtenerIniciales(perfil?.nombre)
                                                )}
                                            </span>
                                            <div className="min-w-0 text-left">
                                                <p className="truncate text-xs font-semibold text-white">
                                                    {perfil?.nombre || "Ciudadano ReportaRD"}
                                                </p>
                                                <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/45">
                                                    Visible en ReportaRD
                                                </p>
                                            </div>
                                        </div>
                                        <Clock3 size={15} className="shrink-0 text-white/55" />
                                    </div>
                                </div>
                            </div>

                            {/* CONTROLES */}
                            <div className="relative z-10 flex flex-col border-t border-white/10 bg-[#081523]/95 p-5 md:border-l md:border-t-0 md:p-6">
                                <div className="pr-12">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-400">
                                        Crear historia
                                    </p>
                                    <h2
                                        id="titulo-crear-historia"
                                        className="mt-1 text-[22px] font-black tracking-[-0.02em] text-slate-100"
                                    >
                                        Comparte un momento
                                    </h2>
                                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                                        Publica algo útil, breve y real. Desaparecerá en 24 horas.
                                    </p>
                                </div>

                                <div className="mt-5 grid grid-cols-3 rounded-2xl border border-white/[0.08] bg-black/20 p-1.5">
                                    {[
                                        { id: "texto", label: "Texto", icono: Type },
                                        { id: "imagen", label: "Foto", icono: ImagePlus },
                                        { id: "video", label: "Video", icono: Video },
                                    ].map(({ id, label, icono: Icono }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            disabled={publicando}
                                            onClick={() => {
                                                if (id === "texto") {
                                                    limpiarArchivo();
                                                    setModoCreacion("texto");
                                                    return;
                                                }
                                                abrirSelector(id);
                                            }}
                                            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition active:scale-[.98] ${modoCreacion === id
                                                ? "bg-white text-slate-950 shadow-lg"
                                                : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                                                }`}
                                        >
                                            <Icono size={15} />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {vistaPrevia && (
                                    <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] px-3 py-2.5">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                                                <UploadCloud size={15} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="max-w-[190px] truncate text-[11px] font-semibold text-slate-200">
                                                    {archivo?.name}
                                                </p>
                                                <p className="text-[9px] text-slate-500">
                                                    {modoCreacion === "video" ? "Video" : "Foto"} listo para publicar
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                limpiarArchivo();
                                                setModoCreacion("texto");
                                            }}
                                            className="ml-2 rounded-lg px-2 py-1 text-[10px] font-semibold text-red-300 transition hover:bg-red-500/10"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-300">
                                            {archivo ? "¿Qué está pasando?" : "Escribe tu actualización"}
                                        </label>
                                        <span className="text-[10px] text-slate-600">{texto.length}/280</span>
                                    </div>
                                    <textarea
                                        value={texto}
                                        onChange={(evento) => setTexto(evento.target.value.slice(0, 280))}
                                        placeholder={
                                            modoCreacion === "texto"
                                                ? "Ej.: Ya volvió el agua en nuestro sector..."
                                                : "Añade contexto a esta evidencia..."
                                        }
                                        rows={4}
                                        autoFocus={modoCreacion === "texto"}
                                        className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:bg-white/[0.055]"
                                    />
                                </div>

                                <div className="mt-4">

                                    {texto.trim() && (
                                        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
                                            <div>
                                                <p className="text-[11px] font-semibold text-slate-300">
                                                    Tamaño del texto
                                                </p>

                                                <p className="mt-0.5 text-[9px] text-slate-600">
                                                    Ajusta cómo se verá en la historia
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={textoTamano <= 0.6}
                                                    onClick={() =>
                                                        setTextoTamano((actual) =>
                                                            Math.max(0.6, Number((actual - 0.1).toFixed(1)))
                                                        )
                                                    }
                                                    className="flex h-9 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-2 text-sm font-bold text-white transition hover:bg-white/[0.08] active:scale-95 disabled:opacity-30"
                                                >
                                                    A−
                                                </button>

                                                <span className="min-w-10 text-center text-[10px] font-semibold text-slate-400">
                                                    {Math.round(textoTamano * 100)}%
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={textoTamano >= 1.8}
                                                    onClick={() =>
                                                        setTextoTamano((actual) =>
                                                            Math.min(1.8, Number((actual + 0.1).toFixed(1)))
                                                        )
                                                    }
                                                    className="flex h-9 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-2 text-sm font-bold text-white transition hover:bg-white/[0.08] active:scale-95 disabled:opacity-30"
                                                >
                                                    A+
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-2.5 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-300">
                                            Contexto ciudadano
                                        </p>
                                        <p className="text-[9px] text-slate-600">Ayuda a entenderlo rápido</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(TEMAS).map(([clave, datos]) => (
                                            <button
                                                type="button"
                                                key={clave}
                                                onClick={() => setTema(clave)}
                                                className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${tema === clave
                                                    ? "border-white/20 bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.03)]"
                                                    : "border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-300"
                                                    }`}
                                            >
                                                <span className={`h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br ${datos.clase} shadow-lg`} />
                                                <span className="text-[11px] font-semibold">{datos.nombre}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {errorCrear && (
                                    <div className="mt-3 rounded-xl border border-red-400/15 bg-red-500/10 px-3.5 py-2.5 text-[11px] leading-5 text-red-200">
                                        {errorCrear}
                                    </div>
                                )}

                                <div className="mt-auto pt-5">
                                    <button
                                        type="button"
                                        onClick={publicarHistoria}
                                        disabled={(!texto.trim() && !archivo) || publicando}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-red-500 px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(99,102,241,.18)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
                                    >
                                        <Plus size={18} />
                                        {publicando
                                            ? fasePublicacion || "Publicando..."
                                            : "Publicar por 24 horas"}
                                    </button>

                                    <p className="mt-2.5 text-center text-[9px] leading-4 text-slate-600">
                                        Solo contenido real. Evita exponer datos personales de terceros.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {historiaAEliminar && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="titulo-eliminar-historia"
                    className="fixed inset-0 z-[95] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget && !eliminando) {
                            setHistoriaAEliminar(null);
                        }
                    }}
                >
                    <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0b1626] p-6 shadow-2xl shadow-black/50">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                            <Trash2 size={21} />
                        </span>

                        <h2 id="titulo-eliminar-historia" className="mt-5 text-xl font-bold">
                            ¿Eliminar esta historia?
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Dejará de estar disponible para la comunidad inmediatamente. Esta acción no se puede deshacer.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                disabled={eliminando}
                                onClick={() => setHistoriaAEliminar(null)}
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={eliminando}
                                onClick={confirmarEliminacion}
                                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
                            >
                                {eliminando ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .story-scroll {
          scrollbar-width: none;
        }
        .story-scroll::-webkit-scrollbar {
          display: none;
        }
        .story-viewer-enter {
          animation: storyViewerEnter 220ms ease-out both;
        }
        .story-content-enter {
          animation: storyContentEnter 420ms cubic-bezier(.2,.8,.2,1) both;
        }
        .story-modal-enter {
          animation: storyModalEnter 280ms cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes storyViewerEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes storyContentEnter {
          from { opacity: 0; transform: translateY(16px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes storyModalEnter {
          from { opacity: 0; transform: translateY(22px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .story-viewer-enter,
          .story-content-enter,
          .story-modal-enter {
            animation: none;
          }
        }
      `}</style>
        </>
    );
}
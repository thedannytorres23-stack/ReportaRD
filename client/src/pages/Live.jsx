import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Eye,
  MessageCircle,
  Mic,
  MicOff,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

const mensajesIniciales = [
  { id: 1, autor: "María", texto: "¡Saludos desde Los Jardines! 👋" },
  { id: 2, autor: "José", texto: "Se escucha y se ve muy bien." },
];

const formatearTiempo = (segundos) => {
  const minutos = Math.floor(segundos / 60).toString().padStart(2, "0");
  const resto = (segundos % 60).toString().padStart(2, "0");
  return `${minutos}:${resto}`;
};

export default function Live() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [transmitiendo, setTransmitiendo] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("Comunidad");
  const [camaraActiva, setCamaraActiva] = useState(true);
  const [microfonoActivo, setMicrofonoActivo] = useState(true);
  const [segundos, setSegundos] = useState(0);
  const [espectadores, setEspectadores] = useState(12);
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [errorCamara, setErrorCamara] = useState("");

  useEffect(() => {
    let cancelado = false;

    const prepararCamara = async () => {
      if (!camaraActiva) {
        streamRef.current?.getVideoTracks().forEach((pista) => pista.stop());
        streamRef.current = null;
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorCamara("Tu navegador no permite acceder a la cámara.");
        return;
      }

      try {
        if (!streamRef.current) {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: true,
          });
        }

        if (!cancelado && videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setErrorCamara("");
      } catch {
        setErrorCamara("Permite el acceso a la cámara para crear el directo.");
      }
    };

    prepararCamara();
    return () => {
      cancelado = true;
    };
  }, [camaraActiva, transmitiendo]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((pista) => {
      pista.enabled = microfonoActivo;
    });
  }, [microfonoActivo]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((pista) => pista.stop());
    };
  }, []);

  useEffect(() => {
    if (!transmitiendo) return undefined;

    const reloj = window.setInterval(() => {
      setSegundos((actual) => actual + 1);
    }, 1000);

    const audiencia = window.setInterval(() => {
      setEspectadores((actual) => actual + (Math.random() > 0.45 ? 1 : 0));
    }, 5000);

    return () => {
      window.clearInterval(reloj);
      window.clearInterval(audiencia);
    };
  }, [transmitiendo]);

  const iniciarDirecto = () => {
    if (!titulo.trim()) return;

    const sesion = {
      id: `live-${Date.now()}`,
      titulo: titulo.trim(),
      categoria,
      iniciadoEn: new Date().toISOString(),
    };

    localStorage.setItem("reportard_live_session", JSON.stringify(sesion));
    setTransmitiendo(true);
  };

  const finalizarDirecto = () => {
    if (!window.confirm("¿Quieres finalizar esta transmisión en vivo?")) return;
    localStorage.removeItem("reportard_live_session");
    streamRef.current?.getTracks().forEach((pista) => pista.stop());
    navigate("/");
  };

  const enviarMensaje = (evento) => {
    evento.preventDefault();
    const texto = inputRef.current?.value.trim();
    if (!texto) return;

    setMensajes((actuales) => [
      ...actuales,
      { id: Date.now(), autor: "Tú", texto },
    ]);
    inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-24">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#06101f]/90 px-5 py-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="rounded-xl bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="text-center">
            <h1 className="font-bold">ReportaRD en vivo</h1>
            <p className="text-[10px] text-slate-500">Conecta con tu comunidad</p>
          </div>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <Radio size={19} />
          </span>
        </header>

        {!transmitiendo ? (
          <main className="px-5 py-6">
            <section className="relative overflow-hidden rounded-3xl border border-red-500/15 bg-gradient-to-br from-red-500/10 via-[#0b1626] to-blue-500/10 p-5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/15 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/25"
                >
                  <Radio size={23} />
                </motion.span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Nuevo directo</p>
                  <h2 className="mt-1 text-2xl font-bold">Muestra lo que está pasando</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Informa, conversa y conecta en tiempo real con ciudadanos cercanos.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1626]">
              <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#60a5fa_1px,transparent_1px)] [background-size:22px_22px]" />
                {camaraActiva && !errorCamara ? (
                  <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="relative text-center text-slate-500">
                    {camaraActiva ? <Camera size={42} className="mx-auto text-blue-400" /> : <VideoOff size={42} className="mx-auto" />}
                    <p className="mt-3 px-6 text-sm">{errorCamara || "Cámara desactivada"}</p>
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] text-slate-300 backdrop-blur">Vista previa</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setCamaraActiva((actual) => !actual)}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm transition ${camaraActiva ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}
                >
                  {camaraActiva ? <Video size={18} /> : <VideoOff size={18} />}
                  Cámara
                </button>
                <button
                  type="button"
                  onClick={() => setMicrofonoActivo((actual) => !actual)}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm transition ${microfonoActivo ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}
                >
                  {microfonoActivo ? <Mic size={18} /> : <MicOff size={18} />}
                  Micrófono
                </button>
              </div>
            </section>

            <section className="mt-5 space-y-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <label className="block">
                <span className="text-sm font-semibold">Título del directo</span>
                <input
                  value={titulo}
                  onChange={(evento) => setTitulo(evento.target.value)}
                  maxLength={80}
                  placeholder="Ej.: Jornada comunitaria en Los Jardines"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-red-500/50"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Categoría</span>
                <select
                  value={categoria}
                  onChange={(evento) => setCategoria(evento.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1626] px-4 py-3 text-sm outline-none focus:border-red-500/50"
                >
                  <option>Comunidad</option>
                  <option>Reporte ciudadano</option>
                  <option>Noticias locales</option>
                  <option>Actividad pública</option>
                </select>
              </label>

              <div className="flex items-start gap-3 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-3 text-xs leading-5 text-slate-400">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-400" />
                Los directos deben respetar las normas de convivencia y la privacidad de otras personas.
              </div>

              <button
                type="button"
                disabled={!titulo.trim()}
                onClick={iniciarDirecto}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-4 font-bold shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Radio size={20} /> Iniciar transmisión
              </button>
            </section>
          </main>
        ) : (
          <main>
            <section className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#60a5fa_1px,transparent_1px)] [background-size:24px_24px]" />
              {camaraActiva && !errorCamara ? (
                <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <Camera size={58} className="relative text-blue-400/70" />
              )}

              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold shadow-lg shadow-red-500/30">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> EN VIVO
                  </span>
                  <span className="rounded-full bg-black/45 px-3 py-1.5 text-xs backdrop-blur">
                    {formatearTiempo(segundos)}
                  </span>
                </div>
                <button type="button" onClick={finalizarDirecto} className="rounded-full bg-black/45 p-2 backdrop-blur hover:bg-red-500">
                  <X size={20} />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="mb-3 flex gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-black/45 px-3 py-1.5 text-xs backdrop-blur"><Eye size={14} /> {espectadores}</span>
                  <span className="rounded-full bg-black/45 px-3 py-1.5 text-xs backdrop-blur">{categoria}</span>
                </div>
                <h2 className="text-xl font-bold drop-shadow">{titulo}</h2>
              </div>
            </section>

            <section className="border-t border-white/10 px-5 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold"><MessageCircle size={18} className="text-blue-400" /> Conversación</h3>
                <span className="flex items-center gap-1 text-xs text-green-400"><Users size={14} /> Comunidad activa</span>
              </div>

              <div className="max-h-44 space-y-3 overflow-y-auto">
                {mensajes.map((mensaje) => (
                  <div key={mensaje.id} className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm">
                    <strong className="mr-2 text-blue-400">{mensaje.autor}</strong>
                    <span className="text-slate-300">{mensaje.texto}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={enviarMensaje} className="mt-4 flex gap-2">
                <input ref={inputRef} placeholder="Escribe un mensaje..." className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-blue-500/40" />
                <button type="submit" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white"><Send size={18} /></button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-600"><Sparkles size={12} /> Directo protegido por ReportaRD</div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}
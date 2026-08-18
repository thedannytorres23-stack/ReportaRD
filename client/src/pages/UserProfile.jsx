import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRoundX,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { crearChatPrivado } from "../services/chatService";
import { obtenerUsuario } from "../services/userService";

const obtenerSesion = () => {
  try {
    return {
      token: localStorage.getItem("reportard_token") || "",
      usuario: JSON.parse(
        localStorage.getItem("reportard_user") || "null",
      ),
    };
  } catch {
    return { token: "", usuario: null };
  }
};

const obtenerIniciales = (nombre = "") =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join("") || "RD";

const formatearFecha = (fecha) => {
  if (!fecha) return "";

  return new Intl.DateTimeFormat("es-DO", {
    month: "long",
    year: "numeric",
  }).format(new Date(fecha));
};

export default function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
const sesion = useMemo(() => obtenerSesion(), []);

  const [persona, setPersona] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [abriendoChat, setAbriendoChat] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarPerfil = async () => {
      if (!sesion.token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setCargando(true);
        setError("");
        const datos = await obtenerUsuario(id, sesion.token);

        if (activo) setPersona(datos.usuario);
      } catch (errorSolicitud) {
        if (activo) setError(errorSolicitud.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [id, navigate, sesion.token]);

  const abrirChat = async () => {
    if (!persona || abriendoChat) return;

    try {
      setAbriendoChat(true);
      setError("");

      const datos = await crearChatPrivado(persona._id, sesion.token);

      navigate(`/mensajes?chat=${datos.conversacion._id}`);
    } catch (errorSolicitud) {
      setError(errorSolicitud.message);
      setAbriendoChat(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <LoaderCircle size={22} className="animate-spin text-blue-400" />
          Cargando perfil ciudadano...
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="max-w-sm text-center">
          <UserRoundX size={44} className="mx-auto text-slate-700" />
          <h1 className="mt-4 text-xl font-bold">Perfil no encontrado</h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Este usuario ya no está disponible."}
          </p>
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

  const esMiPerfil =
    persona._id === (sesion.usuario?._id || sesion.usuario?.id);

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
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-violet-950">
            {persona.portada ? (
              <img
                src={persona.portada}
                alt={`Portada de ${persona.nombre}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />
            )}
          </div>

          <div className="px-5">
            <div className="relative z-10 -mt-14 flex items-end justify-between gap-3">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#06101f] bg-gradient-to-br from-blue-500 to-violet-600 text-3xl font-bold shadow-xl">
                {persona.foto ? (
                  <img
                    src={persona.foto}
                    alt={`Foto de ${persona.nombre}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  obtenerIniciales(persona.nombre)
                )}
              </div>

              {esMiPerfil ? (
                <button
                  type="button"
                  onClick={() => navigate("/editar-perfil")}
                  className="mb-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300"
                >
                  Editar perfil
                </button>
              ) : (
                <button
                  type="button"
                  onClick={abrirChat}
                  disabled={abriendoChat}
                  className="mb-2 flex items-center gap-2 rounded-2xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 active:scale-95 disabled:opacity-60"
                >
                  {abriendoChat ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <MessageCircle size={17} />
                  )}
                  {abriendoChat ? "Abriendo..." : "Mensaje"}
                </button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{persona.nombre}</h1>
                {persona.activo && (
                  <span className="h-3 w-3 rounded-full border-2 border-[#06101f] bg-green-400" />
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                @{persona.usuario}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {persona.biografia ||
                  "Este ciudadano todavía no ha escrito una biografía."}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-red-400" />
                  {persona.ubicacion || "República Dominicana"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={16} className="text-blue-400" />
                  Se unió en {formatearFecha(persona.createdAt)}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    persona.activo ? "bg-green-400" : "bg-slate-600"
                  }`}
                />
                <span
                  className={
                    persona.activo ? "text-green-400" : "text-slate-500"
                  }
                >
                  {persona.activo ? "Activo ahora" : "Actualmente desconectado"}
                </span>
              </div>
            </div>

            {error && (
              <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>
        </section>

        <section className="mx-5 mt-7 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-violet-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
              <ShieldCheck size={23} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Identidad ReportaRD
              </p>
              <h2 className="mt-1 font-bold">Ciudadano registrado</h2>
              <p className="mt-1 text-xs text-slate-500">
                Perfil conectado a la base de datos de ReportaRD.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
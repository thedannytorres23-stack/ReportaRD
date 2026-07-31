import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

const comunidades = [
  {
    id: 1,
    nombre: "Santiago Centro",
    categoria: "Comunidad local",
    descripcion:
      "Reportes, actividades y conversaciones sobre el centro de Santiago.",
    miembros: 3420,
    publicaciones: 184,
    ubicacion: "Santiago Centro",
    privada: false,
    verificada: true,
    iniciales: "SC",
    color: "from-blue-500 to-cyan-500",
    portada: "from-blue-950 via-slate-900 to-cyan-950",
  },
  {
    id: 2,
    nombre: "Los Jardines Unidos",
    categoria: "Sector",
    descripcion:
      "Vecinos trabajando juntos por espacios públicos más seguros y limpios.",
    miembros: 1280,
    publicaciones: 96,
    ubicacion: "Los Jardines",
    privada: false,
    verificada: true,
    iniciales: "LJ",
    color: "from-emerald-500 to-green-600",
    portada: "from-emerald-950 via-slate-900 to-green-950",
  },
  {
    id: 3,
    nombre: "Santiago Verde",
    categoria: "Medioambiente",
    descripcion:
      "Iniciativas ambientales, reciclaje y recuperación de áreas verdes.",
    miembros: 895,
    publicaciones: 73,
    ubicacion: "Santiago",
    privada: false,
    verificada: false,
    iniciales: "SV",
    color: "from-green-500 to-teal-500",
    portada: "from-green-950 via-slate-900 to-teal-950",
  },
  {
    id: 4,
    nombre: "Seguridad Vial RD",
    categoria: "Seguridad",
    descripcion:
      "Reportes y propuestas para mejorar las calles y reducir accidentes.",
    miembros: 2150,
    publicaciones: 142,
    ubicacion: "República Dominicana",
    privada: false,
    verificada: true,
    iniciales: "SR",
    color: "from-red-500 to-orange-500",
    portada: "from-red-950 via-slate-900 to-orange-950",
  },
  {
    id: 5,
    nombre: "Cienfuegos Comunitario",
    categoria: "Sector",
    descripcion:
      "Espacio para residentes, líderes y organizaciones de Cienfuegos.",
    miembros: 742,
    publicaciones: 61,
    ubicacion: "Cienfuegos",
    privada: true,
    verificada: false,
    iniciales: "CC",
    color: "from-violet-500 to-purple-600",
    portada: "from-violet-950 via-slate-900 to-purple-950",
  },
];

const publicacionesComunidad = [
  {
    id: 1,
    autor: "María Fernández",
    iniciales: "MF",
    verificado: true,
    tiempo: "Hace 12 min",
    contenido:
      "Este sábado tendremos una jornada comunitaria. Lleven guantes y muchas ganas de aportar.",
    reacciones: 36,
    comentarios: 9,
  },
  {
    id: 2,
    autor: "Laura Méndez",
    iniciales: "LM",
    verificado: true,
    tiempo: "Hace 1 h",
    contenido:
      "El reporte de la calle principal ya fue enviado. Gracias a quienes ayudaron a confirmarlo.",
    reacciones: 54,
    comentarios: 14,
  },
];

const miembros = [
  {
    id: 1,
    nombre: "Laura Méndez",
    usuario: "@lauramendez",
    iniciales: "LM",
    rol: "Moderadora",
    color: "from-emerald-500 to-blue-500",
  },
  {
    id: 2,
    nombre: "Carlos Ramírez",
    usuario: "@carlosrd",
    iniciales: "CR",
    rol: "Miembro",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 3,
    nombre: "María Fernández",
    usuario: "@mariaf",
    iniciales: "MF",
    rol: "Administradora",
    color: "from-violet-500 to-pink-500",
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

export default function CommunityDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const comunidad = comunidades.find(
    (elemento) => elemento.id === Number(id),
  );

  const [comunidadesUnidas, setComunidadesUnidas] = useState(
    obtenerComunidadesUnidas,
  );
  const [pestanaActiva, setPestanaActiva] = useState("feed");
  const [nuevoPost, setNuevoPost] = useState("");
  const clavePosts = `reportard_comunidad_posts_${id}`;

  const [postsLocales, setPostsLocales] = useState(() => {
    try {
      const guardados = localStorage.getItem(clavePosts);
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "reportard_comunidades_unidas",
      JSON.stringify(comunidadesUnidas),
    );
  }, [comunidadesUnidas]);

  useEffect(() => {
    localStorage.setItem(clavePosts, JSON.stringify(postsLocales));
  }, [clavePosts, postsLocales]);

  const unido = comunidad
    ? comunidadesUnidas.includes(comunidad.id)
    : false;

  const publicacionesVisibles = useMemo(
    () => [...postsLocales, ...publicacionesComunidad],
    [postsLocales],
  );

  if (!comunidad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="text-center">
          <Users size={42} className="mx-auto text-slate-700" />
          <h1 className="mt-4 text-xl font-bold">
            Comunidad no encontrada
          </h1>
          <button
            type="button"
            onClick={() => navigate("/comunidades")}
            className="mt-5 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold"
          >
            Volver a comunidades
          </button>
        </div>
      </div>
    );
  }

  const cambiarMembresia = () => {
    setComunidadesUnidas((actuales) =>
      actuales.includes(comunidad.id)
        ? actuales.filter((comunidadId) => comunidadId !== comunidad.id)
        : [...actuales, comunidad.id],
    );
  };

  const publicar = (evento) => {
    evento.preventDefault();
    const contenido = nuevoPost.trim();
    if (!contenido) return;

    setPostsLocales((actuales) => [
      {
        id: Date.now(),
        autor: "Danny Torres",
        iniciales: "DT",
        verificado: true,
        tiempo: "Ahora",
        contenido,
        reacciones: 0,
        comentarios: 0,
      },
      ...actuales,
    ]);
    setNuevoPost("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>
        {`
          @keyframes comunidadEntrada {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .comunidad-entrada { animation: none !important; }
          }
        `}
      </style>

      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f] pb-10">
        <header className="absolute left-1/2 top-0 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full bg-black/40 p-2.5 backdrop-blur transition active:scale-90"
          >
            <ArrowLeft size={21} />
          </button>

          <button
            type="button"
            className="rounded-full bg-black/40 p-2.5 text-slate-300 backdrop-blur transition hover:rotate-90"
          >
            <MoreHorizontal size={21} />
          </button>
        </header>

        <section>
          <div
            className={`relative h-48 overflow-hidden bg-gradient-to-br ${comunidad.portada}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />
          </div>

          <div className="px-5">
            <div className="relative z-10 -mt-12 flex items-end justify-between gap-3">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#06101f] bg-gradient-to-br ${comunidad.color} text-2xl font-bold shadow-xl`}
              >
                {comunidad.iniciales}
              </div>

              <button
                type="button"
                onClick={cambiarMembresia}
                className={`mb-1 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                  unido
                    ? "border border-white/10 bg-white/5 text-slate-300"
                    : "bg-violet-500 hover:bg-violet-400"
                }`}
              >
                {unido ? <UserCheck size={17} /> : <UserPlus size={17} />}
                {unido
                  ? "Miembro"
                  : comunidad.privada
                    ? "Solicitar"
                    : "Unirme"}
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{comunidad.nombre}</h1>
                {comunidad.verificada && (
                  <ShieldCheck
                    size={19}
                    fill="currentColor"
                    strokeWidth={3}
                    className="text-blue-400"
                  />
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  {comunidad.privada ? <Lock size={13} /> : <Globe2 size={13} />}
                  {comunidad.privada ? "Privada" : "Pública"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-red-400" />
                  {comunidad.ubicacion}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {comunidad.descripcion}
              </p>

              <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <span>
                  <strong className="text-white">
                    {comunidad.miembros + (unido ? 1 : 0)}
                  </strong>{" "}
                  miembros
                </span>
                <span>
                  <strong className="text-white">
                    {comunidad.publicaciones + postsLocales.length}
                  </strong>{" "}
                  publicaciones
                </span>
              </div>
            </div>
          </div>
        </section>

        <nav className="mt-6 grid grid-cols-3 border-b border-white/10 px-5">
          {[
            ["feed", "Publicaciones"],
            ["miembros", "Miembros"],
            ["info", "Información"],
          ].map(([idPestana, nombre]) => (
            <button
              type="button"
              key={idPestana}
              onClick={() => setPestanaActiva(idPestana)}
              className={`border-b-2 px-1 pb-3 text-xs font-medium transition ${
                pestanaActiva === idPestana
                  ? "border-violet-500 text-white"
                  : "border-transparent text-slate-500"
              }`}
            >
              {nombre}
            </button>
          ))}
        </nav>

        <main className="px-5 py-5">
          {pestanaActiva === "feed" && (
            <section className="space-y-4">
              {unido && (
                <form
                  onSubmit={publicar}
                  className="comunidad-entrada rounded-3xl border border-white/10 bg-white/[0.035] p-4"
                  style={{
                    animation: "comunidadEntrada 260ms ease-out both",
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 text-xs font-bold">
                      DT
                    </div>
                    <textarea
                      value={nuevoPost}
                      onChange={(evento) => setNuevoPost(evento.target.value)}
                      placeholder={`Publica en ${comunidad.nombre}...`}
                      rows={2}
                      className="min-w-0 flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={!nuevoPost.trim()}
                      className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-xs font-semibold transition active:scale-95 disabled:opacity-40"
                    >
                      <Send size={15} />
                      Publicar
                    </button>
                  </div>
                </form>
              )}

              {!unido && (
                <div className="rounded-2xl border border-violet-500/15 bg-violet-500/5 px-4 py-3 text-center text-xs text-violet-300">
                  Únete para publicar en esta comunidad.
                </div>
              )}

              {publicacionesVisibles.map((post, indice) => (
                <article
                  key={post.id}
                  className="comunidad-entrada rounded-3xl border border-white/10 bg-white/[0.035] p-4"
                  style={{
                    opacity: 0,
                    animation: `comunidadEntrada 260ms ease-out ${
                      indice * 60
                    }ms forwards`,
                  }}
                >
                  <header className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold">
                      {post.iniciales}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h2 className="truncate text-sm font-semibold">
                          {post.autor}
                        </h2>
                        {post.verificado && (
                          <CheckCircle2
                            size={14}
                            fill="currentColor"
                            strokeWidth={3}
                            className="text-blue-400"
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {post.tiempo}
                      </p>
                    </div>
                  </header>

                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {post.contenido}
                  </p>

                  <footer className="mt-4 flex items-center gap-5 border-t border-white/5 pt-3 text-xs text-slate-500">
                    <button type="button" className="flex items-center gap-1.5">
                      <UserCheck size={15} />
                      {post.reacciones}
                    </button>
                    <button type="button" className="flex items-center gap-1.5">
                      <MessageCircle size={15} />
                      {post.comentarios}
                    </button>
                    <button type="button" className="ml-auto">
                      <Share2 size={16} />
                    </button>
                  </footer>
                </article>
              ))}
            </section>
          )}

          {pestanaActiva === "miembros" && (
            <section className="space-y-3">
              {miembros.map((miembro, indice) => (
                <article
                  key={miembro.id}
                  className="comunidad-entrada flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                  style={{
                    opacity: 0,
                    animation: `comunidadEntrada 240ms ease-out ${
                      indice * 55
                    }ms forwards`,
                  }}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${miembro.color} text-xs font-bold`}
                  >
                    {miembro.iniciales}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold">
                      {miembro.nombre}
                    </h2>
                    <p className="text-xs text-slate-500">{miembro.usuario}</p>
                  </div>
                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] text-violet-300">
                    {miembro.rol}
                  </span>
                </article>
              ))}
            </section>
          )}

          {pestanaActiva === "info" && (
            <section
              className="comunidad-entrada rounded-3xl border border-white/10 bg-white/[0.035] p-5"
              style={{
                animation: "comunidadEntrada 260ms ease-out both",
              }}
            >
              <h2 className="font-bold">Acerca de esta comunidad</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {comunidad.descripcion}
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-400">
                <p className="flex items-center gap-2">
                  <Users size={17} className="text-violet-400" />
                  Comunidad creada por ciudadanos
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-green-400" />
                  Moderación comunitaria activa
                </p>
                <p className="flex items-center gap-2">
                  {comunidad.privada ? <Lock size={17} /> : <Globe2 size={17} />}
                  {comunidad.privada
                    ? "El acceso requiere aprobación"
                    : "Cualquier ciudadano puede unirse"}
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
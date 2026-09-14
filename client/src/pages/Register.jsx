import { useEffect, useRef, useState } from "react";

import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router";

import {
  iniciarSesionGoogle,
  registrarUsuario as registrarUsuarioAPI,
} from "../services/authService";

export default function Register({ onRegister }) {
  const navigate = useNavigate();

  const googleButtonRef = useRef(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    usuario: "",
    correo: "",
    contrasena: "",
  });

  const [mostrarContrasena, setMostrarContrasena] =
    useState(false);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] =
    useState(false);

  const guardarSesion = (respuesta) => {
    localStorage.setItem(
      "reportard_token",
      respuesta.token,
    );

    localStorage.setItem(
      "reportard_user",
      JSON.stringify(respuesta.usuario),
    );

    const perfilGuardado = {
      nombre: respuesta.usuario.nombre || "",
      usuario: respuesta.usuario.usuario || "",
      correo: respuesta.usuario.correo || "",
      foto: respuesta.usuario.foto || "",
      portada: respuesta.usuario.portada || "",
      bio:
        respuesta.usuario.biografia ||
        respuesta.usuario.bio ||
        "",
      ubicacion:
        respuesta.usuario.ubicacion ||
        "República Dominicana",
    };

    localStorage.setItem(
      "reportard_profile",
      JSON.stringify(perfilGuardado),
    );
  };

  const completarRegistro = (respuesta) => {
    guardarSesion(respuesta);

    if (typeof onRegister === "function") {
      onRegister();
    }

    navigate("/", { replace: true });
  };

  useEffect(() => {
    let intentos = 0;
    let intervalo;

    const prepararGoogle = () => {
      const google = window.google;

      if (!google?.accounts?.id) {
        intentos += 1;

        if (intentos >= 40) {
          clearInterval(intervalo);
        }

        return;
      }

      clearInterval(intervalo);

      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.error(
          "VITE_GOOGLE_CLIENT_ID no está configurado.",
        );
        return;
      }

      google.accounts.id.initialize({
        client_id: clientId,

        callback: async (respuestaGoogle) => {
          const credential =
            respuestaGoogle?.credential;

          if (!credential) {
            setError(
              "Google no pudo completar el acceso.",
            );
            return;
          }

          try {
            setCargandoGoogle(true);
            setError("");

            const respuesta =
              await iniciarSesionGoogle(credential);

            completarRegistro(respuesta);
          } catch (errorGoogle) {
            setError(
              errorGoogle.message ||
                "No se pudo continuar con Google.",
            );
          } finally {
            setCargandoGoogle(false);
          }
        },
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";

        google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left",
            width: 400,
          },
        );
      }
    };

    prepararGoogle();

    intervalo = setInterval(prepararGoogle, 150);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

  const actualizarCampo = (event) => {
    const { name, value } = event.target;

    setFormulario((datosActuales) => ({
      ...datosActuales,
      [name]: value,
    }));

    setError("");
  };

  const manejarRegistro = async (event) => {
    event.preventDefault();

    const nombre = formulario.nombre.trim();
    const usuario = formulario.usuario.trim();
    const correo = formulario.correo.trim();

    if (
      !nombre ||
      !usuario ||
      !correo ||
      !formulario.contrasena
    ) {
      setError("Completa todos los campos.");
      return;
    }

    if (
      !correo.includes("@") ||
      !correo.includes(".")
    ) {
      setError(
        "Introduce un correo electrónico válido.",
      );
      return;
    }

    if (usuario.includes(" ")) {
      setError(
        "El nombre de usuario no puede contener espacios.",
      );
      return;
    }

    if (usuario.length < 3) {
      setError(
        "El nombre de usuario debe tener al menos 3 caracteres.",
      );
      return;
    }

    if (formulario.contrasena.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    try {
      setCargando(true);
      setError("");

      const respuesta =
        await registrarUsuarioAPI({
          nombre,
          usuario,
          correo,
          contrasena: formulario.contrasena,
        });

      completarRegistro(respuesta);
    } catch (errorRegistro) {
      setError(
        errorRegistro.message ||
          "No se pudo crear la cuenta.",
      );
    } finally {
      setCargando(false);
    }
  };

  const bloqueado = cargando || cargandoGoogle;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-100px] h-80 w-80 rounded-full bg-blue-500/10 blur-[110px]" />

        <div className="absolute bottom-[-130px] right-[-100px] h-80 w-80 rounded-full bg-red-500/10 blur-[110px]" />

        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-[120px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8 sm:justify-center sm:py-12">
        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={bloqueado}
          className="mb-8 flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={19} />
          Volver
        </button>

        <section>
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="font-bold tracking-tight">
                  Reporta
                  <span className="text-red-500">
                    RD
                  </span>
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">
                  Comunidad ciudadana
                </p>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              Únete a ReportaRD
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Crea tu cuenta
            </h1>

            <p className="mt-3 max-w-sm leading-6 text-slate-400">
              Participa en tu comunidad, comparte lo
              que ocurre y ayuda a dar visibilidad a
              lo que importa.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold text-slate-300">
              Acceso rápido
            </p>

            <div
              className={`flex min-h-[44px] w-full items-center justify-center overflow-hidden rounded-full bg-white transition ${
                cargandoGoogle
                  ? "pointer-events-none opacity-60"
                  : ""
              }`}
            >
              <div
                ref={googleButtonRef}
                className="w-full"
              />
            </div>

            {cargandoGoogle && (
              <p className="mt-2 text-center text-xs text-slate-500">
                Conectando con Google...
              </p>
            )}
          </div>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-[11px] text-slate-500">
              o crea tu cuenta manualmente
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={manejarRegistro}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-xs font-semibold text-slate-300"
                >
                  Nombre y apellido
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formulario.nombre}
                    onChange={actualizarCampo}
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                    disabled={bloqueado}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-500/60 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="usuario"
                  className="mb-2 block text-xs font-semibold text-slate-300"
                >
                  Nombre de usuario
                </label>

                <div className="relative">
                  <AtSign
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    value={formulario.usuario}
                    onChange={actualizarCampo}
                    placeholder="ejemplo23"
                    autoComplete="username"
                    disabled={bloqueado}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-500/60 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="correo"
                  className="mb-2 block text-xs font-semibold text-slate-300"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    value={formulario.correo}
                    onChange={actualizarCampo}
                    placeholder="nombre@correo.com"
                    autoComplete="email"
                    disabled={bloqueado}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-500/60 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contrasena"
                  className="mb-2 block text-xs font-semibold text-slate-300"
                >
                  Contraseña
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="contrasena"
                    name="contrasena"
                    type={
                      mostrarContrasena
                        ? "text"
                        : "password"
                    }
                    value={formulario.contrasena}
                    onChange={actualizarCampo}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    disabled={bloqueado}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-500/60 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarContrasena(
                        (estado) => !estado,
                      )
                    }
                    disabled={bloqueado}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
                    aria-label={
                      mostrarContrasena
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarContrasena ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                  <CheckCircle2 size={13} />
                  Usa al menos 8 caracteres.
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-400">
              <input
                type="checkbox"
                required
                disabled={bloqueado}
                className="mt-1 accent-red-500"
              />

              <span>
                He leído la{" "}
                <button
                  type="button"
                  onClick={() =>
                    navigate("/privacidad")
                  }
                  className="font-medium text-slate-200 underline decoration-slate-600 underline-offset-2 transition hover:text-white"
                >
                  Política de Privacidad
                </button>{" "}
                y acepto participar de forma
                responsable en ReportaRD.
              </span>
            </label>

            <button
              type="submit"
              disabled={bloqueado}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/10 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando
                ? "Creando cuenta..."
                : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  ¿Ya tienes una cuenta?
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Vuelve y continúa donde lo dejaste.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                disabled={bloqueado}
                className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                Iniciar sesión
              </button>
            </div>
          </div>

          <p className="mt-7 text-center text-[10px] leading-4 text-slate-600">
            ReportaRD · Comunidad ciudadana de
            República Dominicana
          </p>
        </section>
      </main>
    </div>
  );
}
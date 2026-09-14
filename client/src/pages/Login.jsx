import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router";

import {
  iniciarSesion as iniciarSesionAPI,
  iniciarSesionGoogle,
} from "../services/authService";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [formulario, setFormulario] = useState({
    identificador: "",
    contrasena: "",
  });

  const [mostrarContrasena, setMostrarContrasena] =
    useState(false);

  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] =
    useState(false);

  const [error, setError] = useState("");

  const guardarSesion = (respuesta) => {
    const perfilGuardado = {
      nombre: respuesta.usuario.nombre,
      usuario: respuesta.usuario.usuario,
      correo: respuesta.usuario.correo,
      telefono: respuesta.usuario.telefono || "",
      foto: respuesta.usuario.foto || "",
      portada: respuesta.usuario.portada || "",
      bio: respuesta.usuario.biografia || "",
      ubicacion:
        respuesta.usuario.ubicacion ||
        "República Dominicana",
    };

    localStorage.setItem(
      "reportard_token",
      respuesta.token,
    );

    localStorage.setItem(
      "reportard_user",
      JSON.stringify(respuesta.usuario),
    );

    localStorage.setItem(
      "reportard_profile",
      JSON.stringify(perfilGuardado),
    );
  };

  const completarInicioSesion = (respuesta) => {
    guardarSesion(respuesta);

    if (typeof onLogin === "function") {
      onLogin();
    }

    navigate("/", { replace: true });
  };

  useEffect(() => {
    let cancelado = false;
    let intentos = 0;

    const MAX_INTENTOS = 40;

    const prepararGoogle = () => {
      if (cancelado) return;

      const google = window.google;

      if (!google?.accounts?.id) {
        intentos += 1;

        if (intentos < MAX_INTENTOS) {
          setTimeout(prepararGoogle, 150);
        }

        return;
      }

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
          if (!respuestaGoogle?.credential) {
            setError(
              "Google no devolvió una credencial válida.",
            );
            return;
          }

          try {
            setCargandoGoogle(true);
            setError("");

            const respuesta =
              await iniciarSesionGoogle(
                respuestaGoogle.credential,
              );

            completarInicioSesion(respuesta);
          } catch (errorGoogle) {
            setError(
              errorGoogle.message ||
                "No se pudo iniciar sesión con Google.",
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

    return () => {
      cancelado = true;
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

  const manejarInicioSesion = async (event) => {
    event.preventDefault();

    if (
      !formulario.identificador.trim() ||
      !formulario.contrasena.trim()
    ) {
      setError("Completa todos los campos.");
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

      const respuesta = await iniciarSesionAPI({
        identificador:
          formulario.identificador.trim(),
        contrasena: formulario.contrasena,
      });

      completarInicioSesion(respuesta);
    } catch (errorInicio) {
      setError(
        errorInicio.message ||
          "No se pudo iniciar sesión.",
      );
    } finally {
      setCargando(false);
    }
  };

  const ocupado = cargando || cargandoGoogle;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <main className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center overflow-hidden bg-[#07111f] px-6 py-10 sm:px-9">
        {/* Fondo ambiental */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-red-500/[0.07] blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/[0.05] blur-3xl"
        />

        <section className="relative z-10">
          {/* Marca */}
          <div className="mb-9">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-lg shadow-red-950/20">
                <ShieldCheck size={24} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Reporta
                  <span className="text-red-500">
                    RD
                  </span>
                </h1>

                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Comunidad ciudadana
                </p>
              </div>
            </div>

            <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-white">
              Bienvenido de nuevo
            </h2>

            <p className="mt-3 max-w-sm text-[15px] leading-6 text-slate-400">
              Conecta con tu comunidad, comparte lo que
              ocurre y ayuda a dar visibilidad a lo que
              importa.
            </p>
          </div>

          {/* Google */}
          <div>
            <p className="mb-3 text-sm font-medium text-slate-300">
              Acceso rápido
            </p>

            <div
              className={`relative flex min-h-[44px] w-full items-center justify-center overflow-hidden rounded-full bg-white ${
                ocupado
                  ? "pointer-events-none opacity-60"
                  : ""
              }`}
            >
              <div
                ref={googleButtonRef}
                className="flex w-full justify-center"
              />

              {cargandoGoogle && (
                <div className="absolute inset-0 flex items-center justify-center bg-white text-sm font-semibold text-slate-700">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  Verificando con Google...
                </div>
              )}
            </div>
          </div>

          {/* Separador */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.08]" />

            <span className="text-xs font-medium text-slate-600">
              o continúa con tu cuenta
            </span>

            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          {/* Login tradicional */}
          <form onSubmit={manejarInicioSesion}>
            <div>
              <label
                htmlFor="identificador"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Correo o nombre de usuario
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="identificador"
                  type="text"
                  name="identificador"
                  value={formulario.identificador}
                  onChange={actualizarCampo}
                  placeholder="correo@ejemplo.com o usuario"
                  autoComplete="username"
                  disabled={ocupado}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] py-3.5 pl-12 pr-4 text-[15px] text-white outline-none transition duration-200 placeholder:text-slate-600 hover:border-white/[0.14] focus:border-red-500/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="contrasena"
                className="mb-2 block text-sm font-medium text-slate-300"
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
                  type={
                    mostrarContrasena
                      ? "text"
                      : "password"
                  }
                  name="contrasena"
                  value={formulario.contrasena}
                  onChange={actualizarCampo}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  disabled={ocupado}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] py-3.5 pl-12 pr-12 text-[15px] text-white outline-none transition duration-200 placeholder:text-slate-600 hover:border-white/[0.14] focus:border-red-500/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarContrasena(
                      (estadoActual) =>
                        !estadoActual,
                    )
                  }
                  disabled={ocupado}
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-300 disabled:cursor-not-allowed"
                >
                  {mostrarContrasena ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm leading-5 text-red-300"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={ocupado}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-red-500 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-red-950/30 transition duration-200 hover:bg-red-400 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verificando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Registro */}
          <div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center gap-3">
              <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.08] text-emerald-400 sm:flex">
                <CheckCircle2 size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200">
                  ¿Primera vez en ReportaRD?
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Crea tu perfil y únete a la comunidad.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/registro")
                }
                disabled={ocupado}
                className="shrink-0 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] active:scale-95 disabled:opacity-50"
              >
                Crear cuenta
              </button>
            </div>
          </div>

          <p className="mt-7 text-center text-[11px] leading-5 text-slate-600">
            Al continuar aceptas las normas comunitarias
            y las políticas de ReportaRD.
          </p>
        </section>
      </main>
    </div>
  );
}
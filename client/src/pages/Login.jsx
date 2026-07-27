import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    correo: "",
    contraseña: "",
  });

  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [error, setError] = useState("");

  const actualizarCampo = (event) => {
    const { name, value } = event.target;

    setFormulario((datosActuales) => ({
      ...datosActuales,
      [name]: value,
    }));

    setError("");
  };

  const iniciarSesion = (event) => {
    event.preventDefault();

    if (!formulario.correo.trim() || !formulario.contraseña.trim()) {
      setError("Completa todos los campos.");
      return;
    }

    if (!formulario.correo.includes("@")) {
      setError("Introduce un correo electrónico válido.");
      return;
    }

    if (formulario.contraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    onLogin();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[#06101f] px-6 py-10">
        <section>
          <div className="mb-8">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
              <ShieldCheck size={29} />
            </div>

            <h1 className="text-3xl font-bold">
              Reporta<span className="text-red-500">RD</span>
            </h1>

            <h2 className="mt-5 text-2xl font-bold">
              Bienvenido de nuevo
            </h2>

            <p className="mt-2 leading-6 text-slate-400">
              Inicia sesión para participar, conectar con tu comunidad y dar
              seguimiento a tus reportes.
            </p>
          </div>

          <form onSubmit={iniciarSesion}>
            <div>
              <label
                htmlFor="correo"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="correo"
                  type="email"
                  name="correo"
                  value={formulario.correo}
                  onChange={actualizarCampo}
                  placeholder="nombre@correo.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-red-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="contraseña"
                  className="text-sm font-medium text-slate-300"
                >
                  Contraseña
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-red-400"
                >
                  ¿La olvidaste?
                </button>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="contraseña"
                  type={mostrarContraseña ? "text" : "password"}
                  name="contraseña"
                  value={formulario.contraseña}
                  onChange={actualizarCampo}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-red-500"
                />

                <button
                  type="button"
                  onClick={() => setMostrarContraseña((estado) => !estado)}
                  aria-label={
                    mostrarContraseña
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {mostrarContraseña ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-7 w-full rounded-2xl bg-red-500 px-6 py-4 font-semibold shadow-lg shadow-red-500/20 transition active:scale-[0.98]"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">¿Eres nuevo?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/registro")}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 font-semibold text-slate-200 transition active:scale-[0.98]"
          >
            Crear una cuenta
          </button>

          <p className="mt-7 text-center text-xs leading-5 text-slate-500">
            Al continuar aceptas las normas comunitarias y las políticas de
            ReportaRD.
          </p>
        </section>
      </main>
    </div>
  );
}
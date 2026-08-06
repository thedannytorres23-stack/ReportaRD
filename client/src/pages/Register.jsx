import { useState } from "react";
import {
  ArrowLeft,
  AtSign,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  registrarUsuario as registrarUsuarioAPI,
} from "../services/authService";

export default function Register({ onRegister }) {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    usuario: "",
    correo: "",
    telefono: "",
    contrasena: "",
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

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

    const camposIncompletos = Object.values(formulario).some(
      (campo) => !campo.trim(),
    );

    if (camposIncompletos) {
      setError("Completa todos los campos.");
      return;
    }

    if (!formulario.correo.includes("@")) {
      setError("Introduce un correo electrónico válido.");
      return;
    }

    if (formulario.usuario.includes(" ")) {
      setError(
        "El nombre de usuario no puede contener espacios.",
      );
      return;
    }

    if (formulario.usuario.length < 3) {
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

      const respuesta = await registrarUsuarioAPI({
        nombre: formulario.nombre.trim(),
        usuario: formulario.usuario.trim(),
        correo: formulario.correo.trim(),
        contrasena: formulario.contrasena,
      });

      const perfilGuardado = {
        nombre: respuesta.usuario.nombre,
        usuario: respuesta.usuario.usuario,
        correo: respuesta.usuario.correo,
        telefono: formulario.telefono.trim(),
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

      onRegister();
      navigate("/", { replace: true });
    } catch (errorRegistro) {
      setError(
        errorRegistro.message ||
          "No se pudo crear la cuenta.",
      );
    } finally {
      setCargando(false);
    }
  };

  const campos = [
    {
      id: "nombre",
      nombre: "nombre",
      tipo: "text",
      etiqueta: "Nombre y apellido",
      placeholder: "Tu nombre completo",
      icono: UserRound,
      autocompletar: "name",
    },
    {
      id: "usuario",
      nombre: "usuario",
      tipo: "text",
      etiqueta: "Nombre de usuario",
      placeholder: "Tu nombre de usuario",
      icono: AtSign,
      autocompletar: "username",
    },
    {
      id: "correo",
      nombre: "correo",
      tipo: "email",
      etiqueta: "Correo electrónico",
      placeholder: "nombre@correo.com",
      icono: Mail,
      autocompletar: "email",
    },
    {
      id: "telefono",
      nombre: "telefono",
      tipo: "tel",
      etiqueta: "Número de teléfono",
      placeholder: "809-000-0000",
      icono: Phone,
      autocompletar: "tel",
    },
    {
      id: "contrasena",
      nombre: "contrasena",
      tipo: "password",
      etiqueta: "Contraseña",
      placeholder: "Mínimo 8 caracteres",
      icono: LockKeyhole,
      autocompletar: "new-password",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto min-h-screen max-w-md bg-[#06101f] px-6 py-8">
        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={cargando}
          className="flex items-center gap-2 text-sm text-slate-400 disabled:opacity-60"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <section className="mt-8">
          <p className="text-sm font-semibold text-red-400">
            ÚNETE A REPORTARD
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Crea tu cuenta
          </h1>

          <p className="mt-3 leading-6 text-slate-400">
            Identifícate para participar, conectar con tu
            comunidad y publicar reportes responsables.
          </p>

          <form
            onSubmit={manejarRegistro}
            className="mt-8"
          >
            <div className="space-y-5">
              {campos.map(
                ({
                  id,
                  nombre,
                  tipo,
                  etiqueta,
                  placeholder,
                  icono: Icono,
                  autocompletar,
                }) => (
                  <div key={id}>
                    <label
                      htmlFor={id}
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      {etiqueta}
                    </label>

                    <div className="relative">
                      <Icono
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        id={id}
                        type={tipo}
                        name={nombre}
                        value={formulario[nombre]}
                        onChange={actualizarCampo}
                        placeholder={placeholder}
                        autoComplete={autocompletar}
                        disabled={cargando}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <label className="mt-6 flex items-start gap-3 text-sm leading-5 text-slate-400">
              <input
                type="checkbox"
                required
                disabled={cargando}
                className="mt-1 accent-red-500"
              />

              <span>
                Acepto las normas comunitarias y me comprometo
                a publicar información responsable.
              </span>
            </label>

            <button
              type="submit"
              disabled={cargando}
              className="mt-7 w-full rounded-2xl bg-red-500 px-6 py-4 font-semibold shadow-lg shadow-red-500/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando
                ? "Creando cuenta..."
                : "Crear cuenta"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
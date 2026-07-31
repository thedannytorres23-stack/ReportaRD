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

export default function Register({ onRegister }) {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    usuario: "",
    correo: "",
    telefono: "",
    contraseña: "",
  });

  const [error, setError] = useState("");

  const actualizarCampo = (event) => {
    const { name, value } = event.target;

    setFormulario((datosActuales) => ({
      ...datosActuales,
      [name]: value,
    }));

    setError("");
  };

  const registrarUsuario = (event) => {
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

    if (formulario.contraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    onRegister();
    navigate("/", { replace: true });
  };

  const campos = [
    {
      id: "nombre",
      nombre: "nombre",
      tipo: "text",
      etiqueta: "Nombre y apellido",
      placeholder: "Tu nombre completo",
      icono: UserRound,
    },
    {
      id: "usuario",
      nombre: "usuario",
      tipo: "text",
      etiqueta: "Nombre de usuario",
      placeholder: "Tu nombre de usuario",
      icono: AtSign,
    },
    {
      id: "correo",
      nombre: "correo",
      tipo: "email",
      etiqueta: "Correo electrónico",
      placeholder: "nombre@correo.com",
      icono: Mail,
    },
    {
      id: "telefono",
      nombre: "telefono",
      tipo: "tel",
      etiqueta: "Número de teléfono",
      placeholder: "809-000-0000",
      icono: Phone,
    },
    {
      id: "contraseña",
      nombre: "contraseña",
      tipo: "password",
      etiqueta: "Contraseña",
      placeholder: "Mínimo 6 caracteres",
      icono: LockKeyhole,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto min-h-screen max-w-md bg-[#06101f] px-6 py-8">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-sm text-slate-400"
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
            Identifícate para participar, conectar con tu comunidad y publicar
            reportes responsables.
          </p>

          <form onSubmit={registrarUsuario} className="mt-8">
            <div className="space-y-5">
              {campos.map(
                ({
                  id,
                  nombre,
                  tipo,
                  etiqueta,
                  placeholder,
                  icono: Icono,
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
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-red-500"
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            {error && (
              <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <label className="mt-6 flex items-start gap-3 text-sm leading-5 text-slate-400">
              <input
                type="checkbox"
                required
                className="mt-1 accent-red-500"
              />

              <span>
                Acepto las normas comunitarias y me comprometo a publicar
                información responsable.
              </span>
            </label>

            <button
              type="submit"
              className="mt-7 w-full rounded-2xl bg-red-500 px-6 py-4 font-semibold shadow-lg shadow-red-500/20 transition active:scale-[0.98]"
            >
              Crear cuenta
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
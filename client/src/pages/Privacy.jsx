import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:py-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <ShieldCheck size={24} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-400">
              ReportaRD
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Política de Privacidad
            </h1>
          </div>
        </div>

        <div className="space-y-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              1. Información que recopilamos
            </h2>
            <p className="leading-7 text-slate-300">
              ReportaRD puede recopilar información proporcionada por el usuario
              al crear una cuenta, como nombre, nombre de usuario, correo
              electrónico, foto de perfil y otros datos que el usuario decida
              añadir a su perfil.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              2. Inicio de sesión con Google
            </h2>
            <p className="leading-7 text-slate-300">
              Cuando una persona utiliza la opción de iniciar sesión con Google,
              ReportaRD puede recibir información básica autorizada por Google,
              como el nombre, correo electrónico, identificador de cuenta y foto
              de perfil.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              3. Cómo utilizamos la información
            </h2>
            <p className="leading-7 text-slate-300">
              Utilizamos la información para crear y administrar cuentas,
              identificar a los usuarios dentro de la plataforma, mostrar sus
              publicaciones y reportes, permitir interacciones sociales y
              mantener el funcionamiento general de ReportaRD.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              4. Contenido publicado por los usuarios
            </h2>
            <p className="leading-7 text-slate-300">
              Los usuarios pueden publicar reportes, publicaciones, comentarios,
              imágenes, videos y otra información dentro de la plataforma.
              Parte de este contenido puede ser visible para otros usuarios de
              ReportaRD.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              5. Almacenamiento y protección de datos
            </h2>
            <p className="leading-7 text-slate-300">
              ReportaRD utiliza servicios tecnológicos externos para operar la
              plataforma y almacenar información. Se aplican medidas razonables
              para proteger los datos y evitar accesos no autorizados.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              6. Compartir información
            </h2>
            <p className="leading-7 text-slate-300">
              ReportaRD no vende la información personal de sus usuarios. Los
              datos pueden ser procesados por servicios necesarios para el
              funcionamiento técnico de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              7. Control de la cuenta
            </h2>
            <p className="leading-7 text-slate-300">
              Los usuarios pueden modificar determinada información de su perfil
              desde la plataforma. También pueden dejar de utilizar ReportaRD en
              cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              8. Cambios en esta política
            </h2>
            <p className="leading-7 text-slate-300">
              Esta política puede actualizarse cuando ReportaRD incorpore nuevas
              funciones o cambie la forma en que gestiona la información.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">9. Contacto</h2>
            <p className="leading-7 text-slate-300">
              Para consultas relacionadas con privacidad o el uso de datos,
              puedes utilizar el correo de asistencia asociado oficialmente a
              ReportaRD.
            </p>
          </section>

          <div className="border-t border-white/10 pt-6">
            <p className="text-sm text-slate-500">
              Última actualización: septiembre de 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
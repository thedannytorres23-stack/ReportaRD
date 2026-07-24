import {
  ArrowLeft,
  Construction,
  Droplets,
  Ellipsis,
  Lightbulb,
  Recycle,
  Siren,
  Trash2,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router";

const categorias = [
  {
    nombre: "Infraestructura",
    descripcion: "Calles, aceras, puentes y señales",
    icono: Construction,
    color: "bg-red-500/15 text-red-400",
  },
  {
    nombre: "Alumbrado",
    descripcion: "Lámparas y postes averiados",
    icono: Lightbulb,
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    nombre: "Basura",
    descripcion: "Vertederos y acumulación de residuos",
    icono: Trash2,
    color: "bg-green-500/15 text-green-400",
  },
  {
    nombre: "Agua",
    descripcion: "Fugas y problemas de suministro",
    icono: Droplets,
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    nombre: "Transporte",
    descripcion: "Tránsito y transporte público",
    icono: Truck,
    color: "bg-violet-500/15 text-violet-400",
  },
  {
    nombre: "Medioambiente",
    descripcion: "Contaminación y áreas naturales",
    icono: Recycle,
    color: "bg-emerald-500/15 text-emerald-400",
  },
  {
    nombre: "Emergencia",
    descripcion: "Situaciones que requieren atención",
    icono: Siren,
    color: "bg-orange-500/15 text-orange-400",
  },
  {
    nombre: "Otro",
    descripcion: "Una situación diferente",
    icono: Ellipsis,
    color: "bg-slate-700 text-slate-300",
  },
];

export default function CreateReport() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 bg-[#06101f]">
        <header className="flex items-center gap-4 border-b border-white/10 px-5 py-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Volver al inicio"
            className="rounded-xl bg-white/5 p-2 text-slate-300"
          >
            <ArrowLeft size={23} />
          </button>

          <div>
            <p className="text-xs font-medium text-red-400">
              PASO 1 DE 4
            </p>

            <h1 className="text-lg font-bold">Crear reporte</h1>
          </div>
        </header>

        <main className="px-5 py-7">
          <h2 className="text-3xl font-bold leading-tight">
            ¿Qué deseas reportar?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Selecciona la categoría que mejor representa el problema.
          </p>

          <section className="mt-7 grid grid-cols-2 gap-3">
            {categorias.map(
              ({ nombre, descripcion, icono: Icono, color }) => (
                <button
                  type="button"
                  key={nombre}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition active:scale-[0.97] active:border-red-500/50"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icono size={22} />
                  </span>

                  <h3 className="mt-4 font-semibold">{nombre}</h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {descripcion}
                  </p>
                </button>
              ),
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
export default function Navbar() {
  return (
    <header className="border-b border-white/10 bg-slate-950">
      <nav className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
        <h1 className="text-xl font-bold text-white">
          Reporta<span className="text-red-500">RD</span>
        </h1>

        <button
          type="button"
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white"
        >
          Ingresar
        </button>
      </nav>
    </header>
  );
}
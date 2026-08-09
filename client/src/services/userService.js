const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const solicitar = async (ruta, token) => {
  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("No se pudo conectar con ReportaRD Backend.");
  }

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo completar la solicitud.");
  }

  return datos;
};

export const listarUsuarios = (token, busqueda = "") => {
  const parametros = new URLSearchParams();

  if (busqueda.trim()) {
    parametros.set("buscar", busqueda.trim());
  }

  const consulta = parametros.toString();
  return solicitar(`/users${consulta ? `?${consulta}` : ""}`, token);
};

export const obtenerUsuario = (usuarioId, token) => {
  return solicitar(`/users/${usuarioId}`, token);
};
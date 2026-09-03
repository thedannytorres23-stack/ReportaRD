const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

const solicitar = async (
  ruta,
  token,
  opciones = {},
) => {
  let respuesta;

  try {
    respuesta = await fetch(
      `${API_URL}${ruta}`,
      {
        ...opciones,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...opciones.headers,
        },
      },
    );
  } catch {
    throw new Error(
      "No se pudo conectar con ReportaRD Backend.",
    );
  }

  let datos;

  try {
    datos = await respuesta.json();
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta inválida.",
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        "No se pudo completar la solicitud.",
    );
  }

  return datos;
};

export const listarUsuarios = (
  token,
  busqueda = "",
) => {
  const parametros =
    new URLSearchParams();

  if (busqueda.trim()) {
    parametros.set(
      "buscar",
      busqueda.trim(),
    );
  }

  const consulta =
    parametros.toString();

  return solicitar(
    `/users${
      consulta ? `?${consulta}` : ""
    }`,
    token,
  );
};

export const obtenerUsuario = (
  usuarioId,
  token,
) => {
  return solicitar(
    `/users/${usuarioId}`,
    token,
  );
};

export const cambiarSeguimiento = (
  usuarioId,
  token,
) => {
  return solicitar(
    `/users/${usuarioId}/seguir`,
    token,
    {
      method: "PATCH",
    },
  );
};
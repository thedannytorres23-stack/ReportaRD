const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

const procesarRespuesta = async (respuesta) => {
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

const solicitar = async (
  ruta,
  token,
  opciones = {},
) => {
  try {
    const respuesta = await fetch(
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

    return procesarRespuesta(respuesta);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con ReportaRD Backend.",
      );
    }

    throw error;
  }
};

export const obtenerNotificaciones = (
  token,
) => {
  return solicitar(
    "/notifications",
    token,
  );
};

export const obtenerNotificacionesNoLeidas = (
  token,
) => {
  return solicitar(
    "/notifications/no-leidas",
    token,
  );
};

export const marcarNotificacionComoLeida = (
  token,
  notificacionId,
) => {
  return solicitar(
    `/notifications/${notificacionId}/leer`,
    token,
    {
      method: "PATCH",
    },
  );
};

export const marcarTodasLasNotificacionesComoLeidas = (
  token,
) => {
  return solicitar(
    "/notifications/leer-todas",
    token,
    {
      method: "PATCH",
    },
  );
};
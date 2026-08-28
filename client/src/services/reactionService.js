const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const procesarRespuesta = async (respuesta) => {
  let datos;

  try {
    datos = await respuesta.json();
  } catch (error) {
    throw new Error(
      "El servidor devolvió una respuesta inválida.",
      { cause: error },
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

export const obtenerReacciones = (
  token,
  tipoContenido,
  contenidoId,
) => {
  const parametros = new URLSearchParams({
    tipoContenido,
    contenidoId,
  });

  return solicitar(
    `/reactions?${parametros.toString()}`,
    token,
  );
};

export const reaccionarContenido = (
  token,
  tipoContenido,
  contenidoId,
  tipoReaccion,
) => {
  return solicitar("/reactions", token, {
    method: "POST",
    body: JSON.stringify({
      tipoContenido,
      contenidoId,
      tipoReaccion,
    }),
  });
};
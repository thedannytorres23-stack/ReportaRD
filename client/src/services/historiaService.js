const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const obtenerToken = () =>
  localStorage.getItem("reportard_token");

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
        "Ocurrió un problema con las historias.",
    );
  }

  return datos;
};

const peticion = async (ruta, opciones = {}) => {
  const token = obtenerToken();

  let respuesta;

  try {
    respuesta = await fetch(
      `${API_URL}/historias${ruta}`,
      {
        ...opciones,
        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),

          ...(opciones.headers || {}),
        },
      },
    );
  } catch {
    throw new Error(
      "No se pudo conectar con ReportaRD Backend.",
    );
  }

  return procesarRespuesta(respuesta);
};

export const obtenerHistorias = async () => {
  const datos = await peticion("");

  return datos.historias || [];
};

export const crearHistoria = async ({
  texto = "",
  mediaUrl = "",
  mediaTipo = null,
  tema = "azul",
  textoX = 50,
  textoY = 58,
}) => {
  const datos = await peticion("", {
    method: "POST",

    body: JSON.stringify({
      texto,
      mediaUrl,
      mediaTipo,
      tema,
      textoX,
      textoY,
    }),
  });

  return datos.historia;
};

export const registrarVistaHistoria = async (
  historiaId,
) => {
  return peticion(`/${historiaId}/vista`, {
    method: "POST",
  });
};

export const eliminarHistoria = async (
  historiaId,
) => {
  return peticion(`/${historiaId}`, {
    method: "DELETE",
  });
};
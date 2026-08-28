const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

import {
  obtenerReacciones,
  reaccionarContenido,
} from "../services/reactionService";



const procesarRespuesta = async (respuesta) => {
  let datos;

  try {
    datos = await respuesta.json();
  } catch (error) {
    throw new Error("El servidor devolvió una respuesta inválida.", {
      cause: error,
    });
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo completar la solicitud."
    );
  }

  return datos;
};

const solicitar = async (ruta, token, opciones = {}) => {
  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opciones.headers,
      },
    });

    return procesarRespuesta(respuesta);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con ReportaRD Backend."
      );
    }

    throw error;
  }
};

export const listarComentarios = (
  token,
  tipoContenido,
  contenidoId
) => {
  const parametros = new URLSearchParams({
    tipoContenido,
    contenidoId,
  });

  return solicitar(
    `/comments?${parametros.toString()}`,
    token
  );
};

export const crearComentario = (
  token,
  tipoContenido,
  contenidoId,
  contenido,
  respuestaA = null
) => {
  return solicitar("/comments", token, {
    method: "POST",
    body: JSON.stringify({
      tipoContenido,
      contenidoId,
      contenido,
      respuestaA,
    }),
  });
};

export const eliminarComentario = (
  token,
  comentarioId
) => {
  return solicitar(
    `/comments/${comentarioId}`,
    token,
    {
      method: "DELETE",
    }
  );
};
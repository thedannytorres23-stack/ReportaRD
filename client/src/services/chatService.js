const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const procesarRespuesta = async (respuesta) => {
  let datos;

  try {
    datos = await respuesta.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta inválida.");
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo completar la solicitud.",
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
        "No se pudo conectar con ReportaRD Backend.",
        { cause: error },
      );
    }

    throw error;
  }
};

export const listarConversaciones = (token) => {
  return solicitar("/chats", token);
};

export const obtenerConversacion = (conversacionId, token) => {
  return solicitar(`/chats/${conversacionId}`, token);
};

export const enviarMensaje = (
  conversacionId,
  contenido,
  token,
  respondeA = null,
) => {
  return solicitar(
    `/chats/${conversacionId}/mensajes`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        tipo: "texto",
        contenido,
        respondeA,
      }),
    },
  );
};

export const marcarMensajesComoLeidos = (
  conversacionId,
  token,
) => {
  return solicitar(
    `/chats/${conversacionId}/leidos`,
    token,
    {
      method: "PATCH",
    },
  );
};

export const crearChatPrivado = (usuarioId, token) => {
  return solicitar("/chats/privado", token, {
    method: "POST",
    body: JSON.stringify({ usuarioId }),
  });
};

export const crearGrupo = (datosGrupo, token) => {
  return solicitar("/chats/grupos", token, {
    method: "POST",
    body: JSON.stringify(datosGrupo),
  });
};

export const obtenerTotalMensajesNoLeidos = (token) => {
  return solicitar("/chats/no-leidos", token);
};
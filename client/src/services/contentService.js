const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

const procesarRespuesta = async (respuesta) => {
  let datos;

  try {
    datos = await respuesta.json();
  } catch (error) {
    throw new Error(
      "El servidor devolvió una respuesta inválida.",
      {
        cause: error,
      },
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
  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opciones.headers,
      },
    });
  } catch (error) {
    throw new Error(
      "No se pudo conectar con ReportaRD Backend.",
      {
        cause: error,
      },
    );
  }

  return procesarRespuesta(respuesta);
};

const crearConsulta = (busqueda = "") => {
  const parametros = new URLSearchParams();

  if (busqueda.trim()) {
    parametros.set("buscar", busqueda.trim());
  }

  const consulta = parametros.toString();

  return consulta ? `?${consulta}` : "";
};

export const subirArchivo = async (
  token,
  archivo,
) => {
  const formulario = new FormData();

  formulario.append("archivo", archivo);

  let respuesta;

  try {
    respuesta = await fetch(
      `${API_URL}/uploads`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formulario,
      },
    );
  } catch (error) {
    throw new Error(
      "No se pudo subir el archivo.",
      {
        cause: error,
      },
    );
  }

  return procesarRespuesta(respuesta);
};

export const listarPublicaciones = (
  token,
  busqueda = "",
) => {
  return solicitar(
    `/posts${crearConsulta(busqueda)}`,
    token,
  );
};

export const obtenerPublicacion = (
  token,
  publicacionId,
) => {
  return solicitar(
    `/posts/${publicacionId}`,
    token,
  );
};

export const crearPublicacion = (
  token,
  datos,
) => {
  return solicitar("/posts", token, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

export const editarPublicacion = (
  token,
  publicacionId,
  datos,
) => {
  return solicitar(
    `/posts/${publicacionId}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(datos),
    },
  );
};

export const eliminarPublicacion = (
  token,
  publicacionId,
) => {
  return solicitar(
    `/posts/${publicacionId}`,
    token,
    {
      method: "DELETE",
    },
  );
};

export const listarReportes = (
  token,
  busqueda = "",
) => {
  return solicitar(
    `/reports${crearConsulta(busqueda)}`,
    token,
  );
};

export const crearReporte = (
  token,
  datos,
) => {
  return solicitar("/reports", token, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

export const eliminarReporte = (
  token,
  reporteId,
) => {
  return solicitar(
    `/reports/${reporteId}`,
    token,
    {
      method: "DELETE",
    },
  );
};


export const confirmarReporte = (
  token,
  reporteId,
) => {
  return solicitar(
    `/reports/${reporteId}/confirmar`,
    token,
    {
      method: "POST",
    },
  );
};